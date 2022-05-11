const ASVersion = __AS_FULL_VERSION__;

import WebAssemblyCheck from './WebAssemblyCheck.js';

const scriptMap = {
    ASDecoderAudioAlawW: 'as-decoder-audio-alaw-wasm.js',
    ASDecoderAudioUlawW: 'as-decoder-audio-ulaw-wasm.js',
    ASDecoderAudioAacW: 'as-decoder-audio-aac-wasm.js',
    ASDecoderAudioG723W: 'as-decoder-audio-g723-wasm.js',
    ASDecoderAudioG726W: 'as-decoder-audio-g726-wasm.js',
    ASDecoderAudioG729W: 'as-decoder-audio-g729-wasm.js',
    ASDecoderVideoHevcW: 'as-decoder-video-hevc-wasm.js',
	ASDecoderVideoHevcSIMDW: 'as-decoder-video-hevc-simd-wasm.js',
	ASDecoderVideoHevcMTW: 'as-decoder-video-hevc-mt-wasm.js',
	ASDecoderVideoHevcSIMDMTW: 'as-decoder-video-hevc-simd-mt-wasm.js',
    ASVDecoderVideoAvcW: 'as-decoder-video-avc-wasm.js',
    ASDecoderVideoAvcSIMDW: 'as-decoder-video-avc-simd-wasm.js',
	ASDecoderVideoAvcMTW: 'as-decoder-video-avc-mt-wasm.js',
	ASDecoderVideoAvcSIMDMTW: 'as-decoder-video-avc-simd-mt-wasm.js',
	ASDecoderVideoAV1W: 'as-decoder-video-av1-wasm.js',
	ASDecoderVideoAV1SIMDW: 'as-decoder-video-av1-simd-wasm.js',
	ASDecoderVideoAV1MTW: 'as-decoder-video-av1-mt-wasm.js',
	ASDecoderVideoAV1SIMDMTW: 'as-decoder-video-av1-simd-mt-wasm.js',
};

class ASLoaderBase {
    constructor() {
        this.base = this.defaultBase();
    }

    defaultBase() {
        return undefined;
    }

    wasmSupported() {
        return WebAssemblyCheck.wasmSupported();
    }

    scriptForClass(className) {
        return scriptMap[className];
    }

    urlForClass(className) {
        let scriptName = this.scriptForClass(className);
        if(scriptName) {
            return this.urlForScript(scriptName);
        } else {
            throw new Error('asked for URL for unknown class ' + className);
        }
    }

    urlForScript(scriptName) {
        if (scriptName) {
			let base = this.base;
			if (base === undefined) {
				base = '';
			} else {
				base += '/';
			}
			return base + scriptName + '?version=' + encodeURIComponent(ASVersion);
		} else {
			throw new Error('asked for URL for unknown script ' + scriptName);
		}
    }

    loadClass(className, callback, options) {
        options = options || {};
        let global = this.getGlobal();
        let url = this.urlForClass(className);

        let classWrapper = (options) => {
            options = options || {};
            options.localFile = (filename) => {
                // Allow secondary resources like the .wasm payload
				// to be loaded by the emscripten code.
				if (filename.slice(0, 5) === 'data:') {
					// emscripten 1.37.25 loads memory initializers as data: URI
					return filename;
				} else {
					return this.urlForScript(filename);
				}
            };
            options.mainScriptUrlOrBlob = this.scriptForClass(className) + '?version=' + encodeURIComponent(ASVersion);
            // Note: these pseudoclasses should not use 'new',
			// which breaks in emscripten 1.38.10
			return global[className](options);
        };

        if(typeof global[className] === 'function') {
            // already loaded!
			callback(classWrapper);
        } else {
            this.loadScript(url, () => {
                callback(classWrapper);
            });
        }
    }
}

export default ASLoaderBase;

import ASProxyClass from './ASProxyClass.js';

class ASDecoderAudioProxy extends ASProxyClass({
	loadedMetadata: false,
	audioFormat: null,
	audioBuffer: null,
	cpuTime: 0
}) {
	init(callback) {
		this.proxy('init', [], callback);
	}

	processHeader(data, callback) {
		this.proxy('processHeader', [data], callback, [data]);
	}

	processAudio(data, callback) {
		this.proxy('processAudio', [data], callback, [data]);
	}

	close() {
		this.terminate();
	}
}

export default ASDecoderAudioProxy;
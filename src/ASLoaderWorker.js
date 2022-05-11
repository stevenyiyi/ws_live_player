/* global importScripts */

import ASLoaderBase from './ASLoaderBase.js';

class ASLoaderWorker extends ASLoaderBase {
    loadScript(src, callback) {
        importScripts(src);
        callback();
    }

    getGlobal() {
        return self;
    }
}

let ASLoader = new ASLoaderWorker();

export default ASLoader;
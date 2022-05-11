import ASWorkerSupport from './ASWorkerSupport.js';

let proxy = new ASWorkerSupport([
	'loadedMetadata',
	'audioFormat',
	'audioBuffer',
	'cpuTime'
], {
	init: function(_args, callback) {
		this.target.init(callback);
	},

	processHeader: function(args, callback) {
		this.target.processHeader(args[0], (ok) => {
			callback([ok]);
		});
	},

	processAudio: function(args, callback) {
		this.target.processAudio(args[0], (ok) => {
			callback([ok]);
		});
	}
});

export default proxy;
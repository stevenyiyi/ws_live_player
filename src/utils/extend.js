function extend(dest, src) {
	for (let prop in src) {
		// eslint-disable-next-line no-prototype-builtins
		if (src.hasOwnProperty(prop)) {
			dest[prop] = src[prop];
		}
	}
}

export default extend;
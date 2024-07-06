class Utils {
        static mixin(dest, source, copy) {
        let s;
        let empty = {};
        if (dest) {
            for (let name in source) {
                if (Object.prototype.hasOwnProperty.call(source, name)) {
                    s = source[name];
                    if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                        if (typeof dest[name] === 'object' && dest[name] !== null) {
                            dest[name] = Utils.mixin(dest[name], s, copy);
                        } else {
                            dest[name] = copy(s);
                        }
                    }
                }
            }
        }
        return dest;
    }

    static clone(src) {
        if (!src || typeof src !== 'object') {
            return src; // anything
        }
        if (src instanceof RegExp) {
            return new RegExp(src);
        }
        let r;
        if (src instanceof Array) {
            // array
            r = [];
            for (let i = 0, l = src.length; i < l; ++i) {
                if (i in src) {
                    r.push(Utils.clone(src[i]));
                }
            }
        } else {
            r = {};
        }
        return Utils.mixin(r, src, Utils.clone);
    }

    static addAditionalQueryParameterToUrl(url, params) {
        try {
            if (!params || params.length === 0) {
                return url;
            }

            let modifiedUrl = new URL(url);

            params.forEach((param) => {
                if (param.key && param.value) {
                    modifiedUrl.searchParams.set(param.key, param.value);
                }
            });

            return modifiedUrl.href;


        } catch (e) {
            return url;
        }
    }

    static parseHttpHeaders(headerStr) {
        let headers = {};
        if (!headerStr) {
            return headers;
        }

        // Trim headerStr to fix a MS Edge bug with xhr.getAllResponseHeaders method
        // which send a string starting with a "\n" character
        let headerPairs = headerStr.trim().split('\u000d\u000a');
        for (let i = 0, ilen = headerPairs.length; i < ilen; i++) {
            let headerPair = headerPairs[i];
            let index = headerPair.indexOf('\u003a\u0020');
            if (index > 0) {
                headers[headerPair.substring(0, index)] = headerPair.substring(index + 2);
            }
        }
        return headers;
    }

    static generateUuid() {
        let dt = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    static generateHashCode(string) {
        let hash = 0;

        if (string.length === 0) {
            return hash;
        }

        for (let i = 0; i < string.length; i++) {
            const chr = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    }

    static getHostFromUrl(urlString) {
        try {
            const url = new URL(urlString);

            return url.host
        } catch (e) {
            return null
        }
    }
}

export default Utils;
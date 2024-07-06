/* eslint-disable no-undef */
import FactoryMaker from "../core/FactoryMaker";
export function supportsMediaSource() {
    let hasManagedMediaSource = ('ManagedMediaSource' in window)
    let hasWebKit = ('WebKitMediaSource' in window);
    let hasMediaSource = ('MediaSource' in window);

    return (hasManagedMediaSource || hasWebKit || hasMediaSource);
}

function Capabilities() {

    let instance,
        settings,
        encryptedMediaSupported;

    function setup() {
        encryptedMediaSupported = false;
    }

    function setConfig(config) {
        if (!config) {
            return;
        }

        if (config.settings) {
            settings = config.settings;
        }
    }

    function isProtectionCompatible(previousStreamInfo, newStreamInfo) {
        if (!newStreamInfo) {
            return true;
        }
        return !(!previousStreamInfo.isEncrypted && newStreamInfo.isEncrypted);
    }

    /**
     * Returns whether Encrypted Media Extensions are supported on this
     * user agent
     *
     * @return {boolean} true if EME is supported, false otherwise
     */
    function supportsEncryptedMedia() {
        return encryptedMediaSupported;
    }

    /**
     *
     * @param {boolean} value
     */
    function setEncryptedMediaSupported(value) {
        encryptedMediaSupported = value;
    }

    /**
     * Check if a codec is supported by the MediaSource. We use the MediaCapabilities API or the MSE to check.
     * @param {object} config
     * @param {string} type
     * @return {Promise<boolean>}
     */
    function supportsCodec(config, type) {

        if (type !== "audio" && type !== "video") {
            return Promise.resolve(true);
        }

        if (_canUseMediaCapabilitiesApi(config, type)) {
            return _checkCodecWithMediaCapabilities(config, type);
        }

        return _checkCodecWithMse(config);
    }

    /**
     * MediaCapabilitiesAPI throws an error if one of the attribute is missing. We only use it if we have all required information.
     * @param {object} config
     * @param {string} type
     * @return {*|boolean|boolean}
     * @private
     */
    function _canUseMediaCapabilitiesApi(config, type) {
        return settings.get().streaming.capabilities.useMediaCapabilitiesApi && navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo && ((config.codec && type === "audio") || (type === "video" && config.codec && config.width && config.height && config.bitrate && config.framerate));
    }

    /**
     * Check codec support using the MSE
     * @param {object} config
     * @return {Promise<void> | Promise<boolean>}
     * @private
     */
    function _checkCodecWithMse(config) {
        return new Promise((resolve) => {
            if (!config || !config.codec) {
                resolve(false);
                return;
            }

            let codec = config.codec;
            if (config.width && config.height) {
                codec += ';width="' + config.width + '";height="' + config.height + '"';
            }

            // eslint-disable-next-line no-undef
            if ('ManagedMediaSource' in window && ManagedMediaSource.isTypeSupported(codec)) {
                resolve(true);
                return;
            } else if ('MediaSource' in window && MediaSource.isTypeSupported(codec)) {
                resolve(true);
                return;
            } else if ('WebKitMediaSource' in window && WebKitMediaSource.isTypeSupported(codec)) {
                resolve(true);
                return;
            }

            resolve(false);
        });

    }

    /**
     * Check codec support using the MediaCapabilities API
     * @param {object} config
     * @param {string} type
     * @return {Promise<boolean>}
     * @private
     */
    function _checkCodecWithMediaCapabilities(config, type) {
        return new Promise((resolve) => {

            if (!config || !config.codec) {
                resolve(false);
                return;
            }

            const configuration = {
                type: 'media-source'
            };

            configuration[type] = {};
            configuration[type].contentType = config.codec;
            configuration[type].width = config.width;
            configuration[type].height = config.height;
            configuration[type].bitrate = parseInt(config.bitrate);
            configuration[type].framerate = parseFloat(config.framerate);

            navigator.mediaCapabilities.decodingInfo(configuration)
                .then((result) => {
                    resolve(result.supported);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    /**
     * Check if a specific EssentialProperty is supported
     * @param {DescriptorType} ep
     * @return {boolean}
     */
    function supportsEssentialProperty(ep) {
        let supportedEssentialProps = settings.get().streaming.capabilities.supportedEssentialProperties;

        try {
            return ep.inArray(supportedEssentialProps);
        } catch (e) {
            return true;
        }
    }

    instance = {
        isProtectionCompatible,
        setConfig,
        setEncryptedMediaSupported,
        supportsCodec,
        supportsEncryptedMedia,
        supportsEssentialProperty,
        supportsMediaSource,
    };

    setup();

    return instance;
}

Capabilities.__asjs_factory_name = 'Capabilities';
export default FactoryMaker.getSingletonFactory(Capabilities);
import FactoryMaker from "../core/FactoryMaker";
import Logger from "../core/Logger";
import Utils from "../utils/Utils";
function Settings() {
  let instance;
  /**
   * @const {PlayerSettings} defaultSettings
   * @ignore
   */
  const defaultSettings = {
    Logger: {
      LogLevel: Logger.LOG_LEVEL_WARNING,
      dispatchEvent: false,
    },
    Streaming: {
      CacheSize: 500,
    },
    MSE: {
      CacheBufferDuration: 120,
    },
    Websocket: {
      WSUrl: "ws://10.201.2.17/ws_live",
      RTSPUrl:
        '"rtsp://10.201.2.17:5554/live/50011286121320007004?RecordTimeRange=1701705974_1701745628',
      ReConnecting: true,
    },
  };

  let settings = Utils.clone(defaultSettings);
  //Merge in the settings. If something exists in the new config that doesn't match the schema of the default config,
  //regard it as an error and log it.
  function mixinSettings(source, dest, path) {
    for (let n in source) {
      if (Object.prototype.hasOwnProperty.call(source, n)) {
        if (Object.prototype.hasOwnProperty.call(dest, n)) {
          if (
            typeof source[n] === "object" &&
            !(source[n] instanceof RegExp) &&
            !(source[n] instanceof Array) &&
            source[n] !== null
          ) {
            mixinSettings(source[n], dest[n], path.slice() + n + ".");
          } else {
            dest[n] = Utils.clone(source[n]);
          }
        } else {
          console.error("Settings parameter " + path + n + " is not supported");
        }
      }
    }
  }

  /**
   * Return the settings object. Don't copy/store this object, you won't get updates.
   * @func
   * @instance
   */
  function get() {
    return settings;
  }

  /**
   * @func
   * @instance
   * @param {object} settingsObj - This should be a partial object of the Settings.Schema type. That is, fields defined should match the path (e.g.
   * settingsObj.streaming.abr.autoSwitchBitrate.audio -> defaultSettings.streaming.abr.autoSwitchBitrate.audio). Where an element's path does
   * not match it is ignored, and a warning is logged.
   *
   * Use to change the settings object. Any new values defined will overwrite the settings and anything undefined will not change.
   * Implementers of new settings should add it in an approriate namespace to the defaultSettings object and give it a default value (that is not undefined).
   *
   */
  function update(settingsObj) {
    if (typeof settingsObj === "object") {
      mixinSettings(settingsObj, settings, "");
    }
  }

  /**
   * Resets the settings object. Everything is set to its default value.
   * @func
   * @instance
   *
   */
  function reset() {
    settings = Utils.clone(defaultSettings);
  }

  instance = {
    get,
    update,
    reset,
  };

  return instance;
}

Settings.__asjs_factory_name = 'Settings';
let factory = FactoryMaker.getSingletonFactory(Settings);
export default factory;

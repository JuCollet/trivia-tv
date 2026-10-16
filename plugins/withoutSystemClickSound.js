// Silences the Android system click: on Android TV, pressing OK on a focused
// view plays it on top of the app's own button sounds.
const { AndroidConfig, withAndroidStyles } = require('expo/config-plugins');

module.exports = function withoutSystemClickSound(config) {
  return withAndroidStyles(config, (cfg) => {
    cfg.modResults = AndroidConfig.Styles.assignStylesValue(cfg.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:soundEffectsEnabled',
      value: 'false',
    });
    return cfg;
  });
};

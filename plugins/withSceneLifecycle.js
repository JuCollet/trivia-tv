// Adopts the UIScene lifecycle, required by the iOS/tvOS 27 SDKs.
// Uses the ExpoAppSceneDelegate provided by Expo (ObjC class: EXExpoAppSceneDelegate).
const { withInfoPlist, withAppDelegate } = require('expo/config-plugins');

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: expected a Swift AppDelegate');
    }
    let src = cfg.modResults.contents;

    // 1. Conform to ExpoReactNativeFactoryProvider
    if (!src.includes('ExpoReactNativeFactoryProvider')) {
      src = src.replace(
        /class AppDelegate: ExpoAppDelegate \{/,
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
      );
    }

    // 2. Stop creating the window here: the scene delegate does it
    src = src.replace(
      /[ \t]*#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\n+/,
      ''
    );

    if (!src.includes('ExpoReactNativeFactoryProvider') || src.includes('UIWindow(frame:')) {
      throw new Error('withSceneLifecycle: unexpected AppDelegate, patch not applied');
    }
    cfg.modResults.contents = src;
    return cfg;
  });
}

module.exports = (config) => withSceneAppDelegate(withSceneManifest(config));

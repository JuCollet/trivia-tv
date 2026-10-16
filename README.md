# Chacun son truc : écran TV

L'écran de la partie, pour Android TV (APK installé sur le projecteur) et pour le navigateur.

## Lancer sur Apple TV

`npm run ios` lance toujours l'app sur un simulateur Apple TV, jamais sur un iPhone ou un iPad (`scripts/run-ios-tv.mjs`).

- Il prend le simulateur Apple TV déjà démarré s'il y en a un, sinon celui qui a le tvOS le plus récent (les modèles 4K d'abord).
- S'il n'y en a aucun, installe un runtime tvOS dans Xcode (*Settings → Components*) puis crée un simulateur Apple TV (*Window → Devices and Simulators*).
- Les options en plus passent à `expo run:ios` : `npm run ios -- --configuration Release`.
- Si `ios/` doit être généré, il l'est en version TV (`EXPO_TV=1`). Si `ios/` a été généré sans TV, relance `npm run prebuild:tv`.

## Version web

La même app tourne dans un navigateur, sur https://trivia.julco.dev/tv : un ordinateur branché sur la télé suffit.

- `npm run build:web` produit `dist/`, servi sous `/tv` (`experiments.baseUrl` dans `app.json`).
- La CI le publie sur Cloudflare Pages (projet `trivia-tv`) à chaque push sur `master`, et trivia-client relaie `/tv` vers ce projet.
- Les fichiers `*.web.ts(x)` remplacent leur version TV dans le navigateur : le clavier remplace la télécommande (flèches, Entrée, Échap pour le menu), l'intro attend un clic (un navigateur ne joue pas de son avant), les polices sont chargées au démarrage.
- Variables du dépôt (*Settings → Secrets and variables → Actions*) : `API_URL`, `JOIN_URL`, `CLOUDFLARE_ACCOUNT_ID` (variables), `CLOUDFLARE_API_TOKEN` (secret, permission *Cloudflare Pages: Edit*).

## Modèle Expo d'origine

This is an Expo project that can be built for Apple TV and Android TV targets, and also supports mobile and web platforms.

In addition to Expo SDK packages, this project uses

- the [React Native TV fork](https://github.com/react-native-tvos/react-native-tvos), which supports both phone (Android and iOS) and TV (Android TV and Apple TV) targets
- the [React Native TV config plugin](https://github.com/react-native-tvos/config-tv/tree/main/packages/config-tv) to allow Expo prebuild to modify the project's native files for TV builds

## 🚀 How to use

#### Creating a new project

- Create a project: `npx create-expo-app -e with-tv`
- `cd` into the project

- For TV development:

```sh
yarn
yarn prebuild:tv # Executes clean Expo prebuild with TV modifications
yarn ios # Build and run for Apple TV
yarn android # Build for Android TV
yarn web # Run the project on web from localhost
```
- For mobile development:

```sh
yarn
yarn prebuild # Executes Expo prebuild with no TV modifications
npx expo run:ios # Build and run for iOS (`yarn ios` always targets Apple TV)
yarn android # Build for Android mobile
yarn web # Run the project on web from localhost
```
> **_NOTE:_**
> Setting the environment variable `EXPO_TV=1` enables the `@react-native-tvos/config-tv` plugin to modify the project for TV.
> This can also be done by setting the parameter `isTV` to true in the `app.json`.

#### TV specific file extensions

This project contains an [example Metro configuration](./metro.config.js) that allows Metro to resolve application source files with TV-specific code, indicated by specific file extensions (`*.ios.tv.tsx`, `*.android.tv.tsx`, `*.tv.tsx`). This config is not enabled by default, since it will impact bundling performance, but is available for developers who need this capability.

#### TV specific app icons and banners

This project contains placeholder images for the Android TV banner and for Apple TV brand assets (app icon and top shelf images). The `config-tv` plugin will use these images to construct the required native image files and make the right modifications in project files. You can simply replace these images with your own app images. Note that for Apple TV, the images must be the exact sizes indicated.

#### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

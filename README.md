# Laserline Pro

A cross-platform laser level and spirit level app for iOS and Android, built with React Native and Expo. It turns your phone's camera and motion sensors into a leveling tool for hanging pictures, mounting shelves, and other alignment work.

## Features

- **Laser Level mode**: a live camera view with an AR crosshair that rotates as you tilt the device. It shows the tilt angle and has a draggable crosshair, flash/torch control and an optional grid overlay.
- **Spirit Level mode**: horizontal, vertical and circular bubble levels with X, Y and deviation readouts.
- **Sensor Dashboard**: live pitch, roll and angle, plus gyroscope, accelerometer, magnetometer, GPS (with your permission) and barometer readings on devices that have one.
- **Units and precision**: degrees, percent grade or radians, shown with 0–3 decimal places.
- **Settings are saved** between sessions with AsyncStorage.

See [ROADMAP.md](ROADMAP.md) for what's done, what's partly done and what's planned.

## Tech stack

| Concern         | Library                                            |
| --------------- | -------------------------------------------------- |
| App framework   | Expo SDK 54, React Native 0.81, React 19           |
| Language        | TypeScript                                         |
| Camera          | `expo-camera`                                      |
| Sensors         | `expo-sensors`, `expo-location`                    |
| Overlays        | `react-native-svg`                                 |
| Orientation     | `quaternion` (sensor fusion and smoothing)         |
| State           | React Context (`Sensor`, `Settings`, `Ruler`)      |
| Persistence     | `@react-native-async-storage/async-storage`        |

## Project structure

```
App.tsx                     Mode routing and top-level layout
src/
  config.ts                 Runtime config read from EXPO_PUBLIC_* env vars
  context/
    SensorContext.tsx       Sensor subscriptions, fusion, smoothing
    SettingsContext.tsx     User preferences + persistence
    RulerContext.tsx        Measurement points and units
  components/
    ModeSelectionScreen.tsx Landing screen
    CameraView.tsx          Camera feed for laser mode
    AROverlay.tsx           SVG laser crosshair and bubble levels
    SensorDashboard.tsx     Raw sensor readouts
    ControlPanel.tsx        Settings and on-screen controls
    MeasurementDisplay.tsx  Angle readout
    ModeSelector.tsx        Mode switcher
    PremiumModal.tsx        Support / donation sheet
docs/privacy-policy.md      Privacy policy template
```

## Getting started

### Prerequisites

- Node.js 20.19.4 or newer
- Xcode (for iOS) and/or Android Studio (for Android)
- A physical device is strongly recommended, because simulators don't provide real motion sensors

### Install and run

```bash
git clone <repository-url>
cd LaserLine-Pro
npm install

cp .env.example .env.local   # optional, see Configuration below

npm start          # Expo dev server
npm run ios        # build and run on iOS
npm run android    # build and run on Android
```

The project uses `expo-dev-client`, so run it in a development build rather than Expo Go. See [DEVELOPMENT_BUILD_GUIDE.md](DEVELOPMENT_BUILD_GUIDE.md).

## Configuration

Runtime values come from environment variables. None are required, and the app runs without them.

| Variable                     | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `EXPO_PUBLIC_SUPPORT_EMAIL`  | Address opened by **Contact Support** in settings         |
| `EXPO_PUBLIC_DONATION_URL`   | Link opened by the **Buy Me Coffee** button               |

Put them in `.env.local`, which is gitignored. `EXPO_PUBLIC_*` values are bundled into the app binary, so never put secrets in them.

### Publishing your own build

`app.json` ships with placeholder identifiers. Before building with EAS:

1. Change `ios.bundleIdentifier` and `android.package` to an ID you own (for example `com.yourname.laserlinepro`).
2. Run `eas init` to link the project to your Expo account. This adds `owner` and `extra.eas.projectId`.
3. Run `eas build --platform <ios|android> --profile production`.

## Permissions

| Permission | Used for                          | Required          |
| ---------- | --------------------------------- | ----------------- |
| Camera     | Laser Level mode                  | Only in that mode |
| Location   | GPS readings on the dashboard     | No                |
| Motion     | All leveling features             | Yes               |

All sensor and camera data stays on the device. Nothing is sent anywhere.

## Contributing

Contributions are welcome.

1. Fork the repository and create a branch off `main`.
2. Keep each PR to one feature or fix.
3. Test on a real device. Describe what you tested in the PR.
4. Open a pull request that explains what changed and how to verify it.

For larger changes, open an issue first so the approach can be agreed on.

## License

Released under the [MIT License](LICENSE).

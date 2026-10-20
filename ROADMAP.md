# Roadmap

This roadmap shows where Laserline Pro stands and where it's going. Items within each section are in rough priority order. Nothing here is a commitment to a date.

Legend: ✅ shipped · 🟡 partly done · 🔜 planned · 💡 under consideration

---

## Current state (v1.0.x)

### Leveling modes

| Feature | Status | Notes |
| --- | --- | --- |
| Laser Level: camera view with an AR crosshair that rotates with tilt | ✅ | |
| Laser Level: draggable crosshair position | ✅ | |
| Laser Level: flash / torch control | ✅ | |
| Laser Level: grid overlay toggle | ✅ | |
| Spirit Level: horizontal, vertical and circular bubbles | ✅ | |
| Spirit Level: X, Y and deviation readouts | ✅ | |
| Sensor Dashboard: pitch, roll, angle | ✅ | |
| Sensor Dashboard: gyroscope, accelerometer, magnetometer | ✅ | |
| Sensor Dashboard: GPS and barometer | ✅ | GPS needs location permission. Barometer only on supported hardware |

### Measurement and settings

| Feature | Status | Notes |
| --- | --- | --- |
| Units: degrees, percent grade, radians | ✅ | |
| Precision: 0–3 decimal places | ✅ | |
| Settings saved across sessions | ✅ | AsyncStorage |
| Quaternion sensor fusion with smoothing | ✅ | |
| Calibration | 🟡 | `calibrate()` / `resetCalibration()` only trigger haptics. No offset is stored |
| Sound feedback toggle | 🟡 | The setting exists, but no audio plays |
| Vibration feedback toggle | 🟡 | The setting exists, but haptics ignore it |
| Orientation lock toggle | 🟡 | The setting exists, but the screen orientation is never locked |
| Ruler / point measurement | 🟡 | `RulerContext` stores points, but pixel-to-cm conversion assumes an 8 cm screen width |
| Unused settings (`LaserlinesCount`, `autoCapture`) | 🟡 | Defined but not used. Either build them or remove them |

### Project and tooling

| Item | Status |
| --- | --- |
| Expo SDK 54 / React Native 0.81 / TypeScript | ✅ |
| EAS build profiles (development, preview, production) | ✅ |
| MIT license, README, roadmap | ✅ |
| Env-based config for support and donation links | ✅ |
| Committed lockfile | 🔜 |
| TypeScript strict mode | 🔜 |
| Automated tests | 🔜 |
| CI (typecheck, lint, test on each PR) | 🔜 |

---

## Next: v1.1, finish what's started

Goal: every control in the UI does what its label says.

- 🔜 **Real calibration**: capture a zero-offset quaternion on a flat surface, save it, and apply it to every reading. Add a "reset to factory" option.
- 🔜 **Respect the vibration setting** before any haptic call.
- 🔜 **Sound feedback**: play a tone when the device reaches level (within a configurable tolerance).
- 🔜 **Orientation lock** using `expo-screen-orientation`.
- 🔜 **Remove or build** the unused `LaserlinesCount` and `autoCapture` settings.
- 🔜 **Fix privacy policy date**: `docs/privacy-policy.md` contains a literal `$(date …)` placeholder.

## v1.2: quality and maintainability

- 🔜 Commit `package-lock.json` and pin dependency versions.
- 🔜 Turn on TypeScript `strict` mode and fix the resulting errors.
- 🔜 Unit tests for the sensor math (normalization, pitch/roll, unit conversion).
- 🔜 Component tests for `MeasurementDisplay` and `ControlPanel`.
- 🔜 GitHub Actions CI: typecheck and run tests on each PR.
- 🔜 Reorganize `src/` by feature (`laser/`, `spirit/`, `dashboard/`, `settings/`).
- 🔜 Accessibility pass: screen-reader labels on all controls, contrast checks, and spoken angle readouts.

## v2.0: new capabilities

- 🔜 **Level tolerance alerts**: a user-defined "close enough" threshold with visual, audio and haptic cues.
- 🔜 **Capture and share**: save a camera frame with the overlay and angle burned in.
- 🔜 **Multiple laser lines**: horizontal, vertical and cross modes, plus parallel line spacing.
- 🔜 **Angle hold / target angle**: lock a reference angle and show the deviation from it.
- 🔜 **Measurement history**: a log of recent readings with timestamps.
- 🔜 **Accurate ruler** using device-specific screen DPI instead of the current estimate.
- 🔜 **Localization**: start with English, French, German and Chinese.
- 🔜 **Dark / light theme** that follows the system setting.

## Ideas being considered

- 💡 ARKit / ARCore plane detection, to project lines onto real surfaces instead of a fixed screen overlay.
- 💡 Distance estimation with the device's depth or LiDAR sensor, where available.
- 💡 Tablet-optimized layouts.
- 💡 Apple Watch / Wear OS companion for remote readouts.
- 💡 Export readings as CSV.

---

## Contributing to the roadmap

Have an idea or want to pick up an item? Open an issue so it can be discussed and prioritized. PRs that close 🔜 items are especially welcome.

# LaserLine Pro - Professional Laser Level App

A modern, cross-platform laser level application built with React Native and Expo, featuring advanced AR overlays and precise measurement capabilities.

## Features

### 🎯 Three Main Modes

1. **Laser Level Mode**

   - Real-time laser line projection using AR overlay
   - Horizontal and vertical level indicators
   - Multiple laser lines for enhanced precision
   - Visual and haptic feedback when level

2. **Spirit Level Mode**

   - Traditional bubble level interface
   - Real-time bubble position tracking
   - Visual level indicators
   - Perfect for surface leveling
   - Level represents horizontal surface, plumb is vertical

3. **Clinometer Mode**
   - Precise angle measurement
   - Pitch and roll readings
   - Slope percentage calculation
   - Ideal for construction and surveying

### 🔧 Advanced Features

- **Device Calibration**: Automatic calibration for accurate measurements
- **Multiple Units**: Degrees, percentages, and radians
- **Precision Control**: Adjustable decimal places (0-2)
- **Grid Overlay**: Optional grid for better alignment
- **Orientation Lock**: Prevent accidental rotation
- **Photo Capture**: Save measurements with AR overlay
- **Haptic Feedback**: Vibration when level is achieved
- **Sound Alerts**: Audio feedback for level detection
- **Settings Persistence**: Save preferences across sessions

### 📱 Cross-Platform Support

- **iOS**: Full native camera and sensor integration
- **Android**: Optimized for Android devices
- **Responsive Design**: Works on phones and tablets

## Technical Implementation

### Architecture

- **React Native + Expo**: Cross-platform development
- **TypeScript**: Type-safe development
- **Context API**: State management for sensors and settings
- **Expo Camera**: Native camera integration
- **Expo Sensors**: Gyroscope and accelerometer access
- **React Native SVG**: Custom AR overlays
- **AsyncStorage**: Settings persistence

### Key Components

- `CameraView`: Main camera interface with AR overlay
- `AROverlay`: Custom SVG-based measurement overlays
- `SensorContext`: Real-time sensor data management
- `SettingsContext`: App preferences and configuration
- `ControlPanel`: User interface controls
- `MeasurementDisplay`: Real-time measurement readings
- `ModeSelector`: Mode switching interface

### Sensor Integration

- **Gyroscope**: 60fps updates for smooth tracking
- **Accelerometer**: Pitch and roll calculations
- **Calibration**: Offset compensation for accuracy
- **Level Detection**: Sub-degree precision

## Installation & Setup

### Prerequisites

- Node.js (v20.19.4 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd LaserLine Pro

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Usage

### Getting Started

1. **Launch the app** and grant camera permissions
2. **Choose your mode**: Laser, Spirit, or Clinometer
3. **Calibrate your device** by tapping the calibration button
4. **Start measuring** by pointing your device at surfaces

### Calibration

- Place your device on a known level surface
- Tap the calibration button (refresh icon)
- The app will automatically calibrate for accurate readings

### Settings

Access settings by tapping the gear icon to:

- Change measurement units
- Adjust precision
- Toggle sound/vibration
- Enable/disable grid overlay
- Lock orientation

## Use Cases

### Home Improvement

- Hanging pictures and shelves
- Installing appliances
- Leveling furniture
- DIY projects

### Construction

- Foundation leveling
- Wall alignment
- Pipe installation
- Structural measurements

### Interior Design

- Art placement
- Furniture arrangement
- Lighting installation
- Decorative elements

## Technical Specifications

- **Update Rate**: 60fps sensor updates
- **Precision**: Sub-degree accuracy
- **Calibration**: Automatic offset compensation
- **Compatibility**: iOS 13+, Android 8+
- **Permissions**: Camera, Storage, Sensors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by professional laser level tools
- Built with React Native and Expo
- Uses native device sensors for accuracy

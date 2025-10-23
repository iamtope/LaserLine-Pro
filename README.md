# Laserline Pro - Professional Laser Level App

A modern, cross-platform laser level application built with React Native and Expo, featuring advanced AR overlays and precise measurement capabilities.

## Features

### 🎯 Three Main Modes

1. **Laser Level Mode**

   - Real-time laser line projection using AR overlay
   - Horizontal and vertical level indicators
   - Rotating red crosshair that responds to device tilt
   - Professional laser level algorithm
   - Visual angle display
   - Perfect for alignment and leveling tasks

2. **Spirit Level Mode**

   - Traditional bubble level interface with three levels
   - Horizontal, vertical, and circular spirit levels
   - Real-time bubble position tracking
   - X, Y, and Deviation angle readings
   - Visual level indicators
   - Perfect for surface leveling and precision work

3. **Sensor Dashboard Mode**
   - Comprehensive sensor data monitoring
   - Real-time pitch, roll, and angle readings
   - Gyroscope, accelerometer, and magnetometer data
   - Location services integration
   - Barometer readings (when available)
   - Professional sensor analytics

### 🔧 Advanced Features

- **Auto-Calibration**: Automatic sensor calibration for accurate measurements
- **Multiple Units**: Degrees, percentages, and radians
- **Precision Control**: Adjustable decimal places (0-3)
- **Grid Overlay**: Optional grid for better alignment
- **Orientation Lock**: Prevent accidental rotation
- **Haptic Feedback**: Vibration feedback for interactions
- **Sound Alerts**: Audio feedback for level detection
- **Settings Persistence**: Save preferences across sessions
- **Professional UI**: Clean, modern interface design

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
- `AROverlay`: Custom SVG-based measurement overlays for laser and spirit modes
- `SensorDashboard`: Comprehensive sensor data display
- `SensorContext`: Real-time sensor data management with auto-calibration
- `SettingsContext`: App preferences and configuration
- `ControlPanel`: User interface controls and settings
- `MeasurementDisplay`: Real-time measurement readings (laser mode only)
- `ModeSelector`: Mode switching interface
- `ModeSelectionScreen`: Main mode selection interface
- `PremiumModal`: Support and donation interface

### Sensor Integration

- **Gyroscope**: 60fps updates for smooth tracking
- **Accelerometer**: Pitch and roll calculations with gravity normalization
- **Magnetometer**: Compass and heading data
- **Location Services**: GPS coordinates and altitude
- **Barometer**: Atmospheric pressure and relative altitude
- **Auto-Calibration**: Continuous sensor fusion and offset compensation
- **Level Detection**: Sub-degree precision with professional algorithms

## Installation & Setup

### Prerequisites

- Node.js (v20.19.4 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Laserline Pro

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
2. **Choose your mode**: Laser Level, Spirit Level, or Sensor Dashboard
3. **Auto-calibration** runs continuously for accurate readings
4. **Start measuring** by pointing your device at surfaces

### Calibration

- **Automatic**: The app continuously calibrates sensors for accuracy
- **No manual calibration needed**: Professional-grade auto-calibration system
- **Sensor Fusion**: Combines gyroscope and accelerometer data for precision

### Settings

Access settings by tapping the gear icon to:

- Change measurement units (degrees, percentage, radians)
- Adjust precision (0-3 decimal places)
- Toggle sound/vibration feedback
- Enable/disable grid overlay
- Lock orientation
- Contact support

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
- **Precision**: Sub-degree accuracy with professional algorithms
- **Calibration**: Automatic sensor fusion and offset compensation
- **Compatibility**: iOS 13+, Android 8+
- **Permissions**: Camera, Storage, Sensors, Location (optional)
- **Architecture**: React Native + Expo with TypeScript
- **Sensors**: Gyroscope, Accelerometer, Magnetometer, GPS, Barometer

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

## Release Notes

### Version 2.0 - Professional Laser Level Update

**New Features:**

- **Sensor Dashboard**: Comprehensive sensor monitoring with real-time data
- **Professional Laser Level**: Rotating crosshair with advanced tilt algorithms
- **Enhanced Spirit Level**: Three-level system (horizontal, vertical, circular)
- **Auto-Calibration**: Continuous sensor fusion for precision accuracy
- **Interactive Controls**: Draggable laser crosshair positioning
- **Modern UI**: Clean, professional interface design

**Improvements:**

- Sub-degree precision with professional algorithms
- Real-time X, Y, and Deviation angle readings
- Enhanced sensor integration (gyroscope, accelerometer, magnetometer, GPS, barometer)
- Improved calibration system with automatic offset compensation
- Better performance with 60fps sensor updates

**Supported Languages:**

- English
- French
- German
- Chinese

---

## AdMob Configuration

**iOS**

- App ID: ca-app-pub-6244419407881612~6898094220
- Ad Unit ID: ca-app-pub-6244419407881612/3652257433

**Android**

- App ID: ca-app-pub-6244419407881612~4333756041
- Ad Unit ID: ca-app-pub-6244419407881612/9091258706

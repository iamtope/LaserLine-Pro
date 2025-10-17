import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, SafeAreaView, Dimensions } from "react-native";
import { CameraView } from "./src/components/CameraView";
import { ControlPanel } from "./src/components/ControlPanel";
import { MeasurementDisplay } from "./src/components/MeasurementDisplay";
import { ModeSelector } from "./src/components/ModeSelector";
import { ModeSelectionScreen } from "./src/components/ModeSelectionScreen";
import { AROverlay } from "./src/components/AROverlay";
import { SensorProvider, useSensors } from "./src/context/SensorContext";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { RulerProvider } from "./src/context/RulerContext";

const { width, height } = Dimensions.get("window");

export type LevelingMode = "laser" | "spirit" | "clinometer" | "ruler";

// Main app content component that can use hooks
const MainAppContent: React.FC<{
  currentMode: LevelingMode;
  setCurrentMode: (mode: LevelingMode) => void;
  handleBackToSelection: () => void;
}> = ({ currentMode, setCurrentMode, handleBackToSelection }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [flashMode, setFlashMode] = useState<"on" | "off" | "auto" | "torch">(
    "off"
  );
  const cameraRef = useRef<any>(null);

  const { sensorData } = useSensors();
  const { settings } = useSettings();

  // Determine if current mode requires camera
  const requiresCamera = currentMode === "laser" || currentMode === "ruler";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />

      {/* Camera View with AR Overlay - only for modes that need it */}
      {requiresCamera && (
        <CameraView
          mode={currentMode}
          isCalibrating={isCalibrating}
          flashMode={flashMode}
          ref={cameraRef}
        />
      )}

      {/* Professional Background for non-camera modes */}
      {!requiresCamera && (
        <View style={styles.professionalBackground}>
          <View style={styles.professionalOverlay} />
          {/* Render overlay directly for non-camera modes */}
          <AROverlay
            mode={currentMode}
            sensorData={sensorData}
            settings={settings}
            isCalibrating={isCalibrating}
            onToggleCamera={() => {}}
          />
        </View>
      )}

      {/* Top Controls */}
      <View style={styles.topControls}>
        <ModeSelector
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onBackToSelection={handleBackToSelection}
        />
      </View>

      {/* Measurement Display */}
      <MeasurementDisplay
        mode={currentMode}
        style={styles.measurementDisplay}
      />

      {/* Bottom Control Panel */}
      <ControlPanel
        mode={currentMode}
        isCalibrating={isCalibrating}
        onCalibrationToggle={setIsCalibrating}
        cameraRef={cameraRef}
        flashMode={flashMode}
        onFlashModeChange={setFlashMode}
      />
    </SafeAreaView>
  );
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<LevelingMode | null>(null);

  const handleModeSelect = (mode: LevelingMode) => {
    setCurrentMode(mode);
  };

  const handleBackToSelection = () => {
    setCurrentMode(null);
  };

  // Show mode selection screen if no mode is selected
  if (currentMode === null) {
    return (
      <SettingsProvider>
        <SensorProvider>
          <RulerProvider>
            <ModeSelectionScreen onModeSelect={handleModeSelect} />
          </RulerProvider>
        </SensorProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <SensorProvider>
        <RulerProvider>
          <MainAppContent
            currentMode={currentMode}
            setCurrentMode={setCurrentMode}
            handleBackToSelection={handleBackToSelection}
          />
        </RulerProvider>
      </SensorProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  professionalBackground: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  professionalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topControls: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  measurementDisplay: {
    position: "absolute",
    top: height * 0.15,
    right: 20,
    zIndex: 10,
  },
});

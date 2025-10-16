import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, SafeAreaView, Dimensions } from "react-native";
import { CameraView } from "./src/components/CameraView";
import { ControlPanel } from "./src/components/ControlPanel";
import { MeasurementDisplay } from "./src/components/MeasurementDisplay";
import { ModeSelector } from "./src/components/ModeSelector";
import { SensorProvider } from "./src/context/SensorContext";
import { SettingsProvider } from "./src/context/SettingsContext";
import { RulerProvider } from "./src/context/RulerContext";

const { width, height } = Dimensions.get("window");

export type LevelingMode = "laser" | "spirit" | "clinometer" | "ruler";

export default function App() {
  const [currentMode, setCurrentMode] = useState<LevelingMode>("laser");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [flashMode, setFlashMode] = useState<"on" | "off" | "auto" | "torch">(
    "off"
  );
  const cameraRef = useRef<any>(null);

  return (
    <SettingsProvider>
      <SensorProvider>
        <RulerProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000" />

            {/* Camera View with AR Overlay */}
            <CameraView
              mode={currentMode}
              isCalibrating={isCalibrating}
              flashMode={flashMode}
              ref={cameraRef}
            />

            {/* Top Controls */}
            <View style={styles.topControls}>
              <ModeSelector
                currentMode={currentMode}
                onModeChange={setCurrentMode}
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

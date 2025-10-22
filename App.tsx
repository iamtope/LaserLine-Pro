import React, { useState, useRef } from "react";
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import { CameraView } from "./src/components/CameraView";
import { ControlPanel } from "./src/components/ControlPanel";
import { MeasurementDisplay } from "./src/components/MeasurementDisplay";
import { ModeSelector } from "./src/components/ModeSelector";
import { ModeSelectionScreen } from "./src/components/ModeSelectionScreen";
import { AROverlay } from "./src/components/AROverlay";
import { SensorDashboard } from "./src/components/SensorDashboard";
import { PremiumModal } from "./src/components/PremiumModal";

import { SensorProvider, useSensors } from "./src/context/SensorContext";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { RulerProvider } from "./src/context/RulerContext";

const { height } = Dimensions.get("window");

export type LevelingMode = "laser" | "spirit" | "dashboard";

// Prevent the splash screen from auto-hiding while we load fonts
SplashScreen.preventAutoHideAsync();

const MainAppContent: React.FC<{
  currentMode: LevelingMode;
  setCurrentMode: (mode: LevelingMode) => void;
  handleBackToSelection: () => void;
}> = ({ currentMode, setCurrentMode, handleBackToSelection }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [flashMode, setFlashMode] = useState<"on" | "off" | "auto" | "torch">("off");
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const cameraRef = useRef<any>(null);

  const { sensorData } = useSensors();
  const { settings } = useSettings();

  const requiresCamera = currentMode === "laser";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />

      {requiresCamera ? (
        <CameraView
          mode={currentMode}
          isCalibrating={isCalibrating}
          flashMode={flashMode}
          ref={cameraRef}
        />
      ) : (
        <View style={styles.professionalBackground}>
          <View style={styles.professionalOverlay} />
          {currentMode === "dashboard" ? (
            <SensorDashboard />
          ) : (
            <AROverlay
              mode={currentMode}
              sensorData={sensorData}
              settings={settings}
              isCalibrating={isCalibrating}
              onToggleCamera={() => {}}
            />
          )}
        </View>
      )}

      <View style={styles.topControls}>
        <ModeSelector
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onBackToSelection={handleBackToSelection}
          onCoffeePress={() => setShowCoffeeModal(true)}
        />
      </View>

      {currentMode !== "dashboard" && (
        <MeasurementDisplay mode={currentMode} style={styles.measurementDisplay} />
      )}

      {currentMode === "laser" && (
        <ControlPanel
          mode={currentMode}
          isCalibrating={isCalibrating}
          onCalibrationToggle={setIsCalibrating}
          cameraRef={cameraRef}
          flashMode={flashMode}
          onFlashModeChange={setFlashMode}
          onCoffeePress={() => setShowCoffeeModal(true)}
        />
      )}

      <PremiumModal visible={showCoffeeModal} onClose={() => setShowCoffeeModal(false)} />
    </SafeAreaView>
  );
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentMode, setCurrentMode] = useState<LevelingMode | null>(null);

  // ✅ Load fonts using Expo’s built-in loader (no manual .ttf paths)
  React.useEffect(() => {
    const loadResources = async () => {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn("Font load failed, continuing anyway:", e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    };
    loadResources();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  const handleModeSelect = (mode: LevelingMode) => setCurrentMode(mode);
  const handleBackToSelection = () => setCurrentMode(null);

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
  container: { flex: 1, backgroundColor: "#000" },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});

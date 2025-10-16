import React, { useRef, useEffect, useState, forwardRef } from "react";
import { StyleSheet, View, Dimensions, Alert } from "react-native";
import {
  CameraView as ExpoCameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import { AROverlay } from "./AROverlay";
import { LevelingMode } from "../../App";
import { useSensors } from "../context/SensorContext";
import { useSettings } from "../context/SettingsContext";

const { width, height } = Dimensions.get("window");

interface CameraViewProps {
  mode: LevelingMode;
  isCalibrating: boolean;
  flashMode?: "on" | "off" | "auto" | "torch";
}

export const CameraView = forwardRef<ExpoCameraView, CameraViewProps>(
  ({ mode, isCalibrating, flashMode = "off" }, ref) => {
    const cameraRef = useRef<ExpoCameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>("back");
    const { sensorData, calibrate } = useSensors();
    const { settings } = useSettings();

    useEffect(() => {
      if (isCalibrating) {
        calibrate();
      }
    }, [isCalibrating, calibrate]);

    useEffect(() => {
      if (permission && !permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "This app needs camera access to function properly.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Grant Permission", onPress: requestPermission },
          ]
        );
      }
    }, [permission, requestPermission]);

    if (!permission) {
      return <View style={styles.container} />;
    }

    if (!permission.granted) {
      return <View style={styles.container} />;
    }

    const toggleCameraFacing = () => {
      setFacing((current) => (current === "back" ? "front" : "back"));
    };

    return (
      <View style={styles.container}>
        <ExpoCameraView
          ref={ref || cameraRef}
          style={styles.camera}
          facing={facing}
          autofocus="on"
          flashMode={flashMode}
        />
        <AROverlay
          mode={mode}
          sensorData={sensorData}
          settings={settings}
          isCalibrating={isCalibrating}
          onToggleCamera={toggleCameraFacing}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
});

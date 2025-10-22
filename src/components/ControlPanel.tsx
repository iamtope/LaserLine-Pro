import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Text,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import { Platform } from "react-native";
import { LevelingMode } from "../../App";
import { useSensors } from "../context/SensorContext";
import {
  useSettings,
  UnitType,
  PrecisionType,
} from "../context/SettingsContext";
import { useRuler } from "../context/RulerContext";

const { width, height } = Dimensions.get("window");

interface ControlPanelProps {
  mode: LevelingMode;
  isCalibrating: boolean;
  onCalibrationToggle: (value: boolean) => void;
  cameraRef?: React.RefObject<any>;
  onCapture?: () => void;
  flashMode?: "on" | "off" | "auto" | "torch";
  onFlashModeChange?: (mode: "on" | "off" | "auto" | "torch") => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  isCalibrating,
  onCalibrationToggle,
  cameraRef,
  onCapture,
  flashMode = "off",
  onFlashModeChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const { calibrate, resetCalibration, isCalibrated } = useSensors();
  const { settings, updateSetting } = useSettings();
  const { clearAllMeasurements, setUnit, currentUnit, addPoint } = useRuler();

  const handleCapture = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission to access media library is required!"
        );
        return;
      }

      // Capture the camera view with overlay
      const imageUri = await captureCameraWithOverlay();

      if (imageUri) {
        // Save directly to gallery
        await MediaLibrary.saveToLibraryAsync(imageUri);
        Alert.alert("Success", "Photo captured and saved to gallery!");

        // Call the onCapture callback if provided
        if (onCapture) {
          onCapture();
        }
      } else {
        Alert.alert("Error", "Failed to capture photo");
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const captureCameraWithOverlay = async (): Promise<string | null> => {
    try {
      if (!cameraRef?.current) {
        console.error("Camera ref not available");
        return null;
      }

      // Capture the camera view as an image
      const imageUri = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (!imageUri) {
        console.error("Failed to capture camera image");
        return null;
      }

      // Create a measurement overlay image
      const overlayUri = await createMeasurementOverlay();

      if (overlayUri) {
        // Combine camera image with measurement overlay
        const finalImageUri = await combineImages(imageUri.uri, overlayUri);
        return finalImageUri;
      }

      return imageUri.uri;
    } catch (error) {
      console.error("Error capturing camera with overlay:", error);
      return null;
    }
  };

  const createMeasurementOverlay = async (): Promise<string | null> => {
    try {
      // Get sensor data and settings from component level
      const { sensorData } = useSensors();
      const { settings } = useSettings();

      // Create a simple text overlay with measurement data
      const measurementText = `iLaser Measurement Report
========================
Mode: ${mode.toUpperCase()}
Angle: ${sensorData.angle.toFixed(settings.precision)}°
Pitch: ${sensorData.pitch.toFixed(settings.precision)}°
Roll: ${sensorData.roll.toFixed(settings.precision)}°
Status: ${Math.abs(sensorData.angle) < 0.5 ? "LEVEL" : "NOT LEVEL"}
Timestamp: ${new Date().toLocaleString()}
Units: ${settings.unit}
Precision: ${settings.precision} decimal places`;

      // For now, we'll just return null as overlay creation is not essential
      // In a real implementation, you'd create an actual image overlay
      return null;
    } catch (error) {
      console.error("Error creating measurement overlay:", error);
      return null;
    }
  };

  const combineImages = async (
    cameraImageUri: string,
    overlayUri: string
  ): Promise<string | null> => {
    try {
      // For now, we'll just return the camera image
      // In a real implementation, you'd use an image processing library
      // to overlay the measurement data on the camera image
      return cameraImageUri;
    } catch (error) {
      console.error("Error combining images:", error);
      return null;
    }
  };

  const handleCalibration = () => {
    if (isCalibrating) {
      calibrate();
      onCalibrationToggle(false);
    } else {
      onCalibrationToggle(true);
    }
  };

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Settings</Text>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Unit Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Units</Text>
            {(["degrees", "percentage", "radians"] as UnitType[]).map(
              (unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.optionButton,
                    settings.unit === unit && styles.selectedOption,
                  ]}
                  onPress={() => updateSetting("unit", unit)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.unit === unit && styles.selectedOptionText,
                    ]}
                  >
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Precision Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Precision</Text>
            {([0, 1, 2] as PrecisionType[]).map((precision) => (
              <TouchableOpacity
                key={precision}
                style={[
                  styles.optionButton,
                  settings.precision === precision && styles.selectedOption,
                ]}
                onPress={() => updateSetting("precision", precision)}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.precision === precision &&
                      styles.selectedOptionText,
                  ]}
                >
                  {precision} decimal place{precision !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggle Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Sound</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting("soundEnabled", value)}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Vibration</Text>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) =>
                  updateSetting("vibrationEnabled", value)
                }
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Grid Overlay</Text>
              <Switch
                value={settings.gridEnabled}
                onValueChange={(value) => updateSetting("gridEnabled", value)}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Orientation Lock</Text>
              <Switch
                value={settings.orientationLocked}
                onValueChange={(value) =>
                  updateSetting("orientationLocked", value)
                }
              />
            </View>
          </View>

          {/* Support */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Support</Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={async () => {
                const email = "adamoabasstope@gmail.com";
                const subject = "Laserline Pro Support";
                const body = "Hi,\n\nI need help with Laserline Pro.\n\n";
                const url = `mailto:${email}?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(body)}`;
                try {
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert("Support", `Contact us at: ${email}`);
                  }
                } catch (e) {
                  Alert.alert("Support", `Contact us at: ${email}`);
                }
              }}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <>
      <View style={styles.container}>
        {/* Left side controls */}
        <View style={styles.leftControls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isCalibrating && styles.activeControlButton,
            ]}
            onPress={handleCalibration}
          >
            <Ionicons
              name={isCalibrating ? "checkmark" : "refresh"}
              size={24}
              color={isCalibrating ? "#000" : "#FFFFFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCapture}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center controls */}
        <View style={styles.centerControls}>
          <>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() =>
                updateSetting("gridEnabled", !settings.gridEnabled)
              }
            >
              <Ionicons
                name={settings.gridEnabled ? "grid" : "grid-outline"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() =>
                updateSetting("orientationLocked", !settings.orientationLocked)
              }
            >
              <Ionicons
                name={settings.orientationLocked ? "lock-closed" : "lock-open"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </>
        </View>

        {/* Right side controls */}
        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              if (onFlashModeChange) {
                const nextMode =
                  flashMode === "off"
                    ? "torch"
                    : flashMode === "torch"
                    ? "auto"
                    : "off";
                onFlashModeChange(nextMode);
              }
            }}
          >
            <Ionicons
              name={
                flashMode === "torch"
                  ? "flash-outline"
                  : flashMode === "auto"
                  ? "flash-outline"
                  : "flash-off-outline"
              }
              size={24}
              color={flashMode === "off" ? "#666666" : "#FFFFFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() =>
              updateSetting("soundEnabled", !settings.soundEnabled)
            }
          >
            <Ionicons
              name={
                settings.soundEnabled
                  ? "volume-high-outline"
                  : "volume-mute-outline"
              }
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {renderSettingsModal()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  leftControls: {
    flexDirection: "row",
    gap: 8,
  },
  centerControls: {
    flexDirection: "row",
    gap: 8,
  },
  rightControls: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    backgroundColor: "rgba(252, 252, 252, 0.7)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  activeControlButton: {
    backgroundColor: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
  },
  selectedOption: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  toggleLabel: {
    fontSize: 16,
    color: "#000",
  },
  supportButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  supportText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 10,
  },
});

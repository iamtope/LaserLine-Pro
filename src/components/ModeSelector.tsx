import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LevelingMode } from "../../App";

interface ModeSelectorProps {
  currentMode: LevelingMode;
  onModeChange: (mode: LevelingMode) => void;
  onBackToSelection?: () => void;
}

const modes: {
  key: LevelingMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "laser", label: "Laser", icon: "scan" },
  { key: "spirit", label: "Spirit", icon: "radio-button-off" },
  { key: "clinometer", label: "Clinometer", icon: "triangle" },
  { key: "ruler", label: "Ruler", icon: "resize" },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  onBackToSelection,
}) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      {onBackToSelection && (
        <TouchableOpacity style={styles.backButton} onPress={onBackToSelection}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Current Mode Display */}
      <View style={styles.currentModeContainer}>
        <Text style={styles.currentModeLabel}>
          {modes.find((m) => m.key === currentMode)?.label || currentMode}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    padding: 4,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  backLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  currentModeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  currentModeLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

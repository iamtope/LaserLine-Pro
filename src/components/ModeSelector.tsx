import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LevelingMode } from "../../App";

interface ModeSelectorProps {
  currentMode: LevelingMode;
  onModeChange: (mode: LevelingMode) => void;
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
}) => {
  return (
    <View style={styles.container}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.key}
          style={[
            styles.modeButton,
            currentMode === mode.key && styles.activeModeButton,
          ]}
          onPress={() => onModeChange(mode.key)}
        >
          <Ionicons
            name={mode.icon}
            size={24}
            color={currentMode === mode.key ? "#000" : "#FFFFFF"}
          />
          <Text
            style={[
              styles.modeLabel,
              currentMode === mode.key && styles.activeModeLabel,
            ]}
          >
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    padding: 4,
    justifyContent: "space-around",
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  activeModeButton: {
    backgroundColor: "#FFFFFF",
  },
  modeLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  activeModeLabel: {
    color: "#000",
  },
});

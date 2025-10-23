import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LevelingMode } from "../../App";

interface ModeSelectorProps {
  currentMode: LevelingMode;
  onModeChange: (mode: LevelingMode) => void;
  onBackToSelection?: () => void;
  onCoffeePress?: () => void;
}

const modes: {
  key: LevelingMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "laser", label: "Laser", icon: "scan-outline" },
  { key: "spirit", label: "Spirit", icon: "radio-button-off" },
  { key: "dashboard", label: "Dashboard", icon: "analytics-outline" },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  onBackToSelection,
  onCoffeePress,
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

      {/* Coffee Button - Top Right */}
      {onCoffeePress && (
        <TouchableOpacity style={styles.coffeeButton} onPress={onCoffeePress}>
          <Ionicons name="cafe" size={24} color="black" />
        </TouchableOpacity>
      )}
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  currentModeLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  coffeeButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LevelingMode } from "../../App";

const { width, height } = Dimensions.get("window");

interface ModeSelectionScreenProps {
  onModeSelect: (mode: LevelingMode) => void;
}

export const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({
  onModeSelect,
}) => {
  const modes = [
    {
      id: "laser" as LevelingMode,
      title: "Laser Level",
      description: "Precision laser crosshair for alignment",
      icon: "flashlight" as const,
      color: "#FF6B6B",
      requiresCamera: true,
    },
    {
      id: "spirit" as LevelingMode,
      title: "Spirit Level",
      description: "Traditional bubble levels with multiple orientations",
      icon: "radio-button-off" as const,
      color: "#4ECDC4",
      requiresCamera: false,
    },
    {
      id: "clinometer" as LevelingMode,
      title: "Clinometer",
      description: "Measure angles and inclinations precisely",
      icon: "analytics" as const,
      color: "#45B7D1",
      requiresCamera: false,
    },
    {
      id: "ruler" as LevelingMode,
      title: "AR Ruler",
      description: "Measure distances using augmented reality",
      icon: "resize" as const,
      color: "#96CEB4",
      requiresCamera: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LaserLine Pro</Text>
        <Text style={styles.subtitle}>Professional Leveling Tools</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeCard, { borderLeftColor: mode.color }]}
            onPress={() => onModeSelect(mode.id)}
            activeOpacity={0.8}
          >
            <View style={styles.modeHeader}>
              <View
                style={[styles.iconContainer, { backgroundColor: mode.color }]}
              >
                <Ionicons name={mode.icon} size={32} color="#FFFFFF" />
              </View>
              <View style={styles.cameraIndicator}>
                <Ionicons
                  name={mode.requiresCamera ? "camera" : "phone-portrait"}
                  size={16}
                  color={mode.requiresCamera ? "#FF6B6B" : "#4ECDC4"}
                />
              </View>
            </View>

            <Text style={styles.modeTitle}>{mode.title}</Text>
            <Text style={styles.modeDescription}>{mode.description}</Text>

            <View style={styles.modeFooter}>
              <Text style={[styles.modeType, { color: mode.color }]}>
                {mode.requiresCamera ? "Camera Mode" : "Sensor Mode"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Select a mode to begin precise leveling and measurement
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modeCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIndicator: {
    backgroundColor: "#333333",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
    marginBottom: 16,
  },
  modeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeType: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
  },
});

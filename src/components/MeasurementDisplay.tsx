import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { LevelingMode } from "../../App";
import { SensorData } from "../context/SensorContext";
import { useSettings } from "../context/SettingsContext";
import { useSensors } from "../context/SensorContext";
import { useRuler } from "../context/RulerContext";

interface MeasurementDisplayProps {
  mode: LevelingMode;
  style?: ViewStyle;
}

export const MeasurementDisplay: React.FC<MeasurementDisplayProps> = ({
  mode,
  style,
}) => {
  const { sensorData } = useSensors();
  const { settings } = useSettings();
  const { measurements, currentUnit, clearAllMeasurements } = useRuler();

  const formatValue = (value: number): string => {
    switch (settings.unit) {
      case "degrees":
        return `${value.toFixed(settings.precision)}°`;
      case "percentage":
        return `${(Math.tan((value * Math.PI) / 180) * 100).toFixed(
          settings.precision
        )}%`;
      case "radians":
        return `${((value * Math.PI) / 180).toFixed(settings.precision)} rad`;
      default:
        return `${value.toFixed(settings.precision)}°`;
    }
  };

  const renderLaserMeasurements = () => (
    <View style={styles.measurementContainer}>
      <View style={styles.measurementRow}>
        <Text style={styles.measurementLabel}>Angle:</Text>
        <Text
          style={[
            styles.measurementValue,
            { color: sensorData.isLevel ? "#00FF00" : "#FF0000" },
          ]}
        >
          {formatValue(sensorData.angle)}
        </Text>
      </View>
      <View style={styles.measurementRow}>
        <Text style={styles.measurementLabel}>Pitch:</Text>
        <Text style={styles.measurementValue}>
          {formatValue(sensorData.pitch)}
        </Text>
      </View>
      <View style={styles.measurementRow}>
        <Text style={styles.measurementLabel}>Roll:</Text>
        <Text style={styles.measurementValue}>
          {formatValue(sensorData.roll)}
        </Text>
      </View>
    </View>
  );

  const renderMeasurements = () => {
    switch (mode) {
      case "laser":
        return renderLaserMeasurements();
      case "spirit":
        return null;
      default:
        return null;
    }
  };

  return <View style={[styles.container, style]}>{renderMeasurements()}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
  },
  measurementContainer: {
    gap: 8,
  },
  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  measurementLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  measurementValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

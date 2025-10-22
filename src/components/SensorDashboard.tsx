import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSensors } from "../context/SensorContext";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

interface SensorCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit: string;
  color: string;
  trend?: "up" | "down" | "stable";
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon,
  value,
  unit,
  color,
  trend,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <Ionicons name="trending-up-outline" size={16} color="#4CAF50" />
        );
      case "down":
        return (
          <Ionicons name="trending-down-outline" size={16} color="#F44336" />
        );
      default:
        return <Ionicons name="remove-outline" size={16} color="#9E9E9E" />;
    }
  };

  return (
    <Animated.View style={[styles.sensorCard, { opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          {trend && getTrendIcon()}
        </View>
      </View>
      <View style={styles.cardValueContainer}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
    </Animated.View>
  );
};

export const SensorDashboard: React.FC = () => {
  const { sensorData } = useSensors();
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    // Check existing permissions
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status === "granted");
      } catch (error) {
        setLocationPermission(false);
      }
    })();
  }, []);

  // Format values for display
  const formatValue = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const formatCoordinate = (value: number) => {
    console.log("Formatting coordinate:", value);
    return value.toFixed(6);
  };

  const formatHeading = (heading: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return `${formatValue(heading, 1)}° ${directions[index]}`;
  };

  const formatSpeed = (speed: number) => {
    if (speed < 0.1) return "0.0";
    return formatValue(speed * 3.6, 1); // Convert m/s to km/h
  };

  const formatPressure = (pressure: number) => {
    return formatValue(pressure, 1);
  };

  const formatAltitude = (altitude: number) => {
    return formatValue(altitude, 1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        // Add padding to account for top navigation
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Motion Sensors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Motion Sensors</Text>
          <View style={styles.cardGrid}>
            <SensorCard
              title="Accelerometer X"
              icon="phone-portrait"
              value={formatValue(sensorData.accelerometer.x)}
              unit="m/s²"
              color="#2196F3"
            />
            <SensorCard
              title="Accelerometer Y"
              icon="phone-portrait"
              value={formatValue(sensorData.accelerometer.y)}
              unit="m/s²"
              color="#2196F3"
            />
            <SensorCard
              title="Accelerometer Z"
              icon="phone-portrait"
              value={formatValue(sensorData.accelerometer.z)}
              unit="m/s²"
              color="#2196F3"
            />
            <SensorCard
              title="Gyroscope X"
              icon="refresh"
              value={formatValue(sensorData.gyroscope.x)}
              unit="rad/s"
              color="#FF9800"
            />
            <SensorCard
              title="Gyroscope Y"
              icon="refresh"
              value={formatValue(sensorData.gyroscope.y)}
              unit="rad/s"
              color="#FF9800"
            />
            <SensorCard
              title="Gyroscope Z"
              icon="refresh"
              value={formatValue(sensorData.gyroscope.z)}
              unit="rad/s"
              color="#FF9800"
            />
          </View>
        </View>

        {/* Orientation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧭 Device Orientation</Text>
          <View style={styles.cardGrid}>
            <SensorCard
              title="Pitch"
              icon="trending-up"
              value={formatValue(sensorData.eulerAngles.pitch)}
              unit="°"
              color="#4CAF50"
            />
            <SensorCard
              title="Roll"
              icon="trending-up"
              value={formatValue(sensorData.eulerAngles.roll)}
              unit="°"
              color="#4CAF50"
            />
            <SensorCard
              title="Yaw"
              icon="trending-up"
              value={formatValue(sensorData.eulerAngles.yaw)}
              unit="°"
              color="#4CAF50"
            />
            <SensorCard
              title="Magnetometer X"
              icon="magnet"
              value={formatValue(sensorData.magnetometer.x)}
              unit="μT"
              color="#9C27B0"
            />
            <SensorCard
              title="Magnetometer Y"
              icon="magnet"
              value={formatValue(sensorData.magnetometer.y)}
              unit="μT"
              color="#9C27B0"
            />
            <SensorCard
              title="Magnetometer Z"
              icon="magnet"
              value={formatValue(sensorData.magnetometer.z)}
              unit="μT"
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Location & Navigation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & Navigation</Text>
          <View style={styles.cardGrid}>
            <SensorCard
              title="Latitude"
              icon="location"
              value={formatCoordinate(sensorData.location.latitude)}
              unit="°"
              color="#E91E63"
            />
            <SensorCard
              title="Longitude"
              icon="location"
              value={formatCoordinate(sensorData.location.longitude)}
              unit="°"
              color="#E91E63"
            />
            <SensorCard
              title="Altitude"
              icon="arrow-up"
              value={formatAltitude(sensorData.location.altitude)}
              unit="m"
              color="#E91E63"
            />
            <SensorCard
              title="Heading"
              icon="compass"
              value={formatHeading(sensorData.heading)}
              unit=""
              color="#607D8B"
            />
            <SensorCard
              title="Speed"
              icon="speedometer"
              value={formatSpeed(sensorData.speed)}
              unit="km/h"
              color="#607D8B"
            />
            <SensorCard
              title="Accuracy"
              icon="checkmark-circle-outline"
              value={formatValue(sensorData.location.accuracy)}
              unit="m"
              color="#607D8B"
            />
          </View>
        </View>

        {/* Environmental Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Environmental</Text>
          <View style={styles.cardGrid}>
            <SensorCard
              title="Barometric Pressure"
              icon="cloud"
              value={
                sensorData.barometer.pressure > 0
                  ? formatPressure(sensorData.barometer.pressure)
                  : "N/A"
              }
              unit="hPa"
              color="#00BCD4"
            />
            <SensorCard
              title="Relative Altitude"
              icon="arrow-up"
              value={
                sensorData.barometer.relativeAltitude !== 0
                  ? formatAltitude(sensorData.barometer.relativeAltitude)
                  : "N/A"
              }
              unit="m"
              color="#00BCD4"
            />
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 System Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Ionicons
                name={
                  locationPermission
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={20}
                color={locationPermission ? "#4CAF50" : "#F44336"}
              />
              <Text style={styles.statusText}>Location Permission</Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.statusText}>Motion Sensors</Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.statusText}>Orientation Sensors</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100, // Add extra padding for top navigation
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 15,
    paddingLeft: 5,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sensorCard: {
    width: (width - 50) / 2,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E0E0E0",
    flex: 1,
  },
  cardValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 6,
  },
  cardUnit: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  statusContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: "#E0E0E0",
    marginLeft: 12,
  },
});

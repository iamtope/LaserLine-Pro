import React from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import Svg, {
  Line,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { LevelingMode } from "../../App";
import { SensorData } from "../context/SensorContext";
import { AppSettings } from "../context/SettingsContext";
import { useRuler } from "../context/RulerContext";

const { width, height } = Dimensions.get("window");
const centerX = width / 2;
const centerY = height / 2;

interface AROverlayProps {
  mode: LevelingMode;
  sensorData: SensorData;
  settings: AppSettings;
  isCalibrating: boolean;
  onToggleCamera: () => void;
}

export const AROverlay: React.FC<AROverlayProps> = ({
  mode,
  sensorData,
  settings,
  isCalibrating,
  onToggleCamera,
}) => {
  const { measurements, currentPoints, addPoint, clearPoints, currentUnit } =
    useRuler();

  // PanResponder for handling touches in ruler mode
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => mode === "ruler",
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: (evt) => {
      if (mode === "ruler") {
        const { locationX, locationY } = evt.nativeEvent;
        addPoint(locationX, locationY);
      }
    },
  });
  const renderLaserMode = () => {
    const { pitch, roll, angle, isLevel } = sensorData;
    const lineOpacity = 0.8;

    // Calculate rotation angle from pitch and roll
    const rotationAngle = Math.atan2(pitch, roll) * (180 / Math.PI);

    // Line length for the rotating cross
    const lineLength = 150;

    return (
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0066FF" stopOpacity="0" />
            <Stop offset="50%" stopColor="#0066FF" stopOpacity={lineOpacity} />
            <Stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF0000" stopOpacity="0" />
            <Stop offset="50%" stopColor="#FF0000" stopOpacity={lineOpacity} />
            <Stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Fixed Blue Reference Lines (Always at 90 degrees) */}
        {/* Horizontal blue line - always at center */}
        <Line
          x1={0}
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke="#0066FF"
          strokeWidth="1"
        />

        {/* Vertical blue line - always at center */}
        <Line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={height}
          stroke="#0066FF"
          strokeWidth="1"
        />

        {/* Rotating Red Cross - rotates based on phone angle */}
        {/* Calculate rotated line positions manually */}
        {(() => {
          const angleRad = rotationAngle * (Math.PI / 180);
          const cos = Math.cos(angleRad);
          const sin = Math.sin(angleRad);

          // Calculate line length to extend to screen edges
          const maxDistance = Math.max(width, height);

          // Horizontal line of the cross (rotated) - extend to screen edges
          const hx1 = centerX - maxDistance * cos;
          const hy1 = centerY - maxDistance * sin;
          const hx2 = centerX + maxDistance * cos;
          const hy2 = centerY + maxDistance * sin;

          // Vertical line of the cross (rotated) - extend to screen edges
          const vx1 = centerX + maxDistance * sin;
          const vy1 = centerY - maxDistance * cos;
          const vx2 = centerX - maxDistance * sin;
          const vy2 = centerY + maxDistance * cos;

          return (
            <>
              {/* Horizontal red line of the cross */}
              <Line
                x1={hx1}
                y1={hy1}
                x2={hx2}
                y2={hy2}
                stroke="#FF0000"
                strokeWidth="1"
              />

              {/* Vertical red line of the cross */}
              <Line
                x1={vx1}
                y1={vy1}
                x2={vx2}
                y2={vy2}
                stroke="#FF0000"
                strokeWidth="1"
              />
            </>
          );
        })()}

        {/* Center crosshair */}
        <Circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {/* Grid overlay */}
        {settings.gridEnabled && (
          <>
            {/* Horizontal grid lines */}
            {Array.from({ length: 5 }, (_, i) => (
              <Line
                key={`h-${i}`}
                x1={0}
                y1={(height / 6) * (i + 1)}
                x2={width}
                y2={(height / 6) * (i + 1)}
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}
            {/* Vertical grid lines */}
            {Array.from({ length: 5 }, (_, i) => (
              <Line
                key={`v-${i}`}
                x1={(width / 6) * (i + 1)}
                y1={0}
                x2={(width / 6) * (i + 1)}
                y2={height}
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}
          </>
        )}

        {/* Angle display */}
        <SvgText
          x={centerX + 60}
          y={centerY - 20}
          fontSize="24"
          fill="#FFFFFF"
          fontWeight="bold"
        >
          {angle.toFixed(settings.precision)}°
        </SvgText>

        <Circle
          cx={centerX + 60}
          cy={centerY + 20}
          r="6"
          fill={isLevel ? "#00FF00" : "#FF0000"}
        />
      </Svg>
    );
  };

  const renderSpiritMode = () => {
    const { pitch, roll, isLevel } = sensorData;
    const bubbleX = centerX + roll * 10;
    const bubbleY = centerY + pitch * 10;
    const bubbleColor = isLevel ? "#00FF00" : "#FF0000";

    return (
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* Spirit level circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r="80"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeOpacity="0.8"
        />

        {/* Inner circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r="60"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.5"
        />

        {/* Center crosshair */}
        <Line
          x1={centerX - 20}
          y1={centerY}
          x2={centerX + 20}
          y2={centerY}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.8"
        />
        <Line
          x1={centerX}
          y1={centerY - 20}
          x2={centerX}
          y2={centerY + 20}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* Bubble */}
        <Circle
          cx={bubbleX}
          cy={bubbleY}
          r="12"
          fill={bubbleColor}
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Level indicator */}
        <Circle
          cx={centerX + 100}
          cy={centerY}
          r="8"
          fill={isLevel ? "#00FF00" : "#FF0000"}
        />
      </Svg>
    );
  };

  const renderClinometerMode = () => {
    const { pitch, roll, angle } = sensorData;
    const angleText = angle.toFixed(settings.precision);

    return (
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* Angle arc */}
        <Circle
          cx={centerX}
          cy={centerY}
          r="100"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* Angle lines */}
        <Line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.cos((pitch * Math.PI) / 180) * 100}
          y2={centerY + Math.sin((pitch * Math.PI) / 180) * 100}
          stroke="#FF0000"
          strokeWidth="3"
        />

        <Line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.cos((roll * Math.PI) / 180) * 100}
          y2={centerY + Math.sin((roll * Math.PI) / 180) * 100}
          stroke="#00FF00"
          strokeWidth="3"
        />

        {/* Center point */}
        <Circle cx={centerX} cy={centerY} r="6" fill="#FFFFFF" />

        {/* Angle display */}
        <SvgText
          x={centerX - 30}
          y={centerY - 120}
          fontSize="32"
          fill="#FFFFFF"
          fontWeight="bold"
          textAnchor="middle"
        >
          {angleText}°
        </SvgText>

        {/* Pitch and Roll readings */}
        <SvgText
          x={centerX - 30}
          y={centerY - 80}
          fontSize="16"
          fill="#FF0000"
          textAnchor="middle"
        >
          Pitch: {pitch.toFixed(settings.precision)}°
        </SvgText>
        <SvgText
          x={centerX - 30}
          y={centerY - 60}
          fontSize="16"
          fill="#00FF00"
          textAnchor="middle"
        >
          Roll: {roll.toFixed(settings.precision)}°
        </SvgText>
      </Svg>
    );
  };

  const renderRulerMode = () => {
    return (
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* Render all completed measurements */}
        {measurements.map((measurement) => (
          <React.Fragment key={measurement.id}>
            {/* Measurement line */}
            <Line
              x1={measurement.startPoint.x}
              y1={measurement.startPoint.y}
              x2={measurement.endPoint.x}
              y2={measurement.endPoint.y}
              stroke="#00FF00"
              strokeWidth="2"
            />

            {/* Start point */}
            <Circle
              cx={measurement.startPoint.x}
              cy={measurement.startPoint.y}
              r="6"
              fill="#00FF00"
            />

            {/* End point */}
            <Circle
              cx={measurement.endPoint.x}
              cy={measurement.endPoint.y}
              r="6"
              fill="#00FF00"
            />

            {/* Distance label */}
            <SvgText
              x={(measurement.startPoint.x + measurement.endPoint.x) / 2}
              y={(measurement.startPoint.y + measurement.endPoint.y) / 2 - 10}
              fontSize="16"
              fill="#FFFFFF"
              fontWeight="bold"
              textAnchor="middle"
            >
              {measurement.distance.toFixed(1)} {measurement.unit}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Render current measurement in progress */}
        {currentPoints.map((point, index) => (
          <Circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="8"
            fill={index === 0 ? "#FF0000" : "#00FF00"}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        ))}

        {/* Draw line between current points */}
        {currentPoints.length === 2 && (
          <Line
            x1={currentPoints[0].x}
            y1={currentPoints[0].y}
            x2={currentPoints[1].x}
            y2={currentPoints[1].y}
            stroke="#FF0000"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Instructions */}
        <SvgText
          x={width / 2}
          y={height - 100}
          fontSize="18"
          fill="#FFFFFF"
          fontWeight="bold"
          textAnchor="middle"
        >
          {currentPoints.length === 0
            ? "Tap to start measurement"
            : currentPoints.length === 1
            ? "Tap to complete measurement"
            : "Tap to start new measurement"}
        </SvgText>

        {/* Unit display */}
        <SvgText x={20} y={height - 50} fontSize="14" fill="#FFFFFF">
          Unit: {currentUnit}
        </SvgText>

        {/* Measurement count */}
        <SvgText x={20} y={height - 30} fontSize="14" fill="#FFFFFF">
          Measurements: {measurements.length}
        </SvgText>
      </Svg>
    );
  };

  const renderModeOverlay = () => {
    switch (mode) {
      case "laser":
        return renderLaserMode();
      case "spirit":
        return renderSpiritMode();
      case "clinometer":
        return renderClinometerMode();
      case "ruler":
        return renderRulerMode();
      default:
        return null;
    }
  };

  return (
    <View
      style={[styles.container, mode === "ruler" && { pointerEvents: "auto" }]}
      {...panResponder.panHandlers}
    >
      {renderModeOverlay()}

      {/* Camera toggle button */}
      <TouchableOpacity
        style={[styles.cameraToggle, { pointerEvents: "auto" }]}
        onPress={onToggleCamera}
      >
        <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Calibration indicator */}
      {isCalibrating && (
        <View style={[styles.calibrationIndicator, { pointerEvents: "auto" }]}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  cameraToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  calibrationIndicator: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

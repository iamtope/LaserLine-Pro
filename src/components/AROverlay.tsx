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
  Rect,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { LevelingMode } from "../../App";
import { SensorData, useSensors } from "../context/SensorContext";
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
    const { isCalibrated, calibrate, resetCalibration } = useSensors();

    // Apply calibration offsets - adjust these values based on your device
    const calibratedRoll = roll; // X-axis (left-right tilt)
    const calibratedPitch = pitch; // Y-axis (forward-backward tilt)

    // Debug: Log the raw values to understand the coordinate system
    console.log("Raw sensor data:", {
      pitch,
      roll,
      calibratedPitch,
      calibratedRoll,
      isCalibrated,
    });

    // EXACT colors from the image
    const liquidGreen = "#00FF00"; // Bright neon lime green like in the image
    const bubbleColor = "#FFFF00"; // Bright yellow bubble as shown
    const darkGrey = "#2A2A2A"; // Dark grey background

    // EXACT dimensions from the image
    const horizontalPadding = 30; // Smaller padding for almost full width
    const plumbThickness = 20; // Thinner plumbs as in image
    const bubbleRadius = 22; // Larger bubbles to match bigger inner circle

    // Calculate positions to match image layout
    const horizontalY = height * 0.22; // Slightly higher
    const verticalX = width * 0.18; // More to the left
    const verticalY = height * 0.48; // Slightly higher center
    const circularX = width * 0.68; // More to the right
    const circularY = height * 0.48; // Match vertical center

    // Enhanced spirit level dimensions
    const verticalWidth = width * 0.15; // 15% of screen width
    const verticalHeight = height * 0.4; // 40% of screen height
    const plumbLineSpacing = verticalWidth * 0.5; // Increased spacing between plumb lines

    // Bubble sensitivity - more responsive like in image
    const bubbleSensitivity = 1.5;
    // Container-aware bubble positioning
    // Calculate actual container boundaries for proper bubble movement

    // Horizontal container boundaries
    const horizontalContainerLeft = centerX - width * 0.45;
    const horizontalContainerRight = centerX + width * 0.45;
    const horizontalContainerTop = centerY - 210;
    const horizontalContainerBottom = centerY - 160;
    const horizontalContainerWidth = width * 0.9;
    const horizontalContainerHeight = 50;

    // Vertical container boundaries
    const verticalContainerLeft = centerX - width * 0.4 - verticalWidth / 2;
    const verticalContainerRight = centerX - width * 0.4 + verticalWidth / 2;
    const verticalContainerTop = centerY - verticalHeight / 2;
    const verticalContainerBottom = centerY + verticalHeight / 2;

    // Circular container boundaries
    const circularContainerRadius = 125; // From the liquid circle radius

    // Calculate bubble positions based on angle and container boundaries
    // When phone tilts right (positive roll), bubble should go to left edge
    // When phone tilts left (negative roll), bubble should go to right edge
    const horizontalBubbleX =
      centerX - (sensorData.bubbleRoll * (horizontalContainerWidth / 2)) / 5;
    const verticalBubbleY =
      verticalY - (sensorData.bubblePitch * (verticalHeight / 2)) / 5;
    const circularBubbleX =
      circularX - (sensorData.bubbleRoll * circularContainerRadius) / 10;
    const circularBubbleY =
      circularY - (sensorData.bubblePitch * circularContainerRadius) / 10;

    // Constrain bubbles within actual container boundaries
    const horizontalBubbleConstrainedX = Math.max(
      horizontalContainerLeft + bubbleRadius * 0.6,
      Math.min(horizontalContainerRight - bubbleRadius * 0.6, horizontalBubbleX)
    );
    const verticalBubbleConstrainedY = Math.max(
      verticalContainerTop + bubbleRadius * 0.6,
      Math.min(verticalContainerBottom - bubbleRadius * 0.6, verticalBubbleY)
    );

    // Circular bubble constraint - keep within circular boundary
    const circularBubbleRadius = bubbleRadius * 0.6;
    const maxDistanceFromCenter =
      circularContainerRadius - circularBubbleRadius;

    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(
      Math.pow(circularBubbleX - circularX, 2) +
        Math.pow(circularBubbleY - circularY, 2)
    );

    let circularBubbleConstrainedX = circularBubbleX;
    let circularBubbleConstrainedY = circularBubbleY;

    // If bubble would go outside circle, constrain it to the edge
    if (distanceFromCenter > maxDistanceFromCenter) {
      const angle = Math.atan2(
        circularBubbleY - circularY,
        circularBubbleX - circularX
      );
      circularBubbleConstrainedX =
        circularX + Math.cos(angle) * maxDistanceFromCenter;
      circularBubbleConstrainedY =
        circularY + Math.sin(angle) * maxDistanceFromCenter;
    }

    return (
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Horizontal gradient - yellowish more to the top */}
          <LinearGradient
            id="horizontalLiquidGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <Stop offset="20%" stopColor="#E6FF33" stopOpacity="1" />
            <Stop offset="40%" stopColor="#ADFF2F" stopOpacity="1" />
            <Stop offset="60%" stopColor="#ADFF2F" stopOpacity="1" />
            <Stop offset="80%" stopColor="#7FFF00" stopOpacity="1" />
            <Stop offset="100%" stopColor="#CCFF00" stopOpacity="0.95" />
          </LinearGradient>

          {/* Vertical gradient - yellowish more to the left */}
          <LinearGradient
            id="verticalLiquidGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <Stop offset="20%" stopColor="#E6FF33" stopOpacity="1" />
            <Stop offset="40%" stopColor="#ADFF2F" stopOpacity="1" />
            <Stop offset="60%" stopColor="#ADFF2F" stopOpacity="1" />
            <Stop offset="80%" stopColor="#7FFF00" stopOpacity="1" />
            <Stop offset="100%" stopColor="#CCFF00" stopOpacity="0.95" />
          </LinearGradient>

          {/* Circular gradient - balanced */}
          <LinearGradient
            id="circularLiquidGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <Stop offset="20%" stopColor="#E6FF33" stopOpacity="1" />
            <Stop offset="40%" stopColor="#ADFF2F" stopOpacity="1" />
            <Stop offset="60%" stopColor="#ADFF2F" stopOpacity="1" />
            <Stop offset="80%" stopColor="#7FFF00" stopOpacity="1" />
            <Stop offset="100%" stopColor="#CCFF00" stopOpacity="0.95" />
          </LinearGradient>

          {/* Translucent bubble gradient matching the image */}
          <RadialGradient id="bubbleGradient" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop offset="80%" stopColor="#F0F0F0" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#E0E0E0" stopOpacity="0.4" />
          </RadialGradient>

          {/* Shadow gradient for depth effect */}
          <LinearGradient
            id="shadowGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </LinearGradient>

          {/* Enhanced shadow gradients for circle */}
          <RadialGradient id="circleShadowGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="90%" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </RadialGradient>

          {/* Inner shadow for circle depth */}
          <RadialGradient id="circleInnerShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
            <Stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Horizontal Level Indicator (Top) - Enhanced */}
        <Rect
          x={centerX - width * 0.45}
          y={centerY - 210}
          width={width * 0.9}
          height="50"
          rx="0"
          ry="0"
          fill="#3A3A3A"
          stroke="#333333"
          strokeWidth="2"
        />

        {/* Horizontal liquid with depth */}
        <Rect
          x={centerX - width * 0.45 + 5}
          y={centerY - 205}
          width={width * 0.9 - 10}
          height="40"
          rx="0"
          ry="0"
          fill="url(#horizontalLiquidGradient)"
          stroke="#CCFF00"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Horizontal level markers - Enhanced with wider boundary */}
        <Line
          x1={centerX - 25}
          y1={centerY - 210}
          x2={centerX - 25}
          y2={centerY - 160}
          stroke="#000000"
          strokeWidth="2.5"
          strokeOpacity="0.8"
        />
        <Line
          x1={centerX + 25}
          y1={centerY - 210}
          x2={centerX + 25}
          y2={centerY - 160}
          stroke="#000000"
          strokeWidth="2.5"
          strokeOpacity="0.8"
        />

        {/* Horizontal bubble - Enhanced */}
        <Circle
          cx={horizontalBubbleConstrainedX}
          cy={centerY - 185}
          r={bubbleRadius * 0.6}
          fill="url(#bubbleGradient)"
          stroke="#DDDDDD"
          strokeWidth="2"
        />

        {/* Level indicator for horizontal */}
        {Math.abs(sensorData.bubbleRoll) < 0.3 && (
          <Circle
            cx={centerX}
            cy={centerY - 185}
            r="3"
            fill="#00FF00"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
        )}

        {/* Vertical Level Indicator (Left) - Enhanced */}
        <Rect
          x={centerX - width * 0.4 - verticalWidth / 2}
          y={centerY - verticalHeight / 2}
          width={verticalWidth}
          height={verticalHeight}
          rx="0"
          ry="0"
          fill="#3A3A3A"
          stroke="#333333"
          strokeWidth="2"
        />

        {/* Vertical liquid with depth */}
        <Rect
          x={centerX - width * 0.4 - verticalWidth / 2 + 5}
          y={centerY - verticalHeight / 2 + 5}
          width={verticalWidth - 10}
          height={verticalHeight - 10}
          rx="0"
          ry="0"
          fill="url(#verticalLiquidGradient)"
          stroke="#CCFF00"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Vertical level markers - Enhanced */}
        <Line
          x1={centerX - width * 0.4 - verticalWidth / 2}
          y1={centerY - plumbLineSpacing}
          x2={centerX - width * 0.4 + verticalWidth / 2}
          y2={centerY - plumbLineSpacing}
          stroke="#000000"
          strokeWidth="2.5"
          strokeOpacity="0.8"
        />
        <Line
          x1={centerX - width * 0.4 - verticalWidth / 2}
          y1={centerY + plumbLineSpacing}
          x2={centerX - width * 0.4 + verticalWidth / 2}
          y2={centerY + plumbLineSpacing}
          stroke="#000000"
          strokeWidth="2.5"
          strokeOpacity="0.8"
        />

        {/* Vertical bubble - Enhanced */}
        <Circle
          cx={centerX - width * 0.4}
          cy={verticalBubbleConstrainedY}
          r={bubbleRadius * 0.6}
          fill="url(#bubbleGradient)"
          stroke="#DDDDDD"
          strokeWidth="2"
        />

        {/* Circular/Bullseye Level Indicator (Right) - Enhanced */}
        {/* Outer shadow layer */}
        <Circle
          cx={circularX + 3}
          cy={circularY + 3}
          r="130"
          fill="url(#circleShadowGradient)"
          opacity="0.6"
        />

        {/* Main circle frame */}
        <Circle
          cx={circularX}
          cy={circularY}
          r="130"
          fill="#3A3A3A"
          stroke="#333333"
          strokeWidth="2"
        />

        {/* Inner shadow layer */}
        <Circle
          cx={circularX}
          cy={circularY}
          r="125"
          fill="url(#circleInnerShadow)"
        />

        {/* Circular liquid with depth */}
        <Circle
          cx={circularX}
          cy={circularY}
          r="125"
          fill="url(#circularLiquidGradient)"
          stroke="#CCFF00"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Circular crosshairs - Enhanced */}
        <Line
          x1={circularX - 125}
          y1={circularY}
          x2={circularX + 125}
          y2={circularY}
          stroke="#000000"
          strokeWidth="0.5"
          strokeOpacity="0.8"
        />
        <Line
          x1={circularX}
          y1={circularY - 125}
          x2={circularX}
          y2={circularY + 125}
          stroke="#000000"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />

        {/* Center circle - Enhanced */}
        <Circle
          cx={circularX}
          cy={circularY}
          r="25"
          fill="none"
          stroke="#000000"
          strokeWidth="0.5"
          strokeOpacity="0.8"
        />

        {/* Circular bubble - Enhanced */}
        <Circle
          cx={circularBubbleConstrainedX}
          cy={circularBubbleConstrainedY}
          r={bubbleRadius * 0.6}
          fill="url(#bubbleGradient)"
          stroke="#DDDDDD"
          strokeWidth="2"
        />

        {/* Level indicator for circular */}
        {Math.sqrt(
          sensorData.bubbleRoll * sensorData.bubbleRoll +
            sensorData.bubblePitch * sensorData.bubblePitch
        ) < 0.3 && (
          <Circle
            cx={circularX}
            cy={circularY}
            r="4"
            fill="#00FF00"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
        )}

        {/* Angle readings - EXACT positioning from image */}
        {/* Angle display moved to bottom */}
        <SvgText
          x={centerX}
          y={height - 80}
          fontSize="18"
          fill="#FFFFFF"
          textAnchor="middle"
          fontWeight="bold"
        >
          X: {sensorData.bubbleRoll.toFixed(1)}° | Y:{" "}
          {sensorData.bubblePitch.toFixed(1)}°
        </SvgText>

        {/* Control Icons - Auto-calibration always active */}
        {/* AD Icon - Auto Calibrate (Always Active) */}
        <TouchableOpacity
          style={{
            position: "absolute",
            left: centerX - 120 - 22,
            top: height - 90 - 22,
            width: 44,
            height: 44,
            borderRadius: 22,
          }}
          onPress={calibrate}
        >
          <Circle
            cx={centerX - 120}
            cy={height - 90}
            r="22"
            fill="#00FF00"
            stroke="#000000"
            strokeWidth="1"
          />
          <SvgText
            x={centerX - 120}
            y={height - 85}
            fontSize="10"
            fill="#FFFFFF"
            textAnchor="middle"
            fontWeight="bold"
          >
            AD
          </SvgText>
        </TouchableOpacity>

        {/* Gravity Reference Icon */}
        <TouchableOpacity
          style={{
            position: "absolute",
            left: centerX - 60 - 22,
            top: height - 90 - 22,
            width: 44,
            height: 44,
            borderRadius: 22,
          }}
          onPress={resetCalibration}
        >
          <Circle
            cx={centerX - 60}
            cy={height - 90}
            r="22"
            fill="#00FF00"
            stroke="#000000"
            strokeWidth="1"
          />
          {/* Gravity arrow pointing down */}
          <Line
            x1={centerX - 60}
            y1={height - 100}
            x2={centerX - 60}
            y2={height - 80}
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Line
            x1={centerX - 65}
            y1={height - 85}
            x2={centerX - 60}
            y2={height - 80}
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1={centerX - 55}
            y1={height - 85}
            x2={centerX - 60}
            y2={height - 80}
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </TouchableOpacity>

        {/* Precision/Unit Toggle Icon */}
        <Circle
          cx={centerX}
          cy={height - 90}
          r="22"
          fill={darkGrey}
          stroke="#000000"
          strokeWidth="1"
        />
        <SvgText
          x={centerX}
          y={height - 85}
          fontSize="10"
          fill="#FFFFFF"
          textAnchor="middle"
          fontWeight="bold"
        >
          .0°
        </SvgText>

        {/* Lock/Unlock Icon */}
        <Circle
          cx={centerX + 60}
          cy={height - 90}
          r="22"
          fill={darkGrey}
          stroke="#000000"
          strokeWidth="1"
        />
        {/* Unlock icon - smaller as in image */}
        <Circle
          cx={centerX + 60}
          cy={height - 95}
          r="6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <Line
          x1={centerX + 60}
          y1={height - 89}
          x2={centerX + 60}
          y2={height - 83}
          stroke="#FFFFFF"
          strokeWidth="2"
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

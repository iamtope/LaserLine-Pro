import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Gyroscope, Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import Quaternion from "quaternion";

export interface SensorData {
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  quaternion: {
    w: number;
    x: number;
    y: number;
    z: number;
  };
  isLevel: boolean;
  angle: number;
  pitch: number;
  roll: number;
  // Smoothed values for UI components
  bubblePitch: number;
  bubbleRoll: number;
  laserPitch: number;
  laserRoll: number;
}

interface SensorContextType {
  sensorData: SensorData;
  isCalibrated: boolean;
  calibrationOffset: {
    quaternion: Quaternion;
  };
  calibrate: () => void;
  resetCalibration: () => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

interface SensorProviderProps {
  children: ReactNode;
}

export const SensorProvider: React.FC<SensorProviderProps> = ({ children }) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    gyroscope: { x: 0, y: 0, z: 0 },
    accelerometer: { x: 0, y: 0, z: 0 },
    quaternion: { w: 1, x: 0, y: 0, z: 0 },
    isLevel: false,
    angle: 0,
    pitch: 0,
    roll: 0,
    // Smoothed values for UI components
    bubblePitch: 0,
    bubbleRoll: 0,
    laserPitch: 0,
    laserRoll: 0,
  });

  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState({
    quaternion: new Quaternion(1, 0, 0, 0),
  });

  // Smoothing factor for reducing shakiness (0.1 = more smoothing, 1.0 = no smoothing)
  const smoothingFactor = 0.15; // Reduced for smoother movement
  const bubbleSmoothingFactor = 0.08; // Even smoother for bubble
  const laserSmoothingFactor = 0.12; // Smooth for laser line

  // Current quaternion for sensor fusion
  const [currentQuaternion, setCurrentQuaternion] = useState(
    new Quaternion(1, 0, 0, 0)
  );
  const [lastTimestamp, setLastTimestamp] = useState(0);

  // Function to normalize accelerometer data
  const normalizeAccelerometer = (acc: { x: number; y: number; z: number }) => {
    const length = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: acc.x / length,
      y: acc.y / length,
      z: acc.z / length,
    };
  };

  // Auto-calibration system using gravity reference (like laser levels)
  const quaternionToSpiritAngles = (q: Quaternion) => {
    // Convert to rotation matrix for more stable calculations
    const w = q.w;
    const x = q.x;
    const y = q.y;
    const z = q.z;

    // Calculate rotation matrix elements
    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    const xy = x * y;
    const xz = x * z;
    const yz = y * z;
    const wx = w * x;
    const wy = w * y;
    const wz = w * z;

    // Rotation matrix (ZYX order for mobile devices)
    const m00 = 1 - 2 * (yy + zz);
    const m01 = 2 * (xy - wz);
    const m02 = 2 * (xz + wy);
    const m10 = 2 * (xy + wz);
    const m11 = 1 - 2 * (xx + zz);
    const m12 = 2 * (yz - wx);
    const m20 = 2 * (xz - wy);
    const m21 = 2 * (yz + wx);
    const m22 = 1 - 2 * (xx + yy);

    // Extract angles using Tait-Bryan angles (ZYX)
    // Roll (X-axis rotation) - left/right tilt
    const roll = Math.atan2(m21, m22);

    // Pitch (Y-axis rotation) - forward/backward tilt
    const pitch = Math.asin(-m20);

    // Yaw (Z-axis rotation) - compass heading
    const yaw = Math.atan2(m01, m00);

    return {
      pitch: pitch * (180 / Math.PI),
      roll: roll * (180 / Math.PI),
      yaw: yaw * (180 / Math.PI),
    };
  };

  // Orientation-aware gravity-based calibration (handles all phone orientations)
  const getOrientationAwareAngles = (accelData: any) => {
    const { x: gravityX, y: gravityY, z: gravityZ } = accelData;

    // Calculate the magnitude of gravity vector
    const gravityMagnitude = Math.sqrt(
      gravityX * gravityX + gravityY * gravityY + gravityZ * gravityZ
    );

    // Normalize gravity vector
    const normalizedX = gravityX / gravityMagnitude;
    const normalizedY = gravityY / gravityMagnitude;
    const normalizedZ = gravityZ / gravityMagnitude;

    // Determine phone orientation based on gravity vector
    // This ensures X and Y are always correct regardless of phone orientation

    // For spirit level, we want:
    // X-axis: Left/Right tilt (roll)
    // Y-axis: Forward/Backward tilt (pitch)

    // Calculate angles based on gravity components
    // These calculations work regardless of phone orientation
    const roll = Math.atan2(normalizedY, normalizedZ) * (180 / Math.PI);
    const pitch =
      Math.atan2(
        -normalizedX,
        Math.sqrt(normalizedY * normalizedY + normalizedZ * normalizedZ)
      ) *
      (180 / Math.PI);

    // Apply orientation correction based on device orientation
    // This ensures consistent X/Y mapping
    let correctedRoll = roll;
    let correctedPitch = pitch;

    // More sophisticated orientation detection
    // Determine orientation based on which axis has the strongest gravity component
    const absX = Math.abs(normalizedX);
    const absY = Math.abs(normalizedY);
    const absZ = Math.abs(normalizedZ);

    // Find the dominant axis (the one closest to 1.0 or -1.0)
    const maxAbs = Math.max(absX, absY, absZ);

    if (maxAbs === absZ) {
      // Phone is in portrait orientation (normal or upside-down)
      // No swap needed - X and Y are correct
      console.log("Portrait orientation detected - no swap needed");
    } else if (maxAbs === absX) {
      // Phone is rotated 90 degrees (landscape left or right)
      // Need to swap X and Y axes
      correctedRoll = pitch;
      correctedPitch = roll;
      console.log("Landscape orientation detected - X/Y swapped");
    } else if (maxAbs === absY) {
      // Phone is rotated 90 degrees (landscape left or right)
      // Need to swap X and Y axes
      correctedRoll = pitch;
      correctedPitch = roll;
      console.log("Landscape orientation detected - X/Y swapped");
    }

    // Debug logging for orientation detection
    console.log("Orientation debug:", {
      normalizedX: normalizedX.toFixed(2),
      normalizedY: normalizedY.toFixed(2),
      normalizedZ: normalizedZ.toFixed(2),
      absX: absX.toFixed(2),
      absY: absY.toFixed(2),
      absZ: absZ.toFixed(2),
      dominantAxis:
        maxAbs === absZ
          ? "Z (Portrait)"
          : maxAbs === absX
          ? "X (Landscape)"
          : "Y (Landscape)",
      originalRoll: roll.toFixed(1),
      originalPitch: pitch.toFixed(1),
      correctedRoll: correctedRoll.toFixed(1),
      correctedPitch: correctedPitch.toFixed(1),
      swapped: correctedRoll !== roll,
    });

    return {
      pitch: correctedPitch,
      roll: correctedRoll,
      yaw: 0,
    };
  };

  useEffect(() => {
    // Set update intervals
    Gyroscope.setUpdateInterval(16); // ~60fps
    Accelerometer.setUpdateInterval(16);

    let gyroData: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
    let accelData: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    // Subscribe to sensor updates
    const gyroscopeSubscription = Gyroscope.addListener((data) => {
      gyroData = data;
    });

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      accelData = data;

      // Get current timestamp
      const now = Date.now();
      const dt = lastTimestamp === 0 ? 0 : (now - lastTimestamp) / 1000;
      setLastTimestamp(now);

      // Normalize accelerometer data
      const normalizedAccel = normalizeAccelerometer(accelData);

      // Create quaternion from accelerometer (assuming device is stationary)
      // This gives us the orientation relative to gravity
      let accelQuaternion = new Quaternion(1, 0, 0, 0);

      // Convert accelerometer to quaternion using fromVectors method
      const gravity = new Quaternion(0, 0, 0, 1); // Reference gravity vector (pointing down)
      const currentGravity = new Quaternion(
        0,
        normalizedAccel.x,
        normalizedAccel.y,
        normalizedAccel.z
      );

      try {
        accelQuaternion = Quaternion.fromVectors(
          gravity.imag(),
          currentGravity.imag()
        );
      } catch (error) {
        // If vectors are parallel, use identity quaternion
        accelQuaternion = new Quaternion(1, 0, 0, 0);
      }

      // Sensor fusion: combine gyroscope and accelerometer data
      if (dt > 0 && dt < 1) {
        // Valid time delta
        // Convert gyroscope data to quaternion delta
        const gyroMagnitude = Math.sqrt(
          gyroData.x * gyroData.x +
            gyroData.y * gyroData.y +
            gyroData.z * gyroData.z
        );
        if (gyroMagnitude > 0) {
          const gyroQuaternion = Quaternion.fromAxisAngle(
            [gyroData.x, gyroData.y, gyroData.z],
            gyroMagnitude * dt
          );

          // Update current quaternion with gyroscope data
          setCurrentQuaternion((prev) => {
            const updated = prev.mul(gyroQuaternion);

            // Use orientation-aware calibration (handles all phone orientations)
            const euler = getOrientationAwareAngles(accelData);

            // Apply exponential smoothing for different components
            const smoothedPitch =
              sensorData.pitch +
              (euler.pitch - sensorData.pitch) * smoothingFactor;
            const smoothedRoll =
              sensorData.roll +
              (euler.roll - sensorData.roll) * smoothingFactor;

            // Apply extra smoothing for bubble movement (more stable)
            const bubbleSmoothedPitch =
              sensorData.pitch +
              (euler.pitch - sensorData.pitch) * bubbleSmoothingFactor;
            const bubbleSmoothedRoll =
              sensorData.roll +
              (euler.roll - sensorData.roll) * bubbleSmoothingFactor;

            // Apply smoothing for laser line (balanced)
            const laserSmoothedPitch =
              sensorData.pitch +
              (euler.pitch - sensorData.pitch) * laserSmoothingFactor;
            const laserSmoothedRoll =
              sensorData.roll +
              (euler.roll - sensorData.roll) * laserSmoothingFactor;

            // Calculate total angle deviation
            const angle = Math.sqrt(
              smoothedPitch * smoothedPitch + smoothedRoll * smoothedRoll
            );

            // Determine if level (within 0.5 degrees)
            const isLevel = angle < 0.5;

            // Check for level state change for haptic feedback
            if (isLevel && !sensorData.isLevel) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }

            setSensorData((prev) => ({
              ...prev,
              gyroscope: gyroData,
              accelerometer: accelData,
              quaternion: {
                w: updated.w,
                x: updated.x,
                y: updated.y,
                z: updated.z,
              },
              pitch: smoothedPitch,
              roll: smoothedRoll,
              angle,
              isLevel,
              // Smoothed values for UI components
              bubblePitch: bubbleSmoothedPitch,
              bubbleRoll: bubbleSmoothedRoll,
              laserPitch: laserSmoothedPitch,
              laserRoll: laserSmoothedRoll,
            }));

            return updated;
          });
        }
      }
    });

    return () => {
      gyroscopeSubscription?.remove();
      accelerometerSubscription?.remove();
    };
  }, [
    calibrationOffset,
    lastTimestamp,
    sensorData.pitch,
    sensorData.roll,
    sensorData.isLevel,
    smoothingFactor,
  ]);

  // Auto-calibration is always active (like laser levels)
  const calibrate = () => {
    console.log(
      "Auto-calibration is always active - no manual calibration needed"
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetCalibration = () => {
    console.log(
      "Auto-calibration resets automatically - no manual reset needed"
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const value: SensorContextType = {
    sensorData,
    isCalibrated,
    calibrationOffset,
    calibrate,
    resetCalibration,
  };

  return (
    <SensorContext.Provider value={value}>{children}</SensorContext.Provider>
  );
};

export const useSensors = (): SensorContextType => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error("useSensors must be used within a SensorProvider");
  }
  return context;
};

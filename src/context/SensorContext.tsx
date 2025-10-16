import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Gyroscope, Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

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
  isLevel: boolean;
  angle: number;
  pitch: number;
  roll: number;
}

interface SensorContextType {
  sensorData: SensorData;
  isCalibrated: boolean;
  calibrationOffset: {
    pitch: number;
    roll: number;
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
    isLevel: false,
    angle: 0,
    pitch: 0,
    roll: 0,
  });

  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState({
    pitch: 0,
    roll: 0,
  });

  // Smoothing factor for reducing shakiness (0.1 = more smoothing, 1.0 = no smoothing)
  const smoothingFactor = 0.3;

  useEffect(() => {
    // Set update intervals
    Gyroscope.setUpdateInterval(16); // ~60fps
    Accelerometer.setUpdateInterval(16);

    // Subscribe to sensor updates
    const gyroscopeSubscription = Gyroscope.addListener((gyroscopeData) => {
      setSensorData((prev) => ({
        ...prev,
        gyroscope: gyroscopeData,
      }));
    });

    const accelerometerSubscription = Accelerometer.addListener(
      (accelerometerData) => {
        // Calculate pitch and roll from accelerometer data
        const rawPitch = Math.atan2(
          accelerometerData.y,
          Math.sqrt(
            accelerometerData.x * accelerometerData.x +
              accelerometerData.z * accelerometerData.z
          )
        );
        const rawRoll = Math.atan2(-accelerometerData.x, accelerometerData.z);

        // Apply calibration offset
        const calibratedPitch = rawPitch - calibrationOffset.pitch;
        const calibratedRoll = rawRoll - calibrationOffset.roll;

        // Convert to degrees
        const newPitch = calibratedPitch * (180 / Math.PI);
        const newRoll = calibratedRoll * (180 / Math.PI);

        // Apply smoothing to reduce shakiness
        setSensorData((prev) => {
          const smoothedPitch =
            prev.pitch + (newPitch - prev.pitch) * smoothingFactor;
          const smoothedRoll =
            prev.roll + (newRoll - prev.roll) * smoothingFactor;

          // Calculate total angle deviation
          const angle = Math.sqrt(
            smoothedPitch * smoothedPitch + smoothedRoll * smoothedRoll
          );

          // Determine if level (within 0.5 degrees)
          const isLevel = angle < 0.5;

          return {
            ...prev,
            accelerometer: accelerometerData,
            pitch: smoothedPitch,
            roll: smoothedRoll,
            angle,
            isLevel,
          };
        });

        // Haptic feedback when level (check after state update)
        setSensorData((prev) => {
          if (prev.isLevel && !prev.isLevel) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return prev;
        });
      }
    );

    return () => {
      gyroscopeSubscription?.remove();
      accelerometerSubscription?.remove();
    };
  }, [calibrationOffset]);

  const calibrate = () => {
    const currentPitch = Math.atan2(
      sensorData.accelerometer.y,
      Math.sqrt(
        sensorData.accelerometer.x * sensorData.accelerometer.x +
          sensorData.accelerometer.z * sensorData.accelerometer.z
      )
    );
    const currentRoll = Math.atan2(
      -sensorData.accelerometer.x,
      sensorData.accelerometer.z
    );

    setCalibrationOffset({
      pitch: currentPitch,
      roll: currentRoll,
    });

    setIsCalibrated(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetCalibration = () => {
    setCalibrationOffset({ pitch: 0, roll: 0 });
    setIsCalibrated(false);
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

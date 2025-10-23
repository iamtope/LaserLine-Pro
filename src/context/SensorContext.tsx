import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  DeviceMotion,
  Accelerometer,
  Gyroscope,
  Magnetometer,
  Barometer,
} from "expo-sensors";
import * as Location from "expo-location";
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
  magnetometer: {
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
  eulerAngles: {
    pitch: number;
    roll: number;
    yaw: number;
  };

  location: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
  };
  heading: number;
  speed: number;

  barometer: {
    pressure: number;
    relativeAltitude: number;
  };
  ambientSound: {
    level: number;
    decibels: number;
  };

  angle: number;
  pitch: number;
  roll: number;
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
    magnetometer: { x: 0, y: 0, z: 0 },

    quaternion: { w: 1, x: 0, y: 0, z: 0 },
    eulerAngles: { pitch: 0, roll: 0, yaw: 0 },

    location: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0 },
    heading: 0,
    speed: 0,

    barometer: { pressure: 0, relativeAltitude: 0 },
    ambientSound: { level: 0, decibels: 0 },

    angle: 0,
    pitch: 0,
    roll: 0,
    bubblePitch: 0,
    bubbleRoll: 0,
    laserPitch: 0,
    laserRoll: 0,
  });

  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState({
    quaternion: new Quaternion(1, 0, 0, 0),
  });

  const [permissionsRequested, setPermissionsRequested] = useState({
    location: false,
  });

  const smoothingFactor = 0.15; // Reduced for smoother movement
  const bubbleSmoothingFactor = 0.08; // Even smoother for bubble
  const laserSmoothingFactor = 0.12; // Smooth for laser line

  const [currentQuaternion, setCurrentQuaternion] = useState(
    new Quaternion(1, 0, 0, 0)
  );
  const [lastTimestamp, setLastTimestamp] = useState(0);

  const normalizeAccelerometer = (acc: { x: number; y: number; z: number }) => {
    const length = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: acc.x / length,
      y: acc.y / length,
      z: acc.z / length,
    };
  };

  const quaternionToSpiritAngles = (q: Quaternion) => {
    const w = q.w;
    const x = q.x;
    const y = q.y;
    const z = q.z;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    const xy = x * y;
    const xz = x * z;
    const yz = y * z;
    const wx = w * x;
    const wy = w * y;
    const wz = w * z;

    const m00 = 1 - 2 * (yy + zz);
    const m01 = 2 * (xy - wz);
    const m02 = 2 * (xz + wy);
    const m10 = 2 * (xy + wz);
    const m11 = 1 - 2 * (xx + zz);
    const m12 = 2 * (yz - wx);
    const m20 = 2 * (xz - wy);
    const m21 = 2 * (yz + wx);
    const m22 = 1 - 2 * (xx + yy);

    const roll = Math.atan2(m21, m22);

    const pitch = Math.asin(-m20);

    const yaw = Math.atan2(m01, m00);

    return {
      pitch: pitch * (180 / Math.PI),
      roll: roll * (180 / Math.PI),
      yaw: yaw * (180 / Math.PI),
    };
  };

  const getOrientationAwareAngles = (accelData: any) => {
    const { x: gravityX, y: gravityY, z: gravityZ } = accelData;

    const gravityMagnitude = Math.sqrt(
      gravityX * gravityX + gravityY * gravityY + gravityZ * gravityZ
    );

    const normalizedX = gravityX / gravityMagnitude;
    const normalizedY = gravityY / gravityMagnitude;
    const normalizedZ = gravityZ / gravityMagnitude;

    const roll = Math.atan2(normalizedY, normalizedZ) * (180 / Math.PI);
    const pitch =
      Math.atan2(
        -normalizedX,
        Math.sqrt(normalizedY * normalizedY + normalizedZ * normalizedZ)
      ) *
      (180 / Math.PI);

    const correctedRoll = roll;
    const correctedPitch = pitch;

    return {
      pitch: correctedPitch,
      roll: correctedRoll,
      yaw: 0,
    };
  };

  useEffect(() => {
    Gyroscope.setUpdateInterval(16); // ~60fps
    Accelerometer.setUpdateInterval(16);

    let gyroData: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
    let accelData: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    const gyroscopeSubscription = Gyroscope.addListener((data) => {
      gyroData = data;
    });

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      accelData = data;

      const now = Date.now();
      const dt = lastTimestamp === 0 ? 0 : (now - lastTimestamp) / 1000;
      setLastTimestamp(now);

      const normalizedAccel = normalizeAccelerometer(accelData);

      let accelQuaternion = new Quaternion(1, 0, 0, 0);

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
        accelQuaternion = new Quaternion(1, 0, 0, 0);
      }

      if (dt > 0 && dt < 1) {
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

          setCurrentQuaternion((prev) => {
            const updated = prev.mul(gyroQuaternion);

            const euler = getOrientationAwareAngles(accelData);

            const normalizeAngle = (angle: number) => {
              if (angle > 90) return angle - 180;
              if (angle < -90) return angle + 180;
              return angle;
            };

            const normalizedPitch = normalizeAngle(euler.pitch);
            const normalizedRoll = normalizeAngle(euler.roll);

            const smoothedPitch =
              sensorData.pitch +
              (normalizedPitch - sensorData.pitch) * smoothingFactor;
            const smoothedRoll =
              sensorData.roll +
              (normalizedRoll - sensorData.roll) * smoothingFactor;

            const bubbleSmoothedPitch =
              sensorData.pitch +
              (normalizedPitch - sensorData.pitch) * bubbleSmoothingFactor;
            const bubbleSmoothedRoll =
              sensorData.roll +
              (normalizedRoll - sensorData.roll) * bubbleSmoothingFactor;

            const laserSmoothedPitch =
              sensorData.pitch +
              (normalizedPitch - sensorData.pitch) * laserSmoothingFactor;
            const laserSmoothedRoll =
              sensorData.roll +
              (normalizedRoll - sensorData.roll) * laserSmoothingFactor;

            const angle = Math.sqrt(
              smoothedPitch * smoothedPitch + smoothedRoll * smoothedRoll
            );

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
              eulerAngles: {
                pitch: smoothedPitch,
                roll: smoothedRoll,
                yaw: prev.eulerAngles.yaw,
              },
              pitch: smoothedPitch,
              roll: smoothedRoll,
              angle,
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

    const magnetometerSubscription = Magnetometer.addListener(
      (magnetometerData) => {
        setSensorData((prev) => ({
          ...prev,
          magnetometer: magnetometerData,
        }));
      }
    );

    let barometerSubscription: any = null;
    (async () => {
      try {
        const isAvailable = await Barometer.isAvailableAsync();
        if (isAvailable) {
          barometerSubscription = Barometer.addListener((barometerData) => {
            setSensorData((prev) => ({
              ...prev,
              barometer: {
                pressure: barometerData.pressure,
                relativeAltitude: barometerData.relativeAltitude || 0,
              },
            }));
          });
        } else {
        }
      } catch (error) {
        console.log("Barometer setup failed:", error);
      }
    })();

    return () => {
      gyroscopeSubscription?.remove();
      accelerometerSubscription?.remove();
      magnetometerSubscription?.remove();
      barometerSubscription?.remove();
    };
  }, [
    calibrationOffset,
    lastTimestamp,
    sensorData.pitch,
    sensorData.roll,
    smoothingFactor,
  ]);

  useEffect(() => {
    let locationSubscription: any = null;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 5,
            },
            (location) => {
              setSensorData((prev) => ({
                ...prev,
                location: {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  altitude: location.coords.altitude || 0,
                  accuracy: location.coords.accuracy || 0,
                },
                heading: location.coords.heading || 0,
                speed: location.coords.speed || 0,
              }));
            }
          );
        } else if (!permissionsRequested.location) {
          setPermissionsRequested((prev) => ({ ...prev, location: true }));
          const { status: newStatus } =
            await Location.requestForegroundPermissionsAsync();
          if (newStatus === "granted") {
            locationSubscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 5,
              },
              (location) => {
                setSensorData((prev) => ({
                  ...prev,
                  location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    altitude: location.coords.altitude || 0,
                    accuracy: location.coords.accuracy || 0,
                  },
                  heading: location.coords.heading || 0,
                  speed: location.coords.speed || 0,
                }));
              }
            );
          } else {
            setSensorData((prev) => ({
              ...prev,
              location: {
                latitude: 0,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
              },
              heading: 0,
              speed: 0,
            }));
          }
        } else {
          setSensorData((prev) => ({
            ...prev,
            location: {
              latitude: 0,
              longitude: 0,
              altitude: 0,
              accuracy: 0,
            },
            heading: 0,
            speed: 0,
          }));
        }
      } catch (error) {
        setSensorData((prev) => ({
          ...prev,
          location: {
            latitude: 0,
            longitude: 0,
            altitude: 0,
            accuracy: 0,
          },
          heading: 0,
          speed: 0,
        }));
      }
    })();

    return () => {
      locationSubscription?.remove();
    };
  }, [permissionsRequested.location]);

  const calibrate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetCalibration = () => {
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

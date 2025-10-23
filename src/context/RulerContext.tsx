import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dimensions } from "react-native";

export interface MeasurementPoint {
  x: number;
  y: number;
  id: string;
}

export interface Measurement {
  id: string;
  startPoint: MeasurementPoint;
  endPoint: MeasurementPoint;
  distance: number;
  unit: "cm" | "m" | "ft" | "in";
  timestamp: Date;
}

interface RulerContextType {
  measurements: Measurement[];
  currentPoints: MeasurementPoint[];
  isMeasuring: boolean;
  addPoint: (x: number, y: number) => void;
  clearPoints: () => void;
  calculateDistance: (
    point1: MeasurementPoint,
    point2: MeasurementPoint
  ) => number;
  deleteMeasurement: (id: string) => void;
  clearAllMeasurements: () => void;
  setUnit: (unit: "cm" | "m" | "ft" | "in") => void;
  currentUnit: "cm" | "m" | "ft" | "in";
  calibrateRuler: (knownDistanceCm: number, pixelDistance: number) => void;
  calibrationFactor: number;
  isCalibrated: boolean;
  resetCalibration: () => void;
}

const RulerContext = createContext<RulerContextType | undefined>(undefined);

interface RulerProviderProps {
  children: ReactNode;
}

export const RulerProvider: React.FC<RulerProviderProps> = ({ children }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentPoints, setCurrentPoints] = useState<MeasurementPoint[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<"cm" | "m" | "ft" | "in">(
    "cm"
  );
  const [calibrationFactor, setCalibrationFactor] = useState<number>(0); // Start with 0 to force default calculation
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);

  const screenDimensions = Dimensions.get("window");
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  const defaultCalibrationFactor = () => {
    const estimatedPixelsPerCm = screenWidth / 8; // Assume 8cm phone width

    return estimatedPixelsPerCm;
  };

  const addPoint = (x: number, y: number) => {
    const newPoint: MeasurementPoint = {
      x,
      y,
      id: `point_${Date.now()}_${Math.random()}`,
    };

    if (currentPoints.length === 0) {
      setCurrentPoints([newPoint]);
      setIsMeasuring(true);
    } else if (currentPoints.length === 1) {
      const startPoint = currentPoints[0];
      const distance = calculateDistance(startPoint, newPoint);

      const measurement: Measurement = {
        id: `measurement_${Date.now()}`,
        startPoint,
        endPoint: newPoint,
        distance,
        unit: currentUnit,
        timestamp: new Date(),
      };

      setMeasurements((prev) => [...prev, measurement]);
      setCurrentPoints([]);
      setIsMeasuring(false);
    }
  };

  const clearPoints = () => {
    setCurrentPoints([]);
    setIsMeasuring(false);
  };

  const calculateDistance = (
    point1: MeasurementPoint,
    point2: MeasurementPoint
  ): number => {
    const pixelDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );

    const effectiveCalibrationFactor =
      calibrationFactor > 0 ? calibrationFactor : defaultCalibrationFactor();

    const distanceInCm = pixelDistance / effectiveCalibrationFactor;

    switch (currentUnit) {
      case "cm":
        return distanceInCm;
      case "m":
        return distanceInCm / 100;
      case "ft":
        return distanceInCm / 30.48;
      case "in":
        return distanceInCm / 2.54;
      default:
        return distanceInCm;
    }
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMeasurements = () => {
    setMeasurements([]);
    setCurrentPoints([]);
    setIsMeasuring(false);
  };

  const setUnit = (unit: "cm" | "m" | "ft" | "in") => {
    setCurrentUnit(unit);
    setMeasurements((prev) =>
      prev.map((m) => ({
        ...m,
        unit,
        distance: calculateDistance(m.startPoint, m.endPoint),
      }))
    );
  };

  const calibrateRuler = (knownDistanceCm: number, pixelDistance: number) => {
    const newCalibrationFactor = pixelDistance / knownDistanceCm;
    setCalibrationFactor(newCalibrationFactor);
    setIsCalibrated(true);
  };

  const resetCalibration = () => {
    setCalibrationFactor(0);
    setIsCalibrated(false);
  };

  const value: RulerContextType = {
    measurements,
    currentPoints,
    isMeasuring,
    addPoint,
    clearPoints,
    calculateDistance,
    deleteMeasurement,
    clearAllMeasurements,
    setUnit,
    currentUnit,
    calibrateRuler,
    calibrationFactor,
    isCalibrated,
    resetCalibration,
  };

  return (
    <RulerContext.Provider value={value}>{children}</RulerContext.Provider>
  );
};

export const useRuler = (): RulerContextType => {
  const context = useContext(RulerContext);
  if (context === undefined) {
    throw new Error("useRuler must be used within a RulerProvider");
  }
  return context;
};

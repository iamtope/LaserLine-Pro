import React, { createContext, useContext, useState, ReactNode } from "react";

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

  const addPoint = (x: number, y: number) => {
    console.log(
      "addPoint called with:",
      x,
      y,
      "currentPoints:",
      currentPoints.length
    );

    const newPoint: MeasurementPoint = {
      x,
      y,
      id: `point_${Date.now()}_${Math.random()}`,
    };

    if (currentPoints.length === 0) {
      // First point
      console.log("Adding first point");
      setCurrentPoints([newPoint]);
      setIsMeasuring(true);
    } else if (currentPoints.length === 1) {
      // Second point - complete measurement
      console.log("Adding second point, completing measurement");
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
    // Calculate pixel distance
    const pixelDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );

    // Convert to real-world distance (rough estimation)
    // This is a simplified conversion - in a real app, you'd use camera calibration
    // and object detection for more accurate measurements
    const screenWidth = 375; // Average phone screen width in pixels
    const realWorldWidth = 0.15; // Average phone width in meters (15cm)
    const pixelsPerMeter = screenWidth / realWorldWidth;

    const distanceInMeters = pixelDistance / pixelsPerMeter;

    // Convert to current unit
    switch (currentUnit) {
      case "cm":
        return distanceInMeters * 100;
      case "m":
        return distanceInMeters;
      case "ft":
        return distanceInMeters * 3.28084;
      case "in":
        return distanceInMeters * 39.3701;
      default:
        return distanceInMeters;
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
    // Recalculate all measurements with new unit
    setMeasurements((prev) =>
      prev.map((m) => ({
        ...m,
        unit,
        distance: calculateDistance(m.startPoint, m.endPoint),
      }))
    );
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

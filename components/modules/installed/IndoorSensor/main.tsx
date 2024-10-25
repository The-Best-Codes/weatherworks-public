"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { convert } from "@/utils/modules/unitConversions";
import { Label } from "@/components/ui/label";
import calculateFeelsLikeTemperature from "./util/FeelsLikeCalc";
import { Signal, CircleAlert, WifiOff, AlertTriangle } from "lucide-react";
import { getAriaLabelUnit } from "@/utils/accessibility/unitAriaLabels";

interface IndoorDataReceived {
  id: string | number;
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
  gas: number;
  accessUrl: string;
  received: number;
}

interface IndoorSensorModuleProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    temperature: "C" | "F" | "K";
    pressure: "hPa" | "inHg" | "mmHg" | "mbar";
  };
  refreshInterval: number;
}

interface ErrorState {
  type: "network" | "data" | "conversion" | null;
  message: string;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const DefaultIndoorSensorModule: React.FC<IndoorSensorModuleProps> = ({
  theme,
  units,
  refreshInterval,
}) => {
  const themeClasses: ThemeClasses = themes[theme];
  const [data, setData] = useState<IndoorDataReceived | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorState>({
    type: null,
    message: "",
    retryCount: 0,
  });

  const validateData = (data: IndoorDataReceived): boolean => {
    if (!data) return false;

    // Temperature validation (-50°C to 100°C is a reasonable range for indoor sensors)
    if (data.temperature < -50 || data.temperature > 100) {
      throw new Error("Temperature reading out of valid range");
    }

    // Humidity validation (0-100%)
    if (data.humidity < 0 || data.humidity > 100) {
      throw new Error("Humidity reading out of valid range");
    }

    // Pressure validation (800-1200 hPa is typical range at sea level)
    if (data.pressure < 800 || data.pressure > 1200) {
      throw new Error("Pressure reading out of valid range");
    }

    // Gas resistance validation (should be positive)
    if (data.gas < 0) {
      throw new Error("Invalid gas resistance reading");
    }

    return true;
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/installed/IndoorSensor/latest", {
        next: {
          revalidate: refreshInterval,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newData = await response.json();

      if (!validateData(newData)) {
        throw new Error("Invalid sensor data received");
      }

      setData(newData);
      setLoading(false);
      setError({ type: null, message: "", retryCount: 0 });
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);

      const error = err as Error;
      const isNetworkError =
        error instanceof TypeError && error.message === "Failed to fetch";
      const newErrorState: ErrorState = {
        type: isNetworkError ? "network" : "data",
        message: error.message || "Unknown error occurred",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        retryCount: (error as any).retryCount + 1 || 1,
      };

      setError(newErrorState);

      // Implement retry logic for network errors
      if (isNetworkError && newErrorState.retryCount < MAX_RETRIES) {
        setTimeout(fetchData, RETRY_DELAY);
      }
    }
  }, [refreshInterval]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const ErrorDisplay = () => (
    <Card className={`w-[350px] h-[450px] rounded-lg ${themeClasses.card}`}>
      <CardContent className="p-4 pb-0 flex flex-col items-center justify-center h-full">
        {error.type === "network" ? (
          <>
            <WifiOff className="w-12 h-12 text-red-500 mb-4" />
            <span
              className={`text-base font-bold text-center ${themeClasses.text}`}
            >
              Connection Error
            </span>
            <span className={`text-sm text-center mt-2 ${themeClasses.text}`}>
              {error.retryCount < MAX_RETRIES
                ? `Attempting to reconnect... (${error.retryCount}/${MAX_RETRIES})`
                : "Unable to connect to sensor. Please check your connection."}
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
            <span
              className={`text-base font-bold text-center ${themeClasses.text}`}
            >
              Sensor Error
            </span>
            <span className={`text-sm text-center mt-2 ${themeClasses.text}`}>
              {error.message || "Unable to read sensor data"}
            </span>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    const DataItem = () => (
      <div className="mb-4">
        <Skeleton className={`w-1/4 h-4 mb-2 ${themeClasses.skeleton}`} />
        <div className="flex items-baseline">
          <Skeleton className={`w-24 h-12 mr-2 ${themeClasses.skeleton}`} />
          <Skeleton className={`w-8 h-6 ${themeClasses.skeleton}`} />
        </div>
      </div>
    );

    return (
      <Card className={`w-[350px] h-[450px] rounded-lg ${themeClasses.card}`}>
        <CardContent className="p-4 pb-0">
          <Skeleton className={`w-1/3 h-6 mb-4 ${themeClasses.skeleton}`} />
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <DataItem key={index} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Skeleton className={`w-4 h-4 ${themeClasses.skeleton}`} />
            <Skeleton className={`w-40 h-4 ${themeClasses.skeleton}`} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error.type) {
    return <ErrorDisplay />;
  }

  if (!data) {
    return (
      <Card
        className={`w-[350px] h-[450px] rounded-lg p-4 ${themeClasses.card}`}
      >
        <CardContent className="p-4 pb-0 flex flex-col items-center justify-center h-full">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
          <span className={`text-base font-bold ${themeClasses.text}`}>
            No Data Available
          </span>
          <span className={`text-sm text-center mt-2 ${themeClasses.text}`}>
            Waiting for sensor data...
          </span>
        </CardContent>
      </Card>
    );
  }

  const safeConvert = (
    value: number,
    fromUnit: string,
    toUnit: string
  ): number => {
    try {
      if (fromUnit === toUnit) return value;
      const converted = convert(value, fromUnit, toUnit);
      if (isNaN(converted) || !isFinite(converted)) {
        throw new Error("Invalid conversion result");
      }
      return converted;
    } catch (err) {
      const error = err as Error;
      console.error(`Conversion error: ${error.message}`);
      return value; // Fall back to original value
    }
  };

  const safeCalculateIAQ = (temp: number, humidity: number, gas: number) => {
    try {
      return calculateIAQ(temp, humidity, gas);
    } catch (err) {
      const error = err as Error;
      console.error("IAQ calculation error:", error.message);
      return { iaq: 0 }; // Return safe default
    }
  };

  return (
    <Card className={`w-[350px] h-[450px] rounded-lg ${themeClasses.card}`}>
      <CardContent className="p-4 pb-0">
        <span className={`text-base font-bold ${themeClasses.text}`}>
          Indoor
        </span>
        <div className="flex flex-col gap-0">
          <IndoorItem
            label="Temperature"
            value={safeConvert(data.temperature, "C", units.temperature)}
            fromUnit="C"
            toUnit={units.temperature}
            themeClasses={themeClasses}
          />
          <IndoorItem
            label="Feels Like"
            value={safeConvert(
              calculateFeelsLikeTemperature(data.humidity, 0, data.temperature),
              "C",
              units.temperature
            )}
            fromUnit="C"
            toUnit={units.temperature}
            themeClasses={themeClasses}
          />
          <IndoorItem
            label="Humidity"
            value={data.humidity}
            fromUnit="%"
            toUnit="%"
            themeClasses={themeClasses}
          />
          <IndoorItem
            label="Pressure"
            value={safeConvert(data.pressure, "hPa", units.pressure)}
            fromUnit="hPa"
            toUnit={units.pressure}
            themeClasses={themeClasses}
          />
          <IndoorItem
            label="Indoor Air Quality"
            value={
              safeCalculateIAQ(data.temperature, data.humidity, data.gas).iaq
            }
            fromUnit="ppm"
            toUnit="ppm"
            themeClasses={themeClasses}
          />
        </div>
        <ReceivedTime timestamp={data.timestamp} themeClasses={themeClasses} />
      </CardContent>
    </Card>
  );
};

const IndoorItem: React.FC<{
  label: string;
  value: number;
  fromUnit: string;
  toUnit: string;
  themeClasses: ThemeClasses;
}> = React.memo(
  ({
    label,
    value,
    toUnit,
    themeClasses,
  }: {
    label: string;
    value: number;
    fromUnit: string;
    toUnit: string;
    themeClasses: ThemeClasses;
  }) => (
    <div className="flex flex-col mb-1">
      <Label className={`text-sm ${themeClasses.label}`}>{label}</Label>
      <div className="flex items-baseline">
        <span className={`text-5xl font-bold mr-1 ${themeClasses.text}`}>
          {isNaN(value) ? "N/A" : value.toFixed(2)}
        </span>
        <span
          aria-label={getAriaLabelUnit(toUnit)}
          className={`text-lg ${themeClasses.text}`}
        >
          {toUnit}
        </span>
      </div>
    </div>
  )
) as React.FC<{
  label: string;
  value: number;
  fromUnit: string;
  toUnit: string;
  themeClasses: ThemeClasses;
}> & {
  displayName: string;
};

IndoorItem.displayName = "IndoorItem";

const ReceivedTime: React.FC<{
  timestamp: number;
  themeClasses: ThemeClasses;
}> = React.memo(
  ({
    timestamp,
    themeClasses,
  }: {
    timestamp: number;
    themeClasses: ThemeClasses;
  }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => clearInterval(timer);
    }, []);

    const timeDifference = getTimeDifference(timestamp, currentTime);
    const isOld = currentTime - timestamp > 300000; // 5 minutes in milliseconds
    const isCriticallyOld = currentTime - timestamp > 900000; // 15 minutes

    return (
      <div className={`flex items-center gap-2 mt-2 ${themeClasses.text}`}>
        {!isOld && <Signal />}
        <div className={"flex items-center"}>
          {isOld && (
            <CircleAlert
              className={isCriticallyOld ? "text-red-500" : "text-yellow-500"}
            />
          )}
          <span
            className={`italic text-sm ml-2 ${
              isCriticallyOld
                ? "text-red-500"
                : isOld
                ? "text-yellow-500"
                : themeClasses.text
            }`}
          >
            {isCriticallyOld
              ? "Data significantly outdated"
              : isOld
              ? "Data may be outdated"
              : "Data received"}{" "}
            {timeDifference} ago
          </span>
        </div>
      </div>
    );
  }
) as React.FC<{ timestamp: number; themeClasses: ThemeClasses }> & {
  displayName?: string;
};

ReceivedTime.displayName = "ReceivedTime";

const getTimeDifference = (timestamp: number, currentTime: number) => {
  if (!timestamp || isNaN(timestamp)) return "unknown time";

  const diff = currentTime - timestamp;
  if (diff < 0) return "just now"; // Handle future timestamps gracefully

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const years = Math.floor(days / 365);

  if (years > 1) return `${years} yrs`;
  if (years > 0) return `${years} yr`;
  if (weeks > 1) return `${weeks} wks`;
  if (weeks > 0) return `${weeks} wk`;
  if (days > 1) return `${days} days`;
  if (days > 0) return `${days} day`;
  if (hours > 1) return `${hours} hrs`;
  if (hours > 0) return `${hours} hr`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds} sec`;
};

const calculateIAQ = function (
  temperature: number,
  humidity: number,
  gasResistance: number
) {
  try {
    // Input validation
    if (isNaN(temperature) || isNaN(humidity) || isNaN(gasResistance)) {
      throw new Error("Invalid input parameters for IAQ calculation");
    }

    // Constants for the IAQ calculation
    const hum_baseline = 40.0;
    const hum_weighting = 0.25; // balance between humidity and gas resistance

    // Calculate absolute humidity (in g/m^3)
    const tempKelvin = temperature + 273.15;
    const rho_max =
      (6.112 * 100 * Math.exp((17.62 * temperature) / (243.12 + temperature))) /
      (461.52 * tempKelvin);
    const hum_abs = humidity * 10 * rho_max;

    // Compensation for humidity in gas resistance
    const ph_slope = -0.9; // this value may need to be adjusted based on your setup
    const comp_gas = gasResistance * Math.exp(ph_slope * hum_abs);

    // Calculate gas baseline and humidity baseline
    const gas_baseline = 50000; // example value, should be calibrated
    const gas_offset = gas_baseline - comp_gas;
    const hum_offset = humidity - hum_baseline;

    // Calculate scores for humidity and gas resistance
    let hum_score, gas_score;

    if (hum_offset > 0) {
      hum_score = (100 - hum_baseline - hum_offset) / (100 - hum_baseline);
      hum_score *= hum_weighting * 100;
    } else {
      hum_score = (hum_baseline + hum_offset) / hum_baseline;
      hum_score *= hum_weighting * 100;
    }

    if (gas_offset > 0) {
      gas_score = comp_gas / gas_baseline;
      gas_score *= 100 - hum_weighting * 100;
    } else {
      gas_score = 100 - hum_weighting * 100;
    }

    // Calculate the IAQ score
    const air_quality_score = hum_score + gas_score;

    return {
      iaq: air_quality_score,
      breath_voc: air_quality_score * 0.1,
      co2_equivalent: air_quality_score * 400,
      comp_gas: comp_gas,
      hum_abs: hum_abs,
      hum_score: hum_score,
      gas_score: gas_score,
      hum_offset: hum_offset,
      gas_offset: gas_offset,
    };
  } catch (err) {
    const error = err as Error;
    console.error("Error in IAQ calculation:", error.message);
    throw error; // Re-throw to be handled by caller
  }
};

export default React.memo(DefaultIndoorSensorModule);

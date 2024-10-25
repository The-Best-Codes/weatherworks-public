"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { convert } from "@/utils/modules/unitConversions";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { getAriaLabelUnit } from "@/utils/accessibility/unitAriaLabels";
import { Signal, CircleAlert } from "lucide-react";
import useLatestObs from "@/utils/swd_mirror/useLatestObs";

interface OutdoorWeatherProps {
  refreshInterval: number;
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    temperature: "C" | "F" | "K";
    speed: "m/s" | "km/h" | "mph" | "knots";
    pressure: "hPa" | "inHg" | "mmHg" | "mbar";
  };
}

const TempestCurrentStats: React.FC<OutdoorWeatherProps> = ({
  refreshInterval,
  theme,
  units,
}) => {
  const {
    lastUpdated,
    air_temperature,
    station_pressure,
    relative_humidity,
    wind_avg,
    feels_like,
    timestamp,
  } = useLatestObs(refreshInterval);

  const themeClasses: ThemeClasses = themes[theme];

  const formatValue = (
    value: number,
    decimals: number = 0,
    fromUnit: string,
    toUnit: string,
    convertUnit: boolean
  ): string => {
    try {
      if (convertUnit) {
        const convertedValue = convert(value, fromUnit, toUnit);
        return convertedValue.toFixed(decimals);
      } else {
        return value.toFixed(decimals);
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Conversion error: ${error.message}`);
      return value.toFixed(decimals); // Fall back to original value
    }
  };

  const WeatherItem: React.FC<{
    label: string;
    value: string;
    unit: string;
  }> = ({ label, value, unit }) => (
    <div className="flex flex-col mb-1">
      <Label className={`text-sm ${themeClasses.label}`}>{label}</Label>
      <div className="flex items-baseline">
        <span className={`text-5xl font-bold mr-1 ${themeClasses.text}`}>
          {value}
        </span>
        <span
          aria-label={getAriaLabelUnit(unit)}
          className={`text-lg ${themeClasses.text}`}
        >
          {unit}
        </span>
      </div>
    </div>
  );

  const weatherItems = useMemo(
    () => [
      {
        label: "Temperature",
        value: formatValue(air_temperature, 1, "C", units.temperature, true),
        unit: units.temperature,
      },
      {
        label: "Feels Like",
        value: formatValue(feels_like, 1, "C", units.temperature, true),
        unit: units.temperature,
      },
      {
        label: "Humidity",
        value: formatValue(relative_humidity, 0, "%", "%", false),
        unit: "%",
      },
      {
        label: "Pressure",
        value: formatValue(station_pressure, 2, "hPa", units.pressure, true),
        unit: units.pressure,
      },
      {
        label: "Wind",
        value: formatValue(wind_avg, 1, "m/s", units.speed, true),
        unit: units.speed,
      },
    ],
    [
      air_temperature,
      feels_like,
      relative_humidity,
      station_pressure,
      wind_avg,
      units,
    ]
  );

  return (
    <Card className={`w-[350px] h-[450px] ${themeClasses.card}`}>
      <CardContent className="p-4">
        <span className={`text-base font-bold ${themeClasses.text}`}>
          Outdoor
        </span>
        {!lastUpdated ? (
          <div className="space-y-4 mt-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className={`h-14 w-full ${themeClasses.skeleton}`}
              />
            ))}
          </div>
        ) : (
          <div>
            {weatherItems.map((item) => (
              <WeatherItem key={item.label} {...item} />
            ))}
            <ReceivedTime timestamp={timestamp} themeClasses={themeClasses} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ReceivedTime: React.FC<{
  timestamp: number;
  themeClasses: ThemeClasses;
}> = ({ timestamp, themeClasses }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timestampInMs = timestamp * 1000;
  const timeDifference = getTimeDifference(timestampInMs, currentTime);
  const isOld = currentTime - timestampInMs > 300000; // 5 minutes in milliseconds

  return (
    <div className={`flex items-center gap-2 mt-2 ${themeClasses.text}`}>
      {!isOld && <Signal />}
      <div className="flex items-center">
        {isOld && <CircleAlert className="text-red-500 mr-1" />}
        <span
          className={`italic text-sm ${
            isOld ? "text-red-500" : themeClasses.text
          }`}
        >
          Data received {timeDifference} ago
        </span>
      </div>
    </div>
  );
};

const getTimeDifference = (timestamp: number, currentTime: number) => {
  try {
    const diff = currentTime - timestamp;
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
  } catch (error) {
    console.error(error);
    return "unknown time";
  }
};

export default React.memo(TempestCurrentStats);

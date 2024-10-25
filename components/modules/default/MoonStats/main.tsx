"use client";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import ApiData from "@/config/ww_apiData.json";
import MoonPhase from "./util/MoonPhaseGraphic";
import SunCalc from "suncalc";
import { AlertCircle } from "lucide-react";

interface MoonStatsProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
}

interface CelestialTimes {
  date?: string;
  moonrise?: string | number;
  moonset?: string | number;
  moonIllumination?: number;
  moonPhase?: number | string;
  moonAngle?: number | string;
  checkDate?: Date | string | number;
}

const MoonStats = ({
  theme = "defaultLight",
  refreshInterval = 60000,
}: MoonStatsProps) => {
  const [celestialTimes, setCelestialTimes] = useState<CelestialTimes | null>(
    null
  );
  const [moonRotation, setMoonRotation] = useState(0);
  const [moonRotationAngle, setMoonRotationAngle] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // State for errors

  const toggleMoonRotation = () => {
    setMoonRotation((prevRotation) =>
      prevRotation === 0 ? moonRotationAngle : 0
    );
  };

  function calculateMoonTimes(
    latitude: number,
    longitude: number,
    date = new Date()
  ) {
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error("Invalid latitude or longitude");
    }

    function findMoonTimes(startDate: Date) {
      for (let i = 0; i < 3; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        const moonTimes = SunCalc.getMoonTimes(checkDate, latitude, longitude);
        if (moonTimes.rise || moonTimes.set) {
          return {
            rise: moonTimes.rise,
            set: moonTimes.set,
            checkDate: checkDate,
          };
        }
      }
      return { rise: null, set: null, checkDate: startDate };
    }

    const moonTimes = findMoonTimes(date);
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const moonPhase = moonIllumination.phase;

    const formatTime = (time: Date | null, referenceDate: Date) => {
      if (!time) return "Not visible";
      if (referenceDate && time.getDate() !== referenceDate.getDate()) {
        return `${time.toLocaleTimeString()} (${time.toLocaleDateString()})`;
      }
      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    };

    const moonAngle = moonIllumination.angle;

    const radiansToDegrees = (radians: number) => {
      return radians * (180 / Math.PI);
    };

    setMoonRotationAngle(radiansToDegrees(moonAngle) + 90);

    return {
      date: date.toDateString(),
      moonrise: formatTime(moonTimes.rise, date),
      moonset: formatTime(moonTimes.set, date),
      moonPhase: moonPhase.toFixed(2),
      moonIllumination: moonIllumination.fraction.toFixed(2),
      allMoonData: { ...moonTimes, ...moonIllumination },
    };
  }

  function getMoonPhaseName(phase: number) {
    phase = phase % 1;
    if (phase < 0) phase += 1;

    const phases = [
      { name: "New Moon", start: 0.97, end: 0.03 },
      { name: "Waxing Crescent", start: 0.03, end: 0.22 },
      { name: "First Quarter", start: 0.22, end: 0.28 },
      { name: "Waxing Gibbous", start: 0.28, end: 0.47 },
      { name: "Full Moon", start: 0.47, end: 0.53 },
      { name: "Waning Gibbous", start: 0.53, end: 0.72 },
      { name: "Last Quarter", start: 0.72, end: 0.78 },
      { name: "Waning Crescent", start: 0.78, end: 0.97 },
    ];

    for (let i = 0; i < phases.length; i++) {
      if (phase >= phases[i].start && phase < phases[i].end) {
        return phases[i].name;
      }
    }

    if (phase >= phases[0].start || phase < phases[0].end) {
      return phases[0].name;
    }

    return "Unknown";
  }

  useEffect(() => {
    const fetchData = async () => {
      setError(null); // Clear any previous errors
      setLoading(true);

      try {
        const latitude: number = parseInt(
          ApiData.metaData.latitude as string
        ) as number;
        const longitude: number = parseInt(
          ApiData.metaData.longitude as string
        ) as number;

        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Invalid location data");
        }

        const times = calculateMoonTimes(latitude, longitude);
        setCelestialTimes(times as unknown as CelestialTimes);
      } catch (err) {
        console.error("Error fetching moon data:", err);
        setError("Failed to load moon data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const themeClass: ThemeClasses = themes[theme];

  if (loading) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClass.card}`}>
        <CardContent className="flex flex-col w-full p-4 items-center">
          <Skeleton
            className={`w-[168px] h-[168px] rounded-full mb-4 ${themeClass.skeleton}`}
          />
          <Skeleton className={`h-4 w-16 mb-2 ${themeClass.skeleton}`} />
          <Skeleton className={`h-12 w-24 mb-4 ${themeClass.skeleton}`} />
          <Skeleton className={`h-4 w-20 mb-2 ${themeClass.skeleton}`} />
          <Skeleton className={`h-10 w-32 mb-4 ${themeClass.skeleton}`} />
          <Skeleton className={`h-4 w-28 mb-2 ${themeClass.skeleton}`} />
          <Skeleton className={`h-10 w-32 ${themeClass.skeleton}`} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClass.card}`}>
        <CardContent className="flex flex-col w-full p-4 justify-center items-center">
          <AlertCircle className="w-24 h-24 text-red-500 mb-4" />
          <span className="text-center text-red-500">{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-[350px] h-[450px] ${themeClass.card}`}>
      <CardContent className="flex flex-col w-full p-4 items-center">
        <div
          aria-label="Moon Phase"
          onClick={toggleMoonRotation}
          className="cursor-pointer w-1/2 rounded-full mb-4 flex flex-col justify-center items-center"
        >
          <MoonPhase
            phase={(celestialTimes?.moonPhase as number) || 0}
            size={170}
            rotation={moonRotation}
          />
          <span
            className={`font-bold ${themeClass.text} ${
              moonRotation === 0
                ? "text-[0px] h-[0px]"
                : "text-sm mt-2 -mb-2 h-4"
            } transition-all duration-300`}
            aria-hidden={moonRotation === 0 ? "true" : "false"}
          >
            {moonRotationAngle.toFixed(0)}&deg; Rotation
          </span>
        </div>
        <Label className={`text-sm ${themeClass.label}`}>Moon Phase</Label>
        <span
          className={`text-5xl font-bold ${themeClass.text} transition-all duration-300`}
          data-illumination={celestialTimes?.moonIllumination}
        >
          {((celestialTimes?.moonIllumination as number) * 100).toFixed(0)}%
        </span>
        <Label className={`text-sm ${themeClass.label}`}>Phase Name</Label>
        <span className={`text-2xl font-bold ${themeClass.text}`}>
          {getMoonPhaseName(Number(celestialTimes?.moonPhase))}
        </span>
        <Label className={`text-sm ${themeClass.label}`}>Moonrise Time</Label>
        <span className={`text-lg font-semibold ${themeClass.text}`}>
          {celestialTimes?.moonrise}
        </span>
        <Label className={`text-sm ${themeClass.label}`}>Moonset Time</Label>
        <span className={`text-lg font-semibold ${themeClass.text}`}>
          {celestialTimes?.moonset}
        </span>
      </CardContent>
    </Card>
  );
};

export default MoonStats;

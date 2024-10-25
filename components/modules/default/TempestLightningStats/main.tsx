"use client";
import React, { useMemo, useState, useEffect } from "react";
import { ThemeClasses, themes } from "@/utils/modules/defaultModuleThemes";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import { convert } from "@/utils/modules/unitConversions";
import { getAriaLabelUnit } from "@/utils/accessibility/unitAriaLabels";
import useLatestObs from "@/utils/swd_mirror/useLatestObs";

interface LightningModuleProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    distance: "mm" | "in" | "cm" | "m" | "km" | "mi" | "ft" | "yd";
  };
  refreshInterval: number;
}

// Extract the relative time calculation logic
const getRelativeTime = (time: number): string => {
  try {
    const now = Date.now();
    const timeDiff = now - time * 1000;
    const diffTexts = [
      {
        value: Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365)),
        unit: "year",
      },
      { value: Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7)), unit: "week" },
      { value: Math.floor(timeDiff / (1000 * 60 * 60 * 24)), unit: "day" },
      { value: Math.floor(timeDiff / (1000 * 60 * 60)), unit: "hour" },
      { value: Math.floor(timeDiff / (1000 * 60)), unit: "minute" },
      { value: Math.floor(timeDiff / 1000), unit: "second" },
    ];

    for (const { value, unit } of diffTexts) {
      if (value > 0) {
        return `${value} ${unit}${value !== 1 ? "s" : ""}`;
      }
    }

    return "0 seconds";
  } catch (err) {
    console.error(err);
    return "unknown";
  }
};

// Separate LastStrikeTime component
const LastStrikeTime: React.FC<{ epoch: number }> = ({ epoch }) => {
  const [lastStrikeTime, setLastStrikeTime] = useState("");

  useEffect(() => {
    const updateLastStrikeTime = () =>
      setLastStrikeTime(getRelativeTime(epoch));
    updateLastStrikeTime();
    const intervalId = setInterval(updateLastStrikeTime, 1000);
    return () => clearInterval(intervalId);
  }, [epoch]);

  return <span className="text-3xl font-bold">{lastStrikeTime}</span>;
};

const DefaultLightningModule: React.FC<LightningModuleProps> = ({
  theme,
  units,
  refreshInterval,
}) => {
  const {
    lightning_strike_count_last_1hr,
    lightning_strike_count_last_3hr,
    lightning_strike_count,
    lightning_strike_last_distance,
    lightning_strike_last_epoch,
    lastUpdated,
  } = useLatestObs(refreshInterval);

  const themeClasses: ThemeClasses = themes[theme];

  const memoizedData = useMemo(() => {
    const recentStrike =
      Date.now() - lightning_strike_last_epoch * 1000 <= 300000; // 300 seconds
    const lastStrikeDistance = convert(
      lightning_strike_last_distance,
      "km",
      units.distance
    ).toFixed(2);

    return {
      recentStrike,
      lastStrikeDistance,
      strikes1hrs: lightning_strike_count_last_1hr,
      strikes3hrs: lightning_strike_count_last_3hr,
      strikeRecently: lightning_strike_count,
    };
  }, [
    lightning_strike_count_last_1hr,
    lightning_strike_count_last_3hr,
    lightning_strike_count,
    lightning_strike_last_distance,
    lightning_strike_last_epoch,
    units.distance,
  ]);

  if (!lastUpdated) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClasses.card} p-8`}>
        <div className="flex flex-col gap-6">
          <div className="w-full flex justify-center">
            <Zap
              className="opacity-20 animate-pulse"
              fill="gray"
              stroke="gray"
              size={128}
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Skeleton
              className={`${themeClasses.skeleton} w-24 h-8 animate-pulse`}
            />
            <Skeleton
              className={`${themeClasses.skeleton} w-16 h-12 animate-pulse`}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton
              className={`${themeClasses.skeleton} w-32 h-6 animate-pulse`}
            />
            <Skeleton
              className={`${themeClasses.skeleton} w-24 h-10 animate-pulse`}
            />
          </div>
        </div>
      </Card>
    );
  }

  const {
    recentStrike,
    lastStrikeDistance,
    strikes1hrs,
    strikes3hrs,
    strikeRecently,
  } = memoizedData;

  return (
    <Card
      className={`w-[350px] h-[450px] ${themeClasses.card} ${themeClasses.text}`}
    >
      <CardContent className="p-4 pb-0">
        <div className="w-full flex justify-center">
          <Zap
            fill={recentStrike ? "orange" : "grey"}
            stroke={recentStrike ? "orange" : "grey"}
            size={128}
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center mt-4 gap-2">
          <div className="flex flex-col items-center">
            <Label className={`${themeClasses.label}`}>Last 1 hour</Label>
            <span className="text-5xl font-bold">{strikes1hrs}</span>
          </div>
          <div className="flex flex-col items-center">
            <Label className={`${themeClasses.label}`}>Last Strike Time</Label>
            <LastStrikeTime epoch={lightning_strike_last_epoch} />
          </div>
          <div className="flex flex-col items-center">
            <Label className={`${themeClasses.label}`}>
              Last Strike Distance
            </Label>
            <div className="flex flex-row items-baseline">
              <span className="text-3xl font-bold">{lastStrikeDistance}</span>
              <span
                aria-label={getAriaLabelUnit(units.distance)}
                className="text-xl"
              >
                {units.distance}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Label className={`${themeClasses.label}`}>Last 3 hours</Label>
            <span className="text-2xl font-bold">{strikes3hrs}</span>
          </div>
          <div className="flex flex-col items-center -mt-2">
            <Label className={`${themeClasses.label}`}>Recently</Label>
            <span className="text-2xl font-bold">{strikeRecently}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(DefaultLightningModule);

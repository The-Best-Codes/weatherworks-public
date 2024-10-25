"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { convert } from "@/utils/modules/unitConversions";
import Compass from "./util/CompassGraphic";
import {
  getAriaLabelUnit,
  getAriaLabelDirection,
} from "@/utils/accessibility/unitAriaLabels";
import useLatestObs from "@/utils/swd_mirror/useLatestObs";

interface WindStatsProps {
  refreshInterval: number;
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    speed: "m/s" | "km/h" | "mph" | "knots";
  };
}

const DefaultTempestWindStats: React.FC<WindStatsProps> = ({
  refreshInterval = 60000,
  theme,
  units,
}) => {
  const { lastUpdated, wind_avg, wind_direction, wind_gust, wind_lull } =
    useLatestObs(refreshInterval);

  const themeClasses: ThemeClasses = themes[theme];

  const getCardinalDirection = (
    direction: number,
    depth: 1 | 2 | 3,
    abbr: boolean
  ): string => {
    try {
      const directions = [
        ["N", "North"],
        ["NNE", "North-Northeast"],
        ["NE", "Northeast"],
        ["ENE", "East-Northeast"],
        ["E", "East"],
        ["ESE", "East-Southeast"],
        ["SE", "Southeast"],
        ["SSE", "South-Southeast"],
        ["S", "South"],
        ["SSW", "South-Southwest"],
        ["SW", "Southwest"],
        ["WSW", "West-Southwest"],
        ["W", "West"],
        ["WNW", "West-Northwest"],
        ["NW", "Northwest"],
        ["NNW", "North-Northwest"],
      ];

      const normalizedDirection = ((direction % 360) + 360) % 360;
      const index =
        Math.round(
          normalizedDirection / (360 / (16 / Math.pow(2, 3 - depth)))
        ) %
        (16 / Math.pow(2, 3 - depth));

      let result: string;
      if (depth === 1) {
        result = directions[index * 4][abbr ? 0 : 1];
      } else if (depth === 2) {
        result = directions[index * 2][abbr ? 0 : 1];
      } else {
        result = directions[index][abbr ? 0 : 1];
      }

      return result;
    } catch (err) {
      const error = err as Error;
      console.error("Cardinal direction error:", error.message);
      return "";
    }
  };

  const renderWindData = () => (
    <>
      <Compass
        direction={wind_direction}
        width={200}
        height={200}
        theme={theme}
      />
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex flex-col items-center">
          <Label className={`${themeClasses.label}`}>Direction</Label>
          <div
            className={`text-4xl flex flex-row items-baseline ${themeClasses.text}`}
          >
            <span>{wind_direction}&deg;</span>
            &nbsp;&middot;&nbsp;
            <span
              aria-label={getAriaLabelDirection(
                getCardinalDirection(wind_direction, 3, true)
              )}
            >
              {getCardinalDirection(wind_direction, 3, true)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center space-x-6 mt-8">
        {[
          { label: "Gust", value: wind_gust },
          { label: "Average", value: wind_avg },
          { label: "Lull", value: wind_lull },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <Label className={`${themeClasses.label}`}>{item.label}</Label>
            <span
              className={`text-${
                item.label === "Average" ? "5xl" : "4xl"
              } font-bold ${themeClasses.text}`}
            >
              {convert(item.value, "m/s", units.speed).toFixed(
                item.label === "Average" ? 2 : 1
              )}
            </span>
            <span
              aria-label={getAriaLabelUnit(units.speed)}
              className={`${themeClasses.text} text-lg`}
            >
              {units.speed}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  const renderSkeleton = () => (
    <div className="space-y-4 mt-4">
      <Skeleton
        className={`h-48 w-48 rounded-full mx-auto ${themeClasses.skeleton}`}
      />
      <div className="flex justify-center space-x-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className={`h-12 w-28 ${themeClasses.skeleton}`} />
        ))}
      </div>
      <div className="flex justify-between">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            className={`h-20 w-24 mt-8 ${themeClasses.skeleton}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Card className={`w-[350px] h-[450px] ${themeClasses.card}`}>
      <CardContent className="p-4">
        {lastUpdated ? renderWindData() : renderSkeleton()}
      </CardContent>
    </Card>
  );
};

export default React.memo(DefaultTempestWindStats);

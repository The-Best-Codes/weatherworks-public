"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ThemeClasses, themes } from "@/utils/modules/defaultModuleThemes";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { convert } from "@/utils/modules/unitConversions";
import RainGauge from "./util/RainGaugeGraphic";
import RainEffect from "./util/RainCanvasGraphic";
import { getAriaLabelUnit } from "@/utils/accessibility/unitAriaLabels";
import useLatestObs from "@/utils/swd_mirror/useLatestObs";

interface RainStatsModuleProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    length: "mm" | "in" | "cm" | "m" | "km" | "mi" | "ft" | "yd";
  };
  refreshInterval: number;
  rainGaugeGraphic?: boolean;
  rainCanvasEffect?: boolean;
}

const DefaultRainStats: React.FC<RainStatsModuleProps> = ({
  theme,
  refreshInterval,
  units,
  rainGaugeGraphic = true,
  rainCanvasEffect = true,
}) => {
  const {
    lastUpdated,
    precip_accum_local_day_final,
    precip_accum_local_yesterday_final,
    precip_accum_last_1hr,
    precip_minutes_local_day,
    precip_minutes_local_yesterday_final,
    precip,
  } = useLatestObs(refreshInterval);

  const [gaugeValue, setGaugeValue] = useState<number>(0);

  const getGaugeMetadata = useMemo(
    () =>
      (units: string, scale: number = 1) => {
        const unitsMap = {
          in: { text: "in", scale: scale },
          mm: { text: "mm", scale: scale * 25.4 },
          cm: { text: "cm", scale: scale * 2.54 },
          m: { text: "m", scale: scale * 0.0254 },
          km: { text: "km", scale: scale * 0.0000254 },
          mi: { text: "mi", scale: scale * 0.000015782 },
          ft: { text: "ft", scale: scale * 0.08333 },
          yd: { text: "yd", scale: scale * 0.0277778 },
        };
        return unitsMap[units as keyof typeof unitsMap];
      },
    []
  );

  const getGaugePercentage = useMemo(
    () => (rainfall: number) => {
      try {
        const convertedRainfall = convert(rainfall, "mm", "in");
        const minRange = 0;
        const maxRange = 5;
        return ((convertedRainfall - minRange) / (maxRange - minRange)) * 100;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return 0;
      }
    },
    []
  );

  useEffect(() => {
    setGaugeValue(getGaugePercentage(precip_accum_local_day_final));
  }, [precip_accum_local_day_final, getGaugePercentage]);

  const themeClasses: ThemeClasses = themes[theme];

  const RainItem: React.FC<{
    label: string;
    value: number;
    unit: string;
    toFixedN?: number;
  }> = ({ label, value, unit, toFixedN }) => {
    const ariaLabelUnit =
      unit === "min"
        ? "minutes"
        : unit.includes("/h")
        ? `${getAriaLabelUnit(unit.split("/")[0])} per hour`
        : getAriaLabelUnit(unit);

    return (
      <div className="flex flex-col mb-2">
        <Label className={`text-sm ${themeClasses.label}`}>{label}</Label>
        <div className="flex items-baseline">
          <span className={`text-5xl font-bold mr-1 ${themeClasses.text}`}>
            {toFixedN !== undefined ? value.toFixed(toFixedN) : value}
          </span>
          <span
            aria-label={ariaLabelUnit}
            className={`text-lg ${themeClasses.text}`}
          >
            {unit}
          </span>
        </div>
      </div>
    );
  };

  if (!lastUpdated) {
    return (
      <Card className={`w-[350px] h-[450px] relative ${themeClasses.card}`}>
        <CardContent className="p-4 h-full relative z-10">
          <div className="flex flex-row justify-between w-full h-full items-center">
            <div className="flex flex-1 flex-col h-full">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col mb-2">
                  <Skeleton
                    className={`${themeClasses.skeleton} w-24 h-6 mb-1`}
                  />
                  <div className="flex items-baseline">
                    <Skeleton
                      className={`${themeClasses.skeleton} w-32 h-12 mr-1`}
                    />
                    <Skeleton className={`${themeClasses.skeleton} w-16 h-8`} />
                  </div>
                </div>
              ))}
            </div>
            {rainGaugeGraphic && (
              <Skeleton className={`${themeClasses.skeleton} w-20 h-[400px]`} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-[350px] h-[450px] relative ${themeClasses.card}`}>
      <CardContent className="p-4 h-full relative z-10">
        <div className="flex flex-row justify-between w-full h-full items-center">
          <div className="flex flex-1 flex-col h-full">
            <RainItem
              label="Rainfall Today"
              value={convert(precip_accum_local_day_final, "mm", units.length)}
              unit={units.length}
              toFixedN={2}
            />
            <RainItem
              label="Rainfall Rate"
              value={convert(precip_accum_last_1hr, "mm", units.length)}
              unit={`${units.length}/h`}
              toFixedN={2}
            />
            <RainItem
              label="Rainfall Yesterday"
              value={convert(
                precip_accum_local_yesterday_final,
                "mm",
                units.length
              )}
              unit={units.length}
              toFixedN={2}
            />
            <RainItem
              label="Duration Today"
              value={precip_minutes_local_day}
              unit="min"
              toFixedN={0}
            />
            <RainItem
              label="Duration Yesterday"
              value={precip_minutes_local_yesterday_final}
              unit="min"
              toFixedN={0}
            />
          </div>
          {rainGaugeGraphic && (
            <RainGauge
              width={80}
              height={400}
              fillLevel={gaugeValue}
              waterColor={theme.includes("Light") ? "#00bfff" : "#007bff"}
              backgroundColor={theme.includes("Light") ? "#eee" : "#333"}
              tickColor={themeClasses.textHex}
              textColor={themeClasses.textHex}
              textRatio={getGaugeMetadata(units.length).scale}
              unitText={getGaugeMetadata(units.length).text}
            />
          )}
        </div>
      </CardContent>
      {rainCanvasEffect && (
        <RainEffect
          className="absolute top-0 left-0 rounded-lg"
          width={300}
          height={300}
          dropCount={precip > 0 ? precip_accum_last_1hr * 10 : 0}
          speed={Math.min(10, precip_accum_last_1hr * 2)}
        />
      )}
    </Card>
  );
};

export default React.memo(DefaultRainStats);

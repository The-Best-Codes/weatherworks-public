"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { Skeleton } from "@/components/ui/skeleton";
import SunUVGraphic from "./util/SunUVGraphic";
import useLatestObs from "@/utils/swd_mirror/useLatestObs";

interface SunStatsProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
}

const SunStats = ({
  theme = "defaultLight",
  refreshInterval = 60000,
}: SunStatsProps) => {
  const { uv, brightness, solar_radiation, lastUpdated } =
    useLatestObs(refreshInterval);

  const themeClass: ThemeClasses = themes[theme];

  if (!lastUpdated) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClass.card}`}>
        <CardContent className="flex flex-col w-full p-4 items-center">
          <Skeleton
            className={`w-7/12 h-[168px] rounded-full mb-4 ${themeClass.skeleton}`}
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

  return (
    <Card className={`w-[350px] h-[450px] ${themeClass.card}`}>
      <CardContent className="flex flex-col w-full p-4 items-center">
        <div className="w-7/12">
          <SunUVGraphic value={typeof uv === "number" ? uv / 12 : 0} />
        </div>
        <Label className={`text-sm ${themeClass.label} mt-4`}>UV Index</Label>
        <span className={`text-5xl font-bold ${themeClass.text} mb-2`}>
          {uv}
        </span>
        <Label className={`text-sm ${themeClass.label}`}>Brightness</Label>
        <span className={`text-4xl font-bold ${themeClass.text} mb-2`}>
          {brightness}
        </span>
        <Label className={`text-sm ${themeClass.label}`}>Solar Radiation</Label>
        <span className={`text-4xl font-bold ${themeClass.text} mb-2`}>
          {solar_radiation}
        </span>
      </CardContent>
    </Card>
  );
};

export default React.memo(SunStats);

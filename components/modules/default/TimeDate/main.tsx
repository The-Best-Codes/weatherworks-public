"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import useLatestObs from "@/utils/swd_mirror/useLatestObs";
import { convert } from "@/utils/modules/unitConversions";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeDateModuleProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  units: {
    temperature: "C" | "F" | "K";
  };
  refreshInterval: number;
  transparency?: boolean;
  leadingZero?: boolean;
  use24Hour?: boolean;
}

const DefaultTimeDate: React.FC<TimeDateModuleProps> = ({
  theme,
  units = {
    temperature: "F",
  },
  refreshInterval = 60000,
  transparency = true,
  leadingZero = false,
  use24Hour = false,
}) => {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const { air_temperature, lastUpdated } = useLatestObs(refreshInterval);

  useEffect(() => {
    const updateTimeAndDate = () => {
      try {
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], {
          hour: leadingZero ? "2-digit" : "numeric",
          minute: "2-digit",
          hour12: !use24Hour,
        });
        const currentDate = now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        setTime(currentTime);
        setDate(currentDate);
      } catch (error) {
        console.error("Error in updateTimeAndDate function:", error);
      }
    };

    updateTimeAndDate(); // Initial call to set time and date immediately
    const intervalId = setInterval(updateTimeAndDate, 1000);

    return () => clearInterval(intervalId);
  }, [leadingZero, use24Hour]);

  const themeClasses: ThemeClasses = themes[theme];

  if (!lastUpdated) {
    return (
      <Card
        className={`w-[716px] h-[450px] border-none ${themeClasses.card} ${
          transparency
            ? theme.includes("Dark")
              ? "bg-opacity-20"
              : "bg-opacity-30"
            : ""
        } flex flex-col justify-center items-center`}
      >
        <Skeleton className={`w-96 h-24 mb-2 ${themeClasses.skeleton}`} />
        <Skeleton className={`w-3/4 h-20 mb-2 ${themeClasses.skeleton}`} />
        <Skeleton className={`w-2/3 h-28 mb-2 ${themeClasses.skeleton}`} />
        <Skeleton className={`w-96 h-20 ${themeClasses.skeleton}`} />
      </Card>
    );
  }

  return (
    <Card
      className={`w-[716px] h-[450px] border-none ${themeClasses.card} ${
        transparency
          ? theme.includes("Dark")
            ? "bg-opacity-20"
            : "bg-opacity-30"
          : ""
      } flex flex-col justify-center items-center`}
    >
      <CardContent className="text-center p-4">
        <p className={`${themeClasses.text} text-8xl mb-4`}>
          {date.split(",")[0]}
        </p>
        <p className={`${themeClasses.text} text-6xl mb-4`}>
          {date.split(",").slice(1).join(",")}
        </p>
        <p className={`${themeClasses.text} text-9xl mb-4`}>{time}</p>
        <p className={`${themeClasses.text} text-8xl`}>
          {convert(air_temperature || 0, "C", units.temperature).toFixed(1)}{" "}
          &deg;
          {units.temperature}
        </p>
      </CardContent>
    </Card>
  );
};

export default React.memo(DefaultTimeDate);

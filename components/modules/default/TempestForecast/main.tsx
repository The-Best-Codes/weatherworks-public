"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { convert } from "@/utils/modules/unitConversions";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Wind,
  Calendar,
  Droplet,
  Droplets,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  AlertCircle,
} from "lucide-react";

interface ForecastWeatherProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
  units: {
    temperature: "C" | "F" | "K";
    speed: "m/s" | "km/h" | "mph" | "knots";
    pressure: "hPa" | "inHg" | "mmHg" | "mbar";
    length: "mm" | "in" | "cm";
  };
  bottomBorder?: boolean;
}

const ForecastWeather = ({
  theme = "defaultLight",
  refreshInterval = 60000,
  units = {
    temperature: "C",
    speed: "m/s",
    pressure: "hPa",
    length: "mm",
  },
  bottomBorder = false,
}: ForecastWeatherProps) => {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<Record<
    string,
    string
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const epochToWeekday = (epoch: number, short?: boolean) => {
    try {
      const date = new Date(epoch * 1000);
      let daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (short) {
        daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      }
      return daysOfWeek[date.getDay()];
    } catch (error) {
      console.error("Error converting epoch to weekday:", error);
      return "Error";
    }
  };

  const epochToTime = (epoch: number) => {
    try {
      // Return the time in the 12-hour format with AM/PM
      const date = new Date(epoch * 1000);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      //const seconds = date.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      return `${hours % 12 || 12}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
    } catch (error) {
      console.error("Error converting epoch to time:", error);
      return "Error";
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/swd_mirror/forecast");
        const data = await response.json();
        setForecastData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Error fetching forecast data");
        setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const themeClass: ThemeClasses = themes[theme];

  if (error) {
    return (
      <Card
        className={`${themeClass.card} w-[350px] h-[450px] p-8 flex flex-col justify-center items-center`}
      >
        <AlertCircle className="w-24 h-24 text-red-500 mb-4" />
        <p className="text-red-500 text-center">{error}</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`${themeClass.card} w-[350px] h-[450px] p-8`}>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-row items-center gap-2">
              <Skeleton
                className={`${themeClass.skeleton} w-10 h-10 rounded-full`}
              />
              <Skeleton className={`${themeClass.skeleton} flex-1 h-20`} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function DayForecast({
    day,
    units,
    themeClass,
  }: {
    day: {
      day_start_local: number;
      month_num: number;
      icon: string;
      conditions: string;
      air_temp_high: number;
      air_temp_low: number;
      precip_probability: number;
      precip_type: string;
    };
    units: {
      temperature: "C" | "F" | "K";
      speed: "m/s" | "km/h" | "mph" | "knots";
      pressure: "hPa" | "inHg" | "mmHg" | "mbar";
      length: "mm" | "in" | "cm";
    };
    themeClass: ThemeClasses;
  }) {
    return (
      <div className="flex flex-row items-center gap-4 h-full">
        <Image
          src={`/image/forecast/${day.icon}.svg`}
          alt={day.icon}
          width={50}
          height={50}
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center text-base">
            <span className={`${themeClass.text}`}>{day.conditions}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col justify-center">
              <Label
                className={`flex flex-row items-center gap-2 text-base ${themeClass.label}`}
              >
                <ThermometerSun className="w-6 h-6" />
                <span>
                  {convert(day.air_temp_high, "C", units.temperature)}
                  <sup>&deg;</sup>
                  {units.temperature}
                </span>
              </Label>
              <Label
                className={`flex flex-row items-center gap-2 text-base ${themeClass.label}`}
              >
                <ThermometerSnowflake className="w-6 h-6" />
                <span>
                  {convert(day.air_temp_low, "C", units.temperature)}
                  <sup>&deg;</sup>
                  {units.temperature}
                </span>
              </Label>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col justify-center">
                <Label
                  className={`flex flex-row items-center gap-2 text-base ${themeClass.label}`}
                >
                  <Droplet className="w-6 h-6" />
                  <span>
                    {day.precip_probability}% {day.precip_type}
                  </span>
                </Label>
                <Label
                  className={`flex flex-row items-center gap-2 text-sm ${themeClass.label}`}
                >
                  <Calendar className="w-6 h-6" />
                  <span>{epochToWeekday(day.day_start_local)}</span>
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function HourlyForecast({
    hourlyData,
    units,
    themeClass,
  }: {
    hourlyData: {
      time: number;
      icon: string;
      conditions: string;
      air_temperature: number;
      precip_probability: number;
      precip_type: string;
      wind_avg: number;
      relative_humidity: number;
    }[];
    units: {
      temperature: "C" | "F" | "K";
      speed: "m/s" | "km/h" | "mph" | "knots";
      pressure: "hPa" | "inHg" | "mmHg" | "mbar";
      length: "mm" | "in" | "cm";
    };
    themeClass: ThemeClasses;
  }) {
    return (
      <div className="flex flex-col gap-2">
        {hourlyData.length > 0 &&
          hourlyData.map(
            (
              hour: {
                time: number;
                icon: string;
                conditions: string;
                wind_avg: number;
                air_temperature: number;
                precip_probability: number;
                precip_type: string;
                relative_humidity: number;
              },
              index: number
            ) => (
              <Card
                key={index}
                className={`p-2 w-full bg-gray-500 bg-opacity-10 rounded-lg border border-border/50`}
              >
                <CardContent className="flex flex-col gap-2 p-2">
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <Image
                        src={`/image/forecast/${hour.icon}.svg`}
                        alt={hour.icon}
                        width={30}
                        height={30}
                        unoptimized
                      />
                      <span className={`${themeClass.text}`}>
                        {epochToTime(hour.time)}
                      </span>
                    </div>
                    <span className={`text-sm text-center ${themeClass.text}`}>
                      {hour.conditions}
                    </span>
                  </div>
                  <div className="flex flex-row gap-2 justify-between items-center w-full">
                    <Label
                      className={`flex flex-row items-center text-xs ${themeClass.label}`}
                    >
                      <Thermometer className="w-4 h-4" />
                      <span>
                        {convert(hour.air_temperature, "C", units.temperature)}
                        <sup>&deg;</sup>
                        {units.temperature}
                      </span>
                    </Label>
                    <Label
                      className={`flex flex-row items-center text-xs ${themeClass.label}`}
                    >
                      <Droplet className="w-4 h-4" />
                      <span>
                        {hour.precip_probability}% {hour.precip_type}
                      </span>
                    </Label>
                    <Label
                      className={`flex flex-row items-center text-xs ${themeClass.label}`}
                    >
                      <Wind className="w-4 h-4" />
                      <span>
                        {convert(hour.wind_avg, "m/s", units.speed).toFixed(0)}
                        {units.speed}
                      </span>
                    </Label>
                    <Label
                      className={`flex flex-row items-center text-xs ${themeClass.label}`}
                    >
                      <Droplets className="w-4 h-4" />
                      <span>{hour.relative_humidity}%</span>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )
          )}
      </div>
    );
  }

  if (forecastData && forecastData.forecast) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClass.card}`}>
        <CardContent className="w-full p-4 overflow-hidden pr-6 hover:overflow-auto hover:pr-4 h-full">
          <Accordion type="single" collapsible className="w-full">
            {/*  eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(forecastData.forecast as any).daily.map(
              (day: Record<string, string>, index: number) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className={`${
                    bottomBorder && theme.includes("Dark")
                      ? "border-b border-gray-700"
                      : "border-b border-gray-200"
                  } ${!bottomBorder && "border-none"}`}
                >
                  <AccordionTrigger
                    className={`no-underline hover:no-underline ${themeClass.text}`}
                  >
                    <DayForecast
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      day={day as any}
                      units={units}
                      themeClass={themeClass}
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <HourlyForecast
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      hourlyData={(forecastData.forecast as any).hourly.filter(
                        (hour: { day_start_local: number; time: number }) =>
                          new Date(hour.time * 1000).getDate() ===
                          new Date(
                            (day.day_start_local as unknown as number) * 1000
                          ).getDate()
                      )}
                      units={units}
                      themeClass={themeClass}
                    />
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </CardContent>
      </Card>
    );
  }
};

export default React.memo(ForecastWeather);

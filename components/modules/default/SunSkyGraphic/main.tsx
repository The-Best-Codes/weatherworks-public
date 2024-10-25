"use client";
import React, { useEffect, useState } from "react";
import SunCalc from "suncalc";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import ApiConfig from "@/config/ww_apiData.json";
import SunPositionGraphic from "./util/RenderSunRealtime";
import { Eye, AlertCircle } from "lucide-react";
import { usePerfScore } from "@/utils/performance/usePerfScore";
import { Button } from "@/components/ui/button";

interface SunSkyGraphicProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
}

const DefaultSunSkyGraphic: React.FC<SunSkyGraphicProps> = ({
  theme,
  refreshInterval,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Error state
  const [sunriseTime, setSunriseTime] = useState<string>("");
  const [sunsetTime, setSunsetTime] = useState<string>("");
  const [dawnTime, setDawnTime] = useState<string>("");
  const [duskTime, setDuskTime] = useState<string>("");
  const [firstLightTime, setFirstLightTime] = useState<string>("");
  const [lastLightTime, setLastLightTime] = useState<string>("");
  const [dayLength, setDayLength] = useState<string>("");
  const [solarNoon, setSolarNoon] = useState<string>("");
  const [treatAsHighPerf, setTreatAsHighPerf] = useState(false);
  const { score: perfScore, loading: perfLoading } = usePerfScore();

  const themeClasses: ThemeClasses = themes[theme];

  const formatTime = (
    time: Date,
    separator: string = ":",
    showMeridian: boolean = true,
    meridianSeparator: string = " ",
    {
      showHours = true,
      showMinutes = true,
      showSeconds = false,
    }: {
      showHours?: boolean;
      showMinutes?: boolean;
      showSeconds?: boolean;
    } = {}
  ) => {
    try {
      let hours;
      if (showMeridian) {
        hours = time.getHours() % 12 || 12;
      } else {
        hours = time.getHours();
      }

      hours = hours.toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const seconds = time.getSeconds().toString().padStart(2, "0");
      const meridian = showMeridian
        ? time.getHours() >= 12
          ? "PM"
          : "AM"
        : "";

      let timeFormat = `${showHours ? hours : ""}${separator}${
        showMinutes ? minutes : ""
      }${separator}${showSeconds ? seconds : ""}`;

      if (timeFormat.endsWith(separator)) {
        timeFormat = timeFormat.slice(0, timeFormat.lastIndexOf(separator));
      }

      return `${timeFormat}${meridian ? meridianSeparator + meridian : ""}`;
    } catch (error) {
      console.error(error);
      return "Error";
    }
  };

  const getDayLength = (sunPosition: { sunrise: Date; sunset: Date }) => {
    try {
      const sunriseTime = new Date(sunPosition.sunrise);
      const sunsetTime = new Date(sunPosition.sunset);
      const dayLength = sunsetTime.getTime() - sunriseTime.getTime();
      const hours = Math.floor(dayLength / 3600000);
      const minutes = Math.floor((dayLength % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error(error);
      return "Error";
    }
  };

  useEffect(() => {
    const fetchSunData = async () => {
      setLoading(true); // Ensure loading state is properly managed
      setError(null); // Reset any previous error
      try {
        const sunPosition = SunCalc.getTimes(
          new Date(),
          ApiConfig.metaData.latitude as unknown as number,
          ApiConfig.metaData.longitude as unknown as number
        );
        setSunriseTime(formatTime(sunPosition.sunrise));
        setSunsetTime(formatTime(sunPosition.sunset));
        setDawnTime(formatTime(sunPosition.dawn));
        setDuskTime(formatTime(sunPosition.dusk));
        setFirstLightTime(formatTime(sunPosition.nauticalDawn));
        setLastLightTime(formatTime(sunPosition.nauticalDusk));
        setDayLength(getDayLength(sunPosition));
        setSolarNoon(formatTime(sunPosition.solarNoon));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sun data:", error);
        setError("Unable to load sun data. Please try again later.");
        setLoading(false);
      }
    };

    fetchSunData();
    const interval = setInterval(fetchSunData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <Card className={`w-[350px] h-[450px] ${themeClasses.card}`}>
      <CardContent className={"p-0"}>
        {loading ? (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <Skeleton
              className={`w-[350px] h-[200px] mb-4 ${themeClasses.skeleton}`}
            />
            <div className="flex flex-row w-full justify-between px-4 gap-2">
              <div className="flex flex-col gap-4">
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className={`w-24 h-8 ${themeClasses.skeleton}`}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className={`w-24 h-8 ${themeClasses.skeleton}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          // Error UI
          <div className="flex flex-col items-center justify-center w-full h-full text-center text-red-500">
            <AlertCircle className="w-24 h-24 mt-4 mb-4" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {(perfLoading === false && perfScore > 75) ||
            treatAsHighPerf === true ? (
              <SunPositionGraphic
                width={350}
                height={200}
                sunRadius={20}
                latitude={ApiConfig.metaData.latitude as unknown as number}
                longitude={ApiConfig.metaData.longitude as unknown as number}
              />
            ) : (
              <div className="w-[350px] h-[200px] bg-gray-500/20 flex flex-col items-center justify-center text-center">
                <span className={`${themeClasses.text}`}>
                  Performance Manager has hidden this graphic because your
                  device&apos;s performance score is too low.
                </span>
                <Button
                  size="icon"
                  variant={"destructive"}
                  onClick={() => setTreatAsHighPerf(true)}
                  className="mt-4 w-fit h-8 p-2"
                  aria-label="Show graphic"
                >
                  <Eye className="w-4 h-4 mr-2" /> Show
                </Button>
              </div>
            )}
            <Table className="w-full mt-8">
              <TableBody>
                <TableRow className="border-none">
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>Sunrise</Label>
                      <span className={themeClasses.text}>{sunriseTime}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>Sunset</Label>
                      <span className={themeClasses.text}>{sunsetTime}</span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>
                        First Light
                      </Label>
                      <span className={themeClasses.text}>
                        {firstLightTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>
                        Last Light
                      </Label>
                      <span className={themeClasses.text}>{lastLightTime}</span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>Dawn</Label>
                      <span className={themeClasses.text}>{dawnTime}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>Dusk</Label>
                      <span className={themeClasses.text}>{duskTime}</span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>
                        Day Length
                      </Label>
                      <span className={themeClasses.text}>{dayLength}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <Label className={`${themeClasses.label}`}>
                        Solar Noon
                      </Label>
                      <span className={themeClasses.text}>{solarNoon}</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DefaultSunSkyGraphic;

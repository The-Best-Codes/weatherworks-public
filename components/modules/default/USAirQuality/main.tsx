"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import GaugeChart from "react-gauge-chart";
import { ThemeClasses, themes } from "@/utils/modules/defaultModuleThemes";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface AirQualityProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
}

interface AQIBarData {
  pm10: number | string | null;
  pm25: number | string | null;
  co: number | string | null;
  no2: number | string | null;
  o3: number | string | null;
  so2: number | string | null;
  original_pm10: number | string | null;
  original_pm25: number | string | null;
  original_co: number | string | null;
  original_no2: number | string | null;
  original_o3: number | string | null;
  original_so2: number | string | null;
  primaryPollutant: string | null;
  realAqi: number | null;
  aqi: number | null;
  gov: {
    PM10: number | null;
    PM2_5: number | null;
    OZONE: number | null;
  };
}

const DefaultUSAirQuality: React.FC<AirQualityProps> = ({
  theme,
  refreshInterval = 3600000,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [dataAq, setDataAq] = useState<AQIBarData | null>(null);
  const [gaugePercentage, setGaugePercentage] = useState<number>(0);
  const [primaryPollutant, setPrimaryPollutant] = useState<Record<
    string,
    string
  > | null>(null);
  const [realAqi, setRealAqi] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const getAQIKeys = () => {
    return {
      pm25: { min: 0, max: 500.4 },
      pm10: { min: 0, max: 604 },
      co: { min: 0, max: 50400 },
      no2: { min: 0, max: 2049 },
      o3: { min: 0, max: 604 },
      so2: { min: 0, max: 1004 },
    };
  };

  const fetchProgressData = useCallback(async () => {
    try {
      const response = await fetch("/api/aqi/openmeteo");
      const data = await response.json();

      const qDataHr = data.hourly;
      const aqiDataBar = {} as AQIBarData;

      const aqiValuePerc = (
        aqi: number,
        pollutant: "pm25" | "pm10" | "co" | "no2" | "o3" | "so2"
      ) => {
        const keys = getAQIKeys();

        if (aqi > keys[pollutant].max) {
          return 100;
        } else if (aqi < keys[pollutant].min) {
          return 0;
        } else {
          return (
            ((aqi - keys[pollutant].min) /
              (keys[pollutant].max - keys[pollutant].min)) *
            100
          ).toFixed(2);
        }
      };

      aqiDataBar.pm10 = aqiValuePerc(qDataHr.pm10[0], "pm10");
      aqiDataBar.pm25 = aqiValuePerc(qDataHr.pm2_5[0], "pm25");
      aqiDataBar.co = aqiValuePerc(qDataHr.carbon_monoxide[0], "co");
      aqiDataBar.no2 = aqiValuePerc(qDataHr.nitrogen_dioxide[0], "no2");
      aqiDataBar.o3 = aqiValuePerc(qDataHr.ozone[0], "o3");
      aqiDataBar.so2 = aqiValuePerc(qDataHr.sulphur_dioxide[0], "so2");
      aqiDataBar.original_pm10 = qDataHr.pm10[0];
      aqiDataBar.original_pm25 = qDataHr.pm2_5[0];
      aqiDataBar.original_co = qDataHr.carbon_monoxide[0];
      aqiDataBar.original_no2 = qDataHr.nitrogen_dioxide[0];
      aqiDataBar.original_o3 = qDataHr.ozone[0];
      aqiDataBar.original_so2 = qDataHr.sulphur_dioxide[0];
      aqiDataBar.gov = {} as AQIBarData["gov"];
      aqiDataBar.gov.PM10 = qDataHr.pm10[0];
      aqiDataBar.gov.PM2_5 = qDataHr.pm2_5[0];
      aqiDataBar.gov.OZONE = qDataHr.ozone[0];

      setDataAq(aqiDataBar);
      setIsProgressLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setIsProgressLoading(false);
      setError(`Error fetching air quality data: ${error || "Unknown error"}`);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch("/api/aqi/gov");
      const data = await response.json();
      setLoading(false);
      let airQualities = data.filter(
        (airQuality: { dataType: string }) => airQuality.dataType == "O"
      );

      if (airQualities.length === 0) {
        airQualities = data.filter(
          (airQuality: { isPrimary: boolean }) => airQuality.isPrimary
        );
      }

      const highest = Math.max(
        ...airQualities.map((aq: { aqi: number }) => aq.aqi)
      );
      const primaryPollutant = airQualities.find(
        (aq: { aqi: number }) => aq.aqi === highest
      );

      const getDegrees = function (aqi: number) {
        if (aqi <= 200) {
          return (aqi / 200) * (360 * (4 / 6));
        } else if (aqi <= 300) {
          return 360 * (4 / 6) + ((aqi - 200) / (300 - 200)) * (360 * (1 / 6));
        } else if (aqi <= 500) {
          return 360 * (5 / 6) + ((aqi - 300) / (500 - 300)) * (360 * (1 / 6));
        } else {
          return 360;
        }
      };

      const percentageCalc = getDegrees(highest);

      setGaugePercentage(percentageCalc / 360);
      setRealAqi(highest);
      setPrimaryPollutant(primaryPollutant);
      fetchProgressData();
    } catch (error) {
      setLoading(false);
      setError(`Error fetching air quality data: ${error || "Unknown error"}`);
      console.error(`Error fetching air quality data: ${error}`);
    } finally {
      setIsFetching(false);
    }
  }, [fetchProgressData]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval]);

  const themeClasses: ThemeClasses = themes[theme];

  const fixCase = (str: string) => {
    try {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } catch (error) {
      console.error("Error fixing case:", error);
      return str;
    }
  };

  if (error !== null) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClasses.card} p-8`}>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-24 h-24 text-red-500" />
          <p className={`text-xl text-center ${themeClasses.text}`}>
            An error occurred
          </p>
          <p className={`text-base text-center ${themeClasses.text}`}>
            {error !== null && (error as unknown as boolean) !== true
              ? error
              : "We don't have any information about the error"}
          </p>
          <Button onClick={fetchData} disabled={isFetching} className={"mt-4"}>
            {isFetching ? "Trying..." : "Try Again"}
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`w-[350px] h-[450px] ${themeClasses.card} p-8`}>
        <div className="flex flex-col items-center justify-center gap-6 max-h-full overflow-auto">
          <Skeleton
            className={`${themeClasses.skeleton} rounded-full w-64 h-64`}
          />
          <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className={`${themeClasses.skeleton} w-full h-6`}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`w-[350px] h-[450px] overflow-auto ${themeClasses.card}`}>
      <CardContent className="w-full h-full flex flex-col">
        <div className="flex flex-col items-center pt-8">
          <div aria-label="Air quality index gauge">
            <GaugeChart
              id="gauge-chart"
              nrOfLevels={6}
              percent={gaugePercentage || 0}
              colors={[
                "#00E400",
                "#FFFF00",
                "#FF7E00",
                "#FF0000",
                "#8F3F97",
                "#7E0023",
              ]}
              formatTextValue={() => `${realAqi || 0}`}
              textColor={themeClasses.textHex}
              animate={false}
              arcPadding={0}
              cornerRadius={0}
              needleColor={themeClasses.textHex}
              needleBaseColor={themeClasses.textHex}
            />
          </div>
          <p className={`text-xl text-center ${themeClasses.text}`}>
            {primaryPollutant?.category || "N/A"}
          </p>
          <Label className={`text-base ${themeClasses.label}`}>
            {fixCase(primaryPollutant?.parameter || "N/A")} &middot;{" "}
            {dataAq?.gov[
              ((primaryPollutant?.parameter as string) == "PM2.5"
                ? "PM2_5"
                : primaryPollutant?.parameter) as keyof AQIBarData["gov"]
            ] || "N/A "}
            <span aria-label="parts per million">ppm</span>
          </Label>
        </div>
        <div
          className="flex flex-col items-center mt-2"
          style={{ gap: "0.125rem" }}
        >
          {isProgressLoading ? (
            <Skeleton className={`w-full h-48 ${themeClasses.skeleton}`} />
          ) : (
            <>
              <div className="flex flex-col w-full items-center">
                <div className="flex flex-row w-full justify-between">
                  <Label className={`text-xs ${themeClasses.label}`}>
                    PM 10 ({dataAq?.original_pm10 || 0})
                  </Label>
                  <Label className={`text-xs ${themeClasses.label}`}>
                    {getAQIKeys().pm10.max}
                  </Label>
                </div>
                <Progress
                  aria-label="Particulate Matter 10 (PM10) Level"
                  className={`${themeClasses.tabsList}`}
                  value={(dataAq?.pm10 as number) || 0}
                />
              </div>
              <div className="flex flex-col w-full items-center">
                <div className="flex flex-row w-full justify-between">
                  <Label className={`text-xs ${themeClasses.label}`}>
                    PM 2.5 ({dataAq?.original_pm25 || 0})
                  </Label>
                  <Label className={`text-xs ${themeClasses.label}`}>
                    {getAQIKeys().pm25.max}
                  </Label>
                </div>
                <Progress
                  aria-label="Particulate Matter 2.5 (PM2.5) Level"
                  className={`${themeClasses.tabsList}`}
                  value={(dataAq?.pm25 as number) || 0}
                />
              </div>
              <div className="flex flex-col w-full items-center">
                <div className="flex flex-row w-full justify-between">
                  <Label className={`text-xs ${themeClasses.label}`}>
                    CO ({dataAq?.original_co || 0})
                  </Label>
                  <Label className={`text-xs ${themeClasses.label}`}>
                    {getAQIKeys().co.max}
                  </Label>
                </div>
                <Progress
                  aria-label="Carbon Monoxide (CO) Level"
                  className={`${themeClasses.tabsList}`}
                  value={(dataAq?.co as number) || 0}
                />
              </div>
              <div className="flex flex-col w-full items-center">
                <div className="flex flex-row w-full justify-between">
                  <Label className={`text-xs ${themeClasses.label}`}>
                    NO2 ({dataAq?.original_no2 || 0})
                  </Label>
                  <Label className={`text-xs ${themeClasses.label}`}>
                    {getAQIKeys().no2.max}
                  </Label>
                </div>
                <Progress
                  aria-label="Nitrogen Dioxide (NO2) Level"
                  className={`${themeClasses.tabsList}`}
                  value={(dataAq?.no2 as number) || 0}
                />
              </div>
              <div className="flex flex-col w-full items-center">
                <div className="flex flex-row w-full justify-between">
                  <Label className={`text-xs ${themeClasses.label}`}>
                    SO2 ({dataAq?.original_so2 || 0})
                  </Label>
                  <Label className={`text-xs ${themeClasses.label}`}>
                    {getAQIKeys().so2.max}
                  </Label>
                </div>
                <Progress
                  aria-label="Sulphur Dioxide (SO2) Level"
                  className={`${themeClasses.tabsList}`}
                  value={(dataAq?.so2 as number) || 0}
                />
              </div>
              <div className="flex flex-col w-full items-center">
                <div className="flex flex-row w-full justify-between">
                  <Label className={`text-xs ${themeClasses.label}`}>
                    Ozone ({dataAq?.original_o3 || 0})
                  </Label>
                  <Label className={`text-xs ${themeClasses.label}`}>
                    {getAQIKeys().o3.max}
                  </Label>
                </div>
                <Progress
                  aria-label="Ozone Level"
                  className={`${themeClasses.tabsList}`}
                  value={(dataAq?.o3 as number) || 0}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(DefaultUSAirQuality);

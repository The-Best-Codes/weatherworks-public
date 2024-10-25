/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chart } from "@/components/ui/bestchart";
import { ChartArea } from "lucide-react";
import { ThemeClasses, themes } from "@/utils/modules/defaultModuleThemes";
import { convert } from "@/utils/modules/unitConversions";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useHistoryCache from "@/utils/swd_mirror/useHistoryCache";

// Define context for handling modal visibility
const ChartExplorerContext = createContext<any | null>(null);

const ChartExplorerProvider: React.FC<{
  children: React.ReactNode;
  theme: string;
  units: { [key: string]: string };
}> = ({ children, theme, units }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <ChartExplorerContext.Provider
      value={{ isOpen, openDialog, closeDialog, theme, units }}
    >
      {children}
    </ChartExplorerContext.Provider>
  );
};

const ChartExplorerButton: React.FC = () => {
  const { openDialog } = useContext(ChartExplorerContext);
  return (
    <Button size="icon" aria-label="Chart Explorer" onClick={openDialog}>
      <ChartArea />
    </Button>
  );
};

const ChartExplorerDialog: React.FC = () => {
  const parameters = [
    {
      key: "pressure",
      label: "Pressure",
      unit: "mbar",
      lines: ["pressureHigh", "pressure", "pressureLow"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "pressure",
    },
    {
      key: "temperature",
      label: "Temperature",
      unit: "C",
      lines: ["temperatureHigh", "temperature", "temperatureLow"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "temperature",
    },
    {
      key: "humidity",
      label: "Humidity",
      unit: "%",
      lines: ["humidityHigh", "humidity", "humidityLow"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "false",
    },
    {
      key: "windSpeed",
      label: "Wind Speed",
      unit: "m/s",
      lines: ["windGust", "windSpeed", "windLull"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "speed",
    },
    {
      key: "windDirection",
      label: "Wind Direction",
      unit: "°",
      lines: ["windDirection"],
      lineLabels: ["Direction"],
      colors: ["#22c55e"],
      convertUnits: "false",
    },
    {
      key: "solarRadiation",
      label: "Solar Radiation",
      unit: "W/m²",
      lines: ["solarRadiationHigh", "solarRadiation", "solarRadiationLow"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "false",
    },
    {
      key: "uv",
      label: "UV Index",
      unit: "",
      lines: ["uvHigh", "uv", "uvLow"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "false",
    },
    {
      key: "lux",
      label: "Brightness",
      unit: "lux",
      lines: ["luxHigh", "lux", "luxLow"],
      lineLabels: ["High", "Avg", "Low"],
      colors: ["high", "default", "low"],
      convertUnits: "false",
    },
    {
      key: "precipitation",
      label: "Rain Amount",
      unit: "mm",
      lines: ["precipLocalDayFinal"],
      lineLabels: ["Day"],
      colors: ["#22c55e"],
      convertUnits: "length",
    },
    {
      key: "precipType",
      label: "Rain Type",
      unit: "",
      lines: ["precipType"],
      lineLabels: ["Type"],
      colors: ["#22c55e"],
      convertUnits: "false",
    },
    {
      key: "strikeCount",
      label: "Lightning Count",
      unit: "",
      lines: ["strikeCount"],
      lineLabels: ["Strikes"],
      colors: ["#22c55e"],
      convertUnits: "false",
    },
    {
      key: "strikeDistance",
      label: "Lightning Distance",
      unit: "km",
      lines: ["strikeAverageDistance"],
      lineLabels: ["Avg Distance"],
      colors: ["#22c55e"],
      convertUnits: "distance",
    },
  ];

  const colors = {
    default: "#64748b",
    high: "#ef4444",
    low: "#3b82f6",
  };

  interface WeatherData {
    date: string;
    pressure: string;
    pressureHigh: string;
    pressureLow: string;
    temperature: string;
    temperatureHigh: string;
    temperatureLow: string;
    humidity: string;
    humidityHigh: string;
    humidityLow: string;
    windSpeed: string;
    windGust: string;
    windLull: string;
    windDirection: string;
    solarRadiation: string;
    solarRadiationHigh: string;
    solarRadiationLow: string;
    uv: string;
    uvHigh: string;
    uvLow: string;
    precipLocalDay: string;
    precipLocalDayFinal: string;
    precipType: string;
    precipAnalysisType: string;
    strikeCount: string;
    strikeAverageDistance: string;
    lux: string;
    luxHigh: string;
    luxLow: string;
  }

  const context = useContext(ChartExplorerContext);
  if (!context) {
    throw new Error(
      "ChartExplorerDialog must be used within a ChartExplorerProvider"
    );
  }
  const { isOpen, closeDialog, theme, units } = context;
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState(parameters[0]);
  const { stats_day: history_stats_day, lastUpdated: historyLastUpdated } =
    useHistoryCache(3600000);

  const themeClasses: ThemeClasses = themes[theme];

  useEffect(() => {
    const convertData = async () => {
      try {
        if (!historyLastUpdated) return;
        const formattedData = history_stats_day?.map((item: string[]) => ({
          date: item[0],
          pressure: item[1],
          pressureHigh: item[2],
          pressureLow: item[3],
          temperature: item[4],
          temperatureHigh: item[5],
          temperatureLow: item[6],
          humidity: item[7],
          humidityHigh: item[8],
          humidityLow: item[9],
          lux: item[10],
          luxHigh: item[11],
          luxLow: item[12],
          uv: item[13],
          uvHigh: item[14],
          uvLow: item[15],
          solarRadiation: item[16],
          solarRadiationHigh: item[17],
          solarRadiationLow: item[18],
          windSpeed: item[19],
          windGust: item[20],
          windLull: item[21],
          windDirection: item[22],
          windInterval: item[23],
          strikeCount: item[24],
          strikeAverageDistance: item[25] || (0 as unknown as string),
          recordCount: item[26],
          battery: item[27],
          precipLocalDay: item[28],
          precipLocalDayFinal: item[29],
          precipMinutesDay: item[30],
          precipMinutesDayFinal: item[31],
          precipType: item[32],
          precipAnalysisType: item[33],
        }));
        setData(formattedData as WeatherData[]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    convertData();
  }, [historyLastUpdated, history_stats_day]);

  const chartData = {
    data: data.map((item) => ({
      ...item,
      ...selectedParameter.lines.reduce((acc, line) => {
        if (selectedParameter.convertUnits !== "false") {
          acc[line] = convert(
            item[line as keyof WeatherData] as unknown as number,
            selectedParameter.unit,
            units[selectedParameter.convertUnits as keyof typeof units]
          );
        } else {
          acc[line] = item[line as keyof WeatherData] as unknown as number;
        }
        return acc;
      }, {} as Record<string, number>),
    })),
    dataKeys: {
      xKey: "date" as keyof WeatherData,
      lines: selectedParameter.lines.map((line, index) => ({
        key: line,
        label: selectedParameter.lineLabels[index],
        color: selectedParameter.colors[index].startsWith("#")
          ? selectedParameter.colors[index]
          : colors[selectedParameter.colors[index] as keyof typeof colors],
      })),
    },
    loading,
    config: {
      yAxisLabel: `${selectedParameter.label} (${
        selectedParameter.convertUnits !== "false"
          ? units[selectedParameter.convertUnits as keyof typeof units]
          : selectedParameter.unit
      })`,
    },
    chartWidth: 630,
    chartHeight: 400,
    theme: theme,
    tooltipFormatter: (value: number, name: string) => {
      const unit =
        selectedParameter.convertUnits !== "false"
          ? units[selectedParameter.convertUnits as keyof typeof units]
          : selectedParameter.unit;
      return `${name}: ${value} ${unit}`;
    },
    xAxisFormatter: (value: string) => new Date(value).toLocaleDateString(),
  };

  const getButtonVariant = (key: string) => {
    if (key === selectedParameter.key) {
      return theme.includes("Dark") ? "outline" : "default";
    } else {
      return theme.includes("Dark") ? "default" : "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        className={cn(
          "w-fit max-w-5xl",
          themeClasses.card,
          theme.includes("Dark") ? "children-button-text-white" : "",
          theme.includes("Dark") ? "bg-opacity-100" : "bg-opacity-100"
        )}
      >
        <DialogTitle className="sr-only">Chart Explorer</DialogTitle>
        <CardContent className="flex h-[500px] p-0">
          <div className="w-1/5 max-h-full p-2 overflow-auto rounded-lg">
            {parameters.map((param) => (
              <Button
                key={param.key}
                onClick={() => setSelectedParameter(param)}
                variant={getButtonVariant(param.key)}
                className="w-full mb-2 flex justify-start"
              >
                {param.label}
              </Button>
            ))}
          </div>
          <div className="w-4/5 pl-4">
            <div className="flex flex-row w-full items-center justify-between mb-4">
              <h2 className={cn(themeClasses.text, "text-2xl font-bold")}>
                {selectedParameter.label}
              </h2>
            </div>
            <Chart {...(chartData as any)} />
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(ChartExplorerProvider);
export { ChartExplorerButton, ChartExplorerDialog };

"use client";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Brush } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ThemeClasses, themes } from "@/utils/modules/defaultModuleThemes";

interface LineConfig<T> {
  key: keyof T;
  label?: string;
  color: string;
}

interface ChartProps<T> {
  data: T[];
  dataKeys: {
    xKey: keyof T;
    lines: LineConfig<T>[];
  };
  loading: boolean;
  travelerWidthValue?: number | string;
  threshold?: number;
  config?: ChartConfig;
  chartWidth?: number;
  chartHeight?: number;
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  tooltipFormatter?: (
    value: any,
    name: any,
    props: any
  ) => string | JSX.Element;
  xAxisFormatter?: (value: any) => string;
}

export function Chart<T>({
  data,
  dataKeys,
  loading,
  travelerWidthValue = 5,
  threshold = 30,
  config = {},
  chartWidth = 500,
  chartHeight = 300,
  theme = "defaultLight",
  tooltipFormatter,
  xAxisFormatter = (value) => value,
}: ChartProps<T>) {
  const themeClasses: ThemeClasses = themes[theme];

  const lines = useMemo(
    () =>
      dataKeys.lines.map(({ key, label, color }) => ({
        key,
        label,
        color,
      })),
    [dataKeys.lines]
  );

  if (loading) {
    return (
      <div className="flex justify-center w-full h-full">
        <Skeleton className={`w-full h-[420px] ${themeClasses.skeleton}`} />
      </div>
    );
  }

  return (
    <ChartContainer
      style={{ width: "100%", height: chartHeight - 24 }}
      config={config as ChartConfig}
    >
      <LineChart
        width={Number(chartWidth) || 500}
        height={Number(chartHeight) || 300}
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={dataKeys.xKey as string}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={["auto"]}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={tooltipFormatter} />}
        />
        {lines.map(({ key, label, color }) => (
          <Line
            key={String(key)}
            type="monotone"
            dataKey={String(key)}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
        ))}
        {data.length > threshold && (
          <Brush
            dataKey={String(dataKeys.xKey)}
            height={30}
            fill="#ddd"
            stroke="fff"
            travellerWidth={Number(travelerWidthValue) || 5}
            className="rounded-clippath-1"
            startIndex={data.length - threshold}
          />
        )}
      </LineChart>
    </ChartContainer>
  );
}

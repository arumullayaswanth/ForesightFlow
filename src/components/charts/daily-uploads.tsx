"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  files: {
    label: "Files",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type DailyUploadsChartProps = {
    data: { date: string; files: number }[];
}

export function DailyUploadsChart({ data }: DailyUploadsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Uploads - Last 7 Days</CardTitle>
        <CardDescription>
          An overview of files uploaded each day for the past week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="files" fill="var(--color-files)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


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

type UploadsByRegionChartProps = {
    data: { name: string; value: number }[];
}

export function UploadsByRegionChart({ data }: UploadsByRegionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploads by Region</CardTitle>
        <CardDescription>
          Total files uploaded from each region.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data} layout="vertical">
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis type="number" dataKey="value" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" labelKey="name" formatter={(value) => `${Number(value).toLocaleString()} files`} />}
            />
            <Bar dataKey="value" name="Files" fill="var(--color-files)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

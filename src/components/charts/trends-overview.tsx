"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  files: {
    label: "Files",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type TrendsOverviewChartProps = {
    data: { date: string; files: number; revenue: number }[];
}

export function TrendsOverviewChart({ data }: TrendsOverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trends Overview</CardTitle>
        <CardDescription>Monthly file uploads and revenue over 6 years</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value, index) => {
                if(data.length > 12) {
                    return index % 12 === 0 ? value.substring(4) : ""
                }
                return value
              }}
            />
            <YAxis yAxisId="left" stroke="hsl(var(--chart-1))" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="files"
              type="monotone"
              stroke="var(--color-files)"
              strokeWidth={2}
              dot={false}
              yAxisId="left"
            />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
              yAxisId="right"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

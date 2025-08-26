"use client"

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { format } from "date-fns"

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
              top: 10,
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
                    if (index === 0) return value;
                    const currentDate = new Date(`01 ${value}`);
                    if (currentDate.getMonth() === 0) {
                        return format(currentDate, "yy");
                    }
                    return "";
                }
                return value
              }}
            />
            <YAxis 
                yAxisId="left" 
                stroke="hsl(var(--chart-1))" 
                tickFormatter={(value) => `${value / 1000}k`}
            />
            <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="hsl(var(--chart-2))" 
                tickFormatter={(value) => `${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`}
            />
            <ChartTooltip 
              cursor={false} 
              content={
                <ChartTooltipContent 
                    formatter={(value, name) => (
                        <div className="flex flex-col">
                            <span>{name === 'revenue' 
                                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value))
                                : `${value.toLocaleString()} files`}
                            </span>
                        </div>
                    )}
                />
              } 
            />
            <Legend verticalAlign="bottom" height={36} />
            <Line
              dataKey="files"
              type="monotone"
              stroke="var(--color-files)"
              strokeWidth={2}
              dot={false}
              yAxisId="left"
              name="Files"
            />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
              yAxisId="right"
              name="Revenue"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

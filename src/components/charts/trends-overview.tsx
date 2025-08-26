
"use client"

import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

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
    data: { date: string; files: number; revenue: number, forecast?: boolean }[];
    children?: React.ReactNode;
}

export function TrendsOverviewChart({ data, children }: TrendsOverviewChartProps) {
  const forecastStartIndex = data.findIndex(d => d.forecast);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trends Overview</CardTitle>
        <CardDescription>Monthly file uploads and revenue. Forecasted data is shown with a dashed line.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <AreaChart
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
                    formatter={(value, name, props) => {
                      const isForecast = props.payload?.forecast;
                      const label = name === 'revenue' 
                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value))
                        : `${Number(value).toLocaleString()} files`;
                      
                      return (
                        <div className="flex items-center gap-2">
                           <span>{label}</span>
                           {isForecast && <span className="text-xs text-muted-foreground">(Forecast)</span>}
                        </div>
                      )
                    }}
                />
              } 
            />
            <Legend verticalAlign="bottom" height={36} />
            <defs>
                <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-files)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-files)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                </linearGradient>
            </defs>
             {forecastStartIndex !== -1 && (
              <ReferenceLine yAxisId="left" x={data[forecastStartIndex - 1]?.date} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            )}
            <Area
              dataKey="files"
              type="monotone"
              stroke="var(--color-files)"
              fillOpacity={1} 
              fill="url(#colorFiles)"
              strokeWidth={2}
              yAxisId="left"
              name="Files"
              strokeDasharray={(d) => (d.payload.forecast ? '3 3' : '0')}
            />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              fillOpacity={1} 
              fill="url(#colorRevenue)"
              strokeWidth={2}
              yAxisId="right"
              name="revenue"
              strokeDasharray={(d) => (d.payload.forecast ? '3 3' : '0')}
            />
          </AreaChart>
        </ChartContainer>
        {children}
      </CardContent>
    </Card>
  )
}

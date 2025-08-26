
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"

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
  files: {
    label: "Files",
  },
} satisfies ChartConfig

const COLORS = [
  "#2563eb",
  "#f97316",
  "#22c55e",
  "#facc15",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
  "#ef4444",
  "#10b981",
];

type YearlyDistributionChartProps = {
    data: { year: number; files: number }[];
}

export function YearlyDistributionChart({ data }: YearlyDistributionChartProps) {
    const totalFiles = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.files, 0)
    }, [data])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Yearly Upload Distribution</CardTitle>
        <CardDescription>Total file uploads by year</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name, props) => (
                  <div>
                    <p className="font-medium">{props.payload?.year}</p>
                    <p className="text-sm text-muted-foreground">
                      {Number(value).toLocaleString()} files
                    </p>
                  </div>
                )}
                hideLabel 
              />}
            />
            <Pie
              data={data}
              dataKey="files"
              nameKey="year"
              innerRadius={60}
              strokeWidth={5}
              className="stroke-background"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalFiles.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Files
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

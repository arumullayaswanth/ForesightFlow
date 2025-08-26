
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell, Legend } from "recharts"

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

const COLORS = ["#2563eb", "#f97316", "#22c55e", "#ef4444"];

type FileTypeDistributionChartProps = {
    data: { name: string; value: number }[];
}

export function FileTypeDistributionChart({ data }: FileTypeDistributionChartProps) {
    const totalFiles = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0)
    }, [data])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>File Type Distribution</CardTitle>
        <CardDescription>Breakdown of all uploaded files by type</CardDescription>
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
                formatter={(value) => `${Number(value).toLocaleString()} files`}
                hideLabel 
              />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              className="stroke-background"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

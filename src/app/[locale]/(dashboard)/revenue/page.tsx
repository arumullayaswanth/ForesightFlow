
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getMockData } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DollarSign, File, Calendar } from "lucide-react";
import { subYears, format } from 'date-fns';

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

export default function RevenuePage() {
    const { dailyData, monthlyData } = getMockData();

    const totalRevenue = dailyData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalFiles = dailyData.reduce((acc, curr) => acc + curr.files, 0);
    const avgDailyRevenue = totalRevenue / dailyData.length;
    const avgRevenuePerFile = totalRevenue / totalFiles;
    
    const last12MonthsData = monthlyData.slice(-12);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-2xl font-semibold">Revenue Analysis</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard 
                    title="All-Time Revenue"
                    value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)}
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard 
                    title="Average Daily Revenue"
                    value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(avgDailyRevenue)}
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard 
                    title="Average Revenue Per File"
                    value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(avgRevenuePerFile)}
                    icon={<File className="h-4 w-4 text-muted-foreground" />}
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue - Last 12 Months</CardTitle>
                    <CardDescription>An overview of revenue generated each month for the past year.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                        <BarChart accessibilityLayer data={last12MonthsData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value)}`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value))}
                                />}
                            />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </main>
    );
}

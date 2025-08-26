'use client';

import { useMemo } from "react";
import { getMockData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, UploadCloud, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { DailyUploadsChart } from "@/components/charts/daily-uploads";
import { YearlyDistributionChart } from "@/components/charts/yearly-distribution";


const StatCard = ({ title, value, icon, comparisonText }: { title: string, value: string, icon: React.ReactNode, comparisonText: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {comparisonText}
        </p>
      </CardContent>
    </Card>
);

const Comparison = ({ value, period }: { value: number, period: string }) => {
    const isPositive = value >= 0;
    return (
        <span className="flex items-center gap-1">
            <span className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {value.toFixed(1)}%
            </span>
            <span>{period}</span>
        </span>
    );
};


export default function DashboardPage() {
  const { stats, dailyUploadsLast7Days, yearlyData } = useMemo(() => getMockData(), []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        <StatCard 
            title="Files Uploaded Today"
            value={stats.filesToday.toLocaleString('en-IN')}
            icon={<UploadCloud className="h-4 w-4 text-muted-foreground" />}
            comparisonText={<Comparison value={stats.filesTodayChange} period="vs yesterday" />}
        />
        <StatCard 
            title="Monthly Uploads"
            value={stats.monthlyUploads.toLocaleString('en-IN')}
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            comparisonText={<Comparison value={stats.monthlyUploadsChange} period="vs last month" />}
        />
        <StatCard 
            title="Revenue Today"
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.revenueToday)}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            comparisonText={<Comparison value={stats.revenueTodayChange} period="vs yesterday" />}
        />
        <StatCard 
            title="Monthly Revenue"
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.monthlyRevenue)}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            comparisonText={<Comparison value={stats.monthlyRevenueChange} period="vs last month" />}
        />
        <StatCard 
            title="Total Files"
            value={stats.totalFiles.toLocaleString('en-IN')}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            comparisonText="All-time files uploaded"
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <DailyUploadsChart data={dailyUploadsLast7Days} />
        <YearlyDistributionChart data={yearlyData} />
      </div>
    </main>
  );
}

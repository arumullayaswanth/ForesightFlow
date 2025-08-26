import { getMockData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, UploadCloud, CalendarDays } from "lucide-react";
import { DailyUploadsChart } from "@/components/charts/daily-uploads";
import { TrendsOverviewChart } from "@/components/charts/trends-overview";
import { YearlyDistributionChart } from "@/components/charts/yearly-distribution";

export default function DashboardPage() {
  const { stats, dailyUploadsLast7Days, monthlyData, yearlyData } = getMockData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Files Uploaded Today
            </CardTitle>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.filesToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Latest data from S3
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Uploads</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyUploads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total files this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">
              Generated over 6 years
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">6-Year Summary</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sixYearTotalFiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total files uploaded
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <TrendsOverviewChart data={monthlyData} />
        </div>
        <div className="grid gap-4">
            <DailyUploadsChart data={dailyUploadsLast7Days} />
            <YearlyDistributionChart data={yearlyData} />
        </div>
      </div>
    </main>
  );
}

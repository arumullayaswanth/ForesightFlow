
'use client';

import { MOCK_DATA } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTypeDistributionChart } from "@/components/charts/file-type-distribution";
import { UploadsByRegionChart } from "@/components/charts/uploads-by-region";
import { File, HardDrive } from "lucide-react";

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

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function FileAnalyticsPage() {
    const { analytics } = MOCK_DATA;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-2xl font-semibold">File Analytics</h1>
            <div className="grid gap-4 md:grid-cols-2">
                 <StatCard 
                    title="Total Files"
                    value={analytics.totalFiles.toLocaleString('en-IN')}
                    icon={<File className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard 
                    title="Average File Size"
                    value={formatBytes(analytics.avgFileSize * 1024)} 
                    icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 md:gap-8">
                <FileTypeDistributionChart data={analytics.fileTypeData} />
                <UploadsByRegionChart data={analytics.regionData} />
            </div>
        </main>
    )
}

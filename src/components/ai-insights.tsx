'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { detectAnomalies, Anomaly } from '@/ai/flows/detect-anomalies-flow';
import { MOCK_DATA } from '@/lib/mock-data';
import { Skeleton } from './ui/skeleton';

const severityIcons: Record<Anomaly['severity'], React.ReactNode> = {
  high: <AlertTriangle className="h-5 w-5 text-red-500" />,
  medium: <Info className="h-5 w-5 text-yellow-500" />,
  low: <CheckCircle className="h-5 w-5 text-green-500" />,
};

export function AiInsights() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const dailyData = MOCK_DATA.dailyData.slice(-30);
        const monthlyData = MOCK_DATA.monthlyData.slice(-12);
        
        const result = await detectAnomalies({
          dailyData: JSON.stringify(dailyData),
          monthlyData: JSON.stringify(monthlyData),
        });
        setAnomalies(result);
      } catch (e) {
        console.error('Error fetching AI insights:', e);
        setError('Failed to fetch AI insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <CardDescription>Anomalies and patterns detected by our AI.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : anomalies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No significant anomalies detected in the recent data.</p>
        ) : (
          <ul className="space-y-3">
            {anomalies.map((anomaly, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1">{severityIcons[anomaly.severity]}</div>
                <div>
                    <p className="font-semibold">{anomaly.date}</p>
                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

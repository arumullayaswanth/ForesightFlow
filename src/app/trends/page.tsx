
'use client';

import { useState } from 'react';
import { getMockData } from "@/lib/data";
import { TrendsOverviewChart } from "@/components/charts/trends-overview";
import { DateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { subYears, getYear, format, addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { forecastTrends, Forecast } from '@/ai/flows/forecast-trends-flow';
import type { MonthlyData } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function TrendsPage() {
    const { monthlyData: initialMonthlyData } = getMockData();
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(initialMonthlyData);
    const [forecastData, setForecastData] = useState<Forecast[] | null>(null);
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isForecasting, setIsForecasting] = useState(false);
    const { toast } = useToast();

    const years = Array.from({ length: 6 }, (_, i) => getYear(subYears(new Date(), i))).reverse();

    const handleYearSelection = (year: number) => {
        setSelectedYear(year);
        setDate(undefined); 
        setForecastData(null);
    };
    
    const clearFilters = () => {
        setSelectedYear(null);
        setDate(undefined);
        setForecastData(null);
    }

    const handleForecast = async () => {
        setIsForecasting(true);
        setForecastData(null);
        try {
            const result = await forecastTrends({
                monthlyData: JSON.stringify(filteredMonthlyData),
            });

            // Add a 'forecast' property to distinguish from historical data
            const formattedForecast = result.map(f => ({...f, forecast: true }));
            setForecastData(formattedForecast);
            toast({
                title: "Forecast Generated",
                description: "The forecast for the next 3 months has been added to the chart.",
            });
        } catch (error) {
            console.error("Error forecasting data:", error);
            toast({
                variant: "destructive",
                title: "Forecast Failed",
                description: "There was an error generating the forecast. Please try again.",
            });
        } finally {
            setIsForecasting(false);
        }
    };

    const filteredMonthlyData = selectedYear
        ? monthlyData.filter(d => {
            const dYear = new Date(`01 ${d.date}`).getFullYear();
            return dYear === selectedYear;
        })
        : monthlyData;

    const chartData = forecastData ? [...filteredMonthlyData, ...forecastData] : filteredMonthlyData;


    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-semibold">Upload Trends</h1>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <DateRangePicker date={date} onDateChange={(newDate) => { setDate(newDate); setSelectedYear(null); }} />
                     <Button onClick={handleForecast} disabled={isForecasting} className="w-full sm:w-auto">
                        {isForecasting ? 'Forecasting...' : 'Forecast Next 3 Months'}
                    </Button>
                </div>
            </div>
            <TrendsOverviewChart data={chartData}>
                <div className="flex flex-wrap justify-end gap-2 mt-4">
                    {years.map(year => (
                        <Button
                            key={year}
                            variant={selectedYear === year ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleYearSelection(year)}
                        >
                            {year}
                        </Button>
                    ))}
                    <Button
                        variant={!selectedYear && !date ? 'default' : 'outline'}
                        size="sm"
                        onClick={clearFilters}
                    >
                        All
                    </Button>
                </div>
            </TrendsOverviewChart>
        </main>
    );
}

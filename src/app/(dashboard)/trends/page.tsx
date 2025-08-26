
'use client';

import { useState } from 'react';
import { getMockData } from "@/lib/data";
import { TrendsOverviewChart } from "@/components/charts/trends-overview";
import { DateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { subYears, getYear } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function TrendsPage() {
    const { monthlyData } = getMockData();
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const years = Array.from({ length: 6 }, (_, i) => getYear(subYears(new Date(), i))).reverse();

    const handleYearSelection = (year: number) => {
        setSelectedYear(year);
        setDate(undefined); 
    };

    const filteredMonthlyData = selectedYear
        ? monthlyData.filter(d => d.date.endsWith(selectedYear.toString().substring(2)))
        : monthlyData;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-semibold">Upload Trends</h1>
                <div className="flex items-center gap-2">
                    <DateRangePicker date={date} onDateChange={(newDate) => { setDate(newDate); setSelectedYear(null); }} />
                </div>
            </div>
            <TrendsOverviewChart data={filteredMonthlyData}>
                <div className="flex justify-end gap-2 mt-4">
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
                        variant={!selectedYear ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedYear(null)}
                    >
                        All
                    </Button>
                </div>
            </TrendsOverviewChart>
        </main>
    );
}

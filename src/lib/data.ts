import { subDays, format, subYears, eachDayOfInterval, getMonth, getYear, eachMonthOfInterval } from 'date-fns';

export type DailyData = {
  date: string;
  files: number;
  revenue: number;
};

export type MonthlyData = {
    date: string;
    files: number;
    revenue: number;
}

export type YearlyData = {
    year: number;
    files: number;
}

const START_DATE = subYears(new Date(), 6);
const END_DATE = new Date();

function generateRandomData(date: Date): Omit<DailyData, 'date'> {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseFiles = isWeekend ? 50 : 150;
  const files = baseFiles + Math.floor(Math.random() * 50);
  const revenue = files * (2.5 + Math.random() * 2);
  return { files, revenue };
}

export function getMockData() {
    const dailyData: DailyData[] = eachDayOfInterval({ start: START_DATE, end: END_DATE }).map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        ...generateRandomData(date)
    }));

    const monthlyData: MonthlyData[] = eachMonthOfInterval({ start: START_DATE, end: END_DATE}).map(monthDate => {
        const month = getMonth(monthDate);
        const year = getYear(monthDate);
        const daysInMonth = dailyData.filter(d => getMonth(new Date(d.date)) === month && getYear(new Date(d.date)) === year);

        return {
            date: format(monthDate, 'MMM yy'),
            files: daysInMonth.reduce((acc, curr) => acc + curr.files, 0),
            revenue: daysInMonth.reduce((acc, curr) => acc + curr.revenue, 0)
        }
    });

    const yearlyData: YearlyData[] = Array.from({ length: 7 }, (_, i) => getYear(START_DATE) + i).map(year => {
        const yearData = dailyData.filter(d => getYear(new Date(d.date)) === year);
        return {
            year,
            files: yearData.reduce((acc, curr) => acc + curr.files, 0)
        }
    });

    const today = new Date();
    const todayData = dailyData.find(d => d.date === format(today, 'yyyy-MM-dd')) || { files: 0, revenue: 0 };
    const thisMonth = getMonth(today);
    const thisYear = getYear(today);
    const thisMonthData = dailyData.filter(d => getMonth(new Date(d.date)) === thisMonth && getYear(new Date(d.date)) === thisYear);
    
    const stats = {
        filesToday: todayData.files,
        monthlyUploads: thisMonthData.reduce((acc, curr) => acc + curr.files, 0),
        totalRevenue: dailyData.reduce((acc, curr) => acc + curr.revenue, 0),
        sixYearTotalFiles: dailyData.reduce((acc, curr) => acc + curr.files, 0),
    };

    const dailyUploadsLast7Days = dailyData.slice(-7).map(d => ({
        date: format(new Date(d.date), 'MMM dd'),
        files: d.files
    }));

    return { stats, dailyUploadsLast7Days, monthlyData, yearlyData };
}

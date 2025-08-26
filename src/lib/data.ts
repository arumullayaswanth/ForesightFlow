import { subDays, format, subYears, eachDayOfInterval, getMonth, getYear, eachMonthOfInterval, startOfDay, endOfDay, startOfYear, endOfYear, subMonths } from 'date-fns';

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

const ALL_TIME_START_DATE = subYears(new Date(), 6);
const ALL_TIME_END_DATE = new Date();

function generateRandomData(date: Date): Omit<DailyData, 'date'> {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseFiles = isWeekend ? 50 : 150;
  const files = baseFiles + Math.floor(Math.random() * 50);
  const revenue = files * (2.5 + Math.random() * 2);
  return { files, revenue };
}

const allTimeDailyData: DailyData[] = eachDayOfInterval({ start: ALL_TIME_START_DATE, end: ALL_TIME_END_DATE }).map(date => ({
    date: format(date, 'yyyy-MM-dd'),
    ...generateRandomData(date)
}));

export function getMockData() {
    const startDate = ALL_TIME_START_DATE;
    const endDate = ALL_TIME_END_DATE;

    const dailyData: DailyData[] = allTimeDailyData;

    const monthlyData: MonthlyData[] = eachMonthOfInterval({ start: startDate, end: endDate}).map(monthDate => {
        const month = getMonth(monthDate);
        const year = getYear(monthDate);
        const daysInMonth = dailyData.filter(d => getMonth(new Date(d.date)) === month && getYear(new Date(d.date)) === year);

        return {
            date: format(monthDate, 'MMM yy'),
            files: daysInMonth.reduce((acc, curr) => acc + curr.files, 0),
            revenue: daysInMonth.reduce((acc, curr) => acc + curr.revenue, 0)
        }
    });

    const yearlyData: YearlyData[] = Array.from({ length: getYear(endDate) - getYear(startDate) + 1 }, (_, i) => getYear(startDate) + i).map(year => {
        const yearData = dailyData.filter(d => getYear(new Date(d.date)) === year);
        return {
            year,
            files: yearData.reduce((acc, curr) => acc + curr.files, 0)
        }
    });

    const today = new Date();
    const todayData = dailyData.find(d => d.date === format(today, 'yyyy-MM-dd')) || { files: 0, revenue: 0 };
    
    const stats = {
        filesToday: todayData.files,
        monthlyUploads: monthlyData.find(m => m.date === format(today, 'MMM yy'))?.files || 0,
        totalRevenue: dailyData.reduce((acc, curr) => acc + curr.revenue, 0),
        sixYearTotalFiles: dailyData.reduce((acc, curr) => acc + curr.files, 0),
    };

    const dailyUploadsLast7Days = dailyData.slice(Math.max(dailyData.length - 7, 0)).map(d => ({
        date: format(new Date(d.date), 'MMM dd'),
        files: d.files
    }));

    return { stats, dailyUploadsLast7Days, monthlyData, yearlyData };
}

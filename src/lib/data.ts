import { subDays, format, subYears, eachDayOfInterval, getMonth, getYear, eachMonthOfInterval, startOfDay, endOfDay, startOfYear, endOfYear, subMonths, startOfMonth, endOfMonth } from 'date-fns';

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
  // Assuming revenue is in INR, average price ~₹250-450
  const revenue = files * (250 + Math.random() * 200); 
  return { files, revenue };
}

const allTimeDailyData: DailyData[] = eachDayOfInterval({ start: ALL_TIME_START_DATE, end: ALL_TIME_END_DATE }).map(date => ({
    date: format(date, 'yyyy-MM-dd'),
    ...generateRandomData(date)
})).reverse();

function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}


export function getMockData() {
    const dailyData: DailyData[] = allTimeDailyData;
    const today = new Date();
    const yesterday = subDays(today, 1);
    const lastMonthDate = subMonths(today, 1);
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    
    const todayData = dailyData.find(d => d.date === todayStr) || { files: 0, revenue: 0 };
    const yesterdayData = dailyData.find(d => d.date === yesterdayStr) || { files: 0, revenue: 0 };

    const currentMonth = getMonth(today);
    const currentYear = getYear(today);
    const lastMonth = getMonth(lastMonthDate);
    const lastMonthYear = getYear(lastMonthDate);

    const currentMonthData = dailyData.filter(d => {
        const date = new Date(d.date);
        return getMonth(date) === currentMonth && getYear(date) === currentYear;
    });

    const lastMonthData = dailyData.filter(d => {
        const date = new Date(d.date);
        return getMonth(date) === lastMonth && getYear(date) === lastMonthYear;
    });

    const currentMonthFiles = currentMonthData.reduce((acc, curr) => acc + curr.files, 0);
    const lastMonthFiles = lastMonthData.reduce((acc, curr) => acc + curr.files, 0);

    const currentMonthRevenue = currentMonthData.reduce((acc, curr) => acc + curr.revenue, 0);
    const lastMonthRevenue = lastMonthData.reduce((acc, curr) => acc + curr.revenue, 0);

    const monthlyData: MonthlyData[] = eachMonthOfInterval({ start: ALL_TIME_START_DATE, end: ALL_TIME_END_DATE}).map(monthDate => {
        const month = getMonth(monthDate);
        const year = getYear(monthDate);
        const daysInMonth = dailyData.filter(d => getMonth(new Date(d.date)) === month && getYear(new Date(d.date)) === year);

        return {
            date: format(monthDate, 'MMM yy'),
            files: daysInMonth.reduce((acc, curr) => acc + curr.files, 0),
            revenue: daysInMonth.reduce((acc, curr) => acc + curr.revenue, 0)
        }
    });
    
    const yearlyData: YearlyData[] = Array.from({ length: getYear(ALL_TIME_END_DATE) - getYear(ALL_TIME_START_DATE) + 1 }, (_, i) => getYear(ALL_TIME_START_DATE) + i).map(year => {
        const yearData = dailyData.filter(d => getYear(new Date(d.date)) === year);
        return {
            year,
            files: yearData.reduce((acc, curr) => acc + curr.files, 0)
        }
    });

    const stats = {
        filesToday: todayData.files,
        filesTodayChange: calculatePercentageChange(todayData.files, yesterdayData.files),
        
        monthlyUploads: currentMonthFiles,
        monthlyUploadsChange: calculatePercentageChange(currentMonthFiles, lastMonthFiles),

        revenueToday: todayData.revenue,
        revenueTodayChange: calculatePercentageChange(todayData.revenue, yesterdayData.revenue),

        monthlyRevenue: currentMonthRevenue,
        monthlyRevenueChange: calculatePercentageChange(currentMonthRevenue, lastMonthRevenue),
        
        totalFiles: dailyData.reduce((acc, curr) => acc + curr.files, 0),
    };

    const dailyUploadsLast7Days = dailyData.slice(0, 7).map(d => ({
        date: format(new Date(d.date), 'MMM dd'),
        files: d.files
    })).reverse();

    return { stats, dailyUploadsLast7Days, monthlyData, yearlyData, dailyData: allTimeDailyData };
}

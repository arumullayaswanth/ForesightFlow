
'use client';

import { useState } from "react";
import { getMockData } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Calendar as CalendarIcon, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DailyData {
    date: string;
    files: number;
    revenue: number;
}

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}


export default function ReportsPage() {
    const { dailyData } = getMockData();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const generatePDF = (rowData: DailyData) => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        doc.setFontSize(20);
        doc.text("Daily Report", 14, 22);
        doc.setFontSize(12);
        doc.text(`Date: ${rowData.date}`, 14, 30);
        doc.text(`Total Files Uploaded: ${rowData.files.toLocaleString()}`, 14, 36);
        doc.text(`Total Revenue: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(rowData.revenue)}`, 14, 42);

        // Mock detailed data for the report
        const tableColumn = ["File ID", "Uploaded By", "Location", "File Size (KB)", "Revenue (INR)"];
        const tableRows = [];

        for (let i = 0; i < rowData.files; i++) {
            const revenue = rowData.revenue / rowData.files;
            tableRows.push([
                `file_${i + 1}`,
                `user_${(i % 10) + 1}`,
                ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'][i % 4],
                (Math.random() * 1000).toFixed(2),
                revenue.toFixed(2)
            ]);
        }
        
        doc.autoTable({
            startY: 50,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`report-${rowData.date}.pdf`);
    };

    const generateCSV = (data: DailyData[]) => {
        if (!data.length) return;

        const headers = ["Date", "Files Uploaded", "Revenue (INR)"];
        const csvRows = [
            headers.join(','),
            ...data.map(row => [
                `"${row.date}"`,
                row.files,
                row.revenue
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        
        const dateRange = selectedDate 
            ? format(selectedDate, 'yyyy-MM-dd') 
            : data.length > 1 
                ? `${format(new Date(data[data.length - 1].date), 'yyyy-MM-dd')}_to_${format(new Date(data[0].date), 'yyyy-MM-dd')}`
                : 'full-report';

        link.setAttribute('download', `report-${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const columns = [
        {
            accessorKey: "date",
            header: "Date",
        },
        {
            accessorKey: "files",
            header: "Files Uploaded",
            cell: ({ row }: any) => {
                const amount = parseFloat(row.getValue("files"))
                return <div className="text-left font-medium">{amount.toLocaleString()}</div>
            }
        },
        {
            accessorKey: "revenue",
            header: "Revenue",
            cell: ({ row }: any) => {
                const amount = parseFloat(row.getValue("revenue"))
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)

                return <div className="text-left font-medium">{formatted}</div>
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const rowData = row.original as DailyData;
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePDF(rowData)}
                    >
                        <ArrowDownToLine className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                )
            },
        },
    ]
    
    const filteredData = selectedDate
        ? dailyData.filter(d => d.date === format(selectedDate, 'yyyy-MM-dd'))
        : [...dailyData].reverse();

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-semibold">Reports</h1>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    {selectedDate && (
                        <Button
                            variant="outline"
                            onClick={() => setSelectedDate(undefined)}
                        >
                            Clear
                        </Button>
                    )}
                     <Button variant="outline" onClick={() => generateCSV(filteredData)}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as CSV
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={filteredData} />
        </main>
    );
}

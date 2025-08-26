
'use client';

import { getMockData } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
                        Download
                    </Button>
                )
            },
        },
    ]

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-2xl font-semibold">Reports</h1>
            <DataTable columns={columns} data={dailyData} />
        </main>
    );
}

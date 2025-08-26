
'use client';

import { getMockData } from "@/lib/data";
import { DataTable } from "@/components/data-table";

export default function ReportsPage() {
    const { dailyData } = getMockData();

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
    ]

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-2xl font-semibold">Reports</h1>
            <DataTable columns={columns} data={dailyData} />
        </main>
    );
}

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>This page will allow generating and viewing reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for reports is under development.</p>
        </CardContent>
      </Card>
    </main>
  );
}

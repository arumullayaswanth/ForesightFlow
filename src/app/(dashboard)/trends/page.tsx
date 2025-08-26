import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function TrendsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Trends</CardTitle>
          <CardDescription>This page will contain detailed analysis of upload trends.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for upload trends is under development.</p>
        </CardContent>
      </Card>
    </main>
  );
}

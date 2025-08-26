import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Mountain } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center gap-2 px-4">
            <Mountain className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              ForesightFlow
            </h2>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardNav } from '@/components/dashboard-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'ForesightFlow Dashboard',
  description: 'Dashboard for ForesightFlow data project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader className="flex items-center gap-2 px-4">
                <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpT0ivztMLvT0yBcf1L5qHADQnuo2cmk4kwA&s" alt="ForesightFlow Logo" width={24} height={24} className="text-primary" />
                <h2 className="text-xl font-semibold text-foreground tracking-tight">
                  ForesightFlow
                </h2>
              </SidebarHeader>
              <SidebarContent>
                <DashboardNav />
              </SidebarContent>
              <SidebarFooter>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://picsum.photos/100" alt="Admin" data-ai-hint="person" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sidebar-foreground">Admin</span>
                    <span className="text-xs text-muted-foreground">admin@arealis.io</span>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <DashboardHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

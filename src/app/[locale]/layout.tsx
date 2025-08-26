import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Mountain } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardNav } from '@/components/dashboard-nav';
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

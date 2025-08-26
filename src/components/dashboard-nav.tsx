"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3, DollarSign, FileText, LayoutDashboard, MessageCircleQuestion, FilePieChart } from "lucide-react";
import { useTranslations } from 'next-intl';

export function DashboardNav() {
  const t = useTranslations('DashboardNav');
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/trends", label: t("uploadTrends"), icon: BarChart3 },
    { href: "/revenue", label: t("revenue"), icon: DollarSign },
    { href: "/reports", label: t("reports"), icon: FileText },
    { href: "/file-analytics", label: t("fileAnalytics"), icon: FilePieChart },
    { href: "/ask-ai", label: t("askAi"), icon: MessageCircleQuestion },
  ];


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname.endsWith(item.href)} tooltip={item.label}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

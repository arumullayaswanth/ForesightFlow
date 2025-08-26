"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3, DollarSign, FileText, LayoutDashboard, MessageCircleQuestion, FilePieChart } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trends", label: "Upload Trends", icon: BarChart3 },
    { href: "/revenue", label: "Revenue", icon: DollarSign },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/file-analytics", label: "File Analytics", icon: FilePieChart },
    { href: "/ask-ai", label: "Ask AI", icon: MessageCircleQuestion },
  ];


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
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

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3, DollarSign, FileText, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trends", label: "Upload Trends", icon: BarChart3 },
  { href: "/revenue", label: "Revenue", icon: DollarSign },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function DashboardNav() {
  const pathname = usePathname();

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

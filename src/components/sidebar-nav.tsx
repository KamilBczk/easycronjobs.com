"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    title: "Schedule",
    href: "/app/schedule",
    icon: Calendar,
  },
  {
    title: "Completed",
    href: "/app/completed",
    icon: CheckCircle,
  },
  {
    title: "Team",
    href: "/app/team",
    icon: Users,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
              isActive
                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                : "text-sidebar-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

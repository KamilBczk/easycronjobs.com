"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CheckCircle, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/user/check-admin`);
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data.isAdmin);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };

    checkAdmin();
  }, [session]);

  const allItems = isAdmin
    ? [
        ...items,
        {
          title: "Blog Admin",
          href: "/app/admin",
          icon: BookOpen,
        },
        {
          title: "Users Admin",
          href: "/app/admin/users",
          icon: Users,
        },
      ]
    : items;

  return (
    <nav className="flex flex-col space-y-1">
      {allItems.map((item) => {
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

"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const pageNames: Record<string, string> = {
  "/app": "Dashboard",
  "/app/schedule": "Schedule",
  "/app/completed": "Completed",
  "/app/team": "Team",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || "Dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

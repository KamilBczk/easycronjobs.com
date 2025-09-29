"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col",
      className
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-14 items-center border-b border-sidebar-border px-4",
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto py-4", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex flex-col space-y-1 px-4", className)}
    {...props}
  />
));
SidebarNav.displayName = "SidebarNav";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t border-sidebar-border p-4 mt-auto", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export { Sidebar, SidebarHeader, SidebarContent, SidebarNav, SidebarFooter };

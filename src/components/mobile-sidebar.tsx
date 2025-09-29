"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TeamSwitcher } from "@/components/team-switcher";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { Separator } from "@/components/ui/separator";

interface MobileSidebarProps {
  user: {
    name: string;
    email: string;
  };
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 p-0 bg-sidebar border-sidebar-border"
      >
        <SheetHeader className="border-b border-sidebar-border p-4">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <TeamSwitcher />
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="px-4">
            <SidebarNav />
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        <div className="p-4">
          <UserNav user={user} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

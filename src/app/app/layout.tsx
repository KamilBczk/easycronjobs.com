import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Si pas de session, redirection vers login
  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user?.name || "Utilisateur",
    email: session.user?.email || "email@example.com",
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex">
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>

        <SidebarContent>
          <div className="px-4">
            <SidebarNav />
          </div>
        </SidebarContent>

        <Separator className="bg-sidebar-border" />

        <SidebarFooter>
          <UserNav user={user} />
        </SidebarFooter>
      </Sidebar>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border bg-background px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <MobileSidebar user={user} />
              <AppBreadcrumb />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </main>
    </div>
  );
}

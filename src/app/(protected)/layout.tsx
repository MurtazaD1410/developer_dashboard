"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { AppSideBar } from "./app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import useProject from "@/hooks/use-project";
import { useParams, usePathname, redirect } from "next/navigation";
import { useTheme } from "next-themes";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  const { theme } = useTheme();

  const { projects, isLoading } = useProject();
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId as string;

  const noProjectRequiredRoutes = ["/create", "/pricing", "/sync-user", "/"];

  // Handle initial routing
  React.useEffect(() => {
    // Skip redirect logic if we're on a route that doesn't need a project
    if (noProjectRequiredRoutes.some((route) => pathname.startsWith(route))) {
      return;
    }

    if (!isLoading && projects?.length && projects?.length > 0) {
      // If we're in a project route but project doesn't exist
      if (projectId && !projects.find((p) => p.id === projectId)) {
        redirect(`/projects/${projects[0]!.id}/dashboard`);
      }

      // If we're in a protected route that needs a project but no project is selected
      const needsProject =
        pathname.startsWith("/projects/") ||
        pathname === "/dashboard" ||
        pathname === "/issues" ||
        pathname === "/pull-requests";

      if (needsProject && !projectId) {
        redirect(`/projects/${projects[0]!.id}/dashboard`);
      }
    }

    // Only redirect to create if we're not already on the create page
    if (
      !isLoading &&
      projects?.length === 0 &&
      !pathname.startsWith("/create")
    ) {
      redirect("/create");
    }
  }, [isLoading, projects, projectId, pathname]);

  // Show loading state while checking projects
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="m-2 w-full">
        <div className="flex h-[66px] items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
          {/* search bar */}
          <div className="ml-auto" />
          <ModeToggle />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-12 h-12",
                // Dropdown container
                userButtonPopoverCard: "bg-card text-card-foreground shadow-lg",
                // Dropdown items (buttons)
                userButtonPopoverActionButton:
                  "hover:bg-accent hover:text-accent-foreground transition-colors text-secondary-foreground/80",
                // Dropdown item icons
                userButtonPopoverActionButtonIcon: "text-muted-foreground",
                // Dropdown sign-out button
                userButtonPopoverFooter:
                  "border-t border-border bg-card text-muted-foreground",
              },
              variables: {
                // Apply theme-specific colors
                colorPrimary:
                  theme === "dark"
                    ? "hsl(24.6 95% 53.1%)"
                    : "hsl(20.5 90.2% 48.2%)",
                colorBackground:
                  theme === "dark" ? "hsl(20 14.3% 4.1%)" : "hsl(0 0% 100%)",
              },
            }}
          />
        </div>
        <div className="h-4"></div>
        {/* main content */}
        <div className="h-[calc(100vh-6.2rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Sidebar;

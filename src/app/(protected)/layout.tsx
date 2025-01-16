import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { AppSideBar } from "./app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-12 h-12",
    },
  };

  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="m-2 w-full">
        <div className="flex h-[66px] items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
          {/* search bar */}
          <div className="ml-auto" />
          <ModeToggle />
          <UserButton appearance={userButtonAppearance} />
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

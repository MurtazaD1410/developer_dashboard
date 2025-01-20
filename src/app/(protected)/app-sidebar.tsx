"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import {
  BarChartHorizontal,
  BugIcon,
  CreditCard,
  GitPullRequest,
  LayoutDashboard,
  Plus,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Issues",
    url: "issues",
    icon: BugIcon,
  },
  {
    title: "Pull Requests",
    url: "pull-requests",
    icon: GitPullRequest,
  },
  {
    title: "Team Members",
    url: "members",
    icon: UsersIcon,
  },
  {
    title: "Billing",
    url: "billing",
    icon: CreditCard,
  },
];

export function AppSideBar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BarChartHorizontal className="size-10 text-primary" />
          {open && <h1 className="text-xl font-bold text-primary">DevDash</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      aria-disabled={
                        projects?.length === 0 || projects === undefined
                      }
                      href={
                        item.url === "billing"
                          ? "/billing"
                          : `/projects/${projectId}/${item.url}`
                      }
                      className={cn(
                        {
                          "!bg-primary !text-white":
                            item.url === "billing"
                              ? pathname === "/billing"
                              : pathname ===
                                `/projects/${projectId}/${item.url}`,
                        },
                        "list-none",
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    {!open ? (
                      <Button
                        size={"sm"}
                        variant={"outline"}
                        onClick={() => {
                          setProjectId(project.id);
                        }}
                        className={cn(
                          "flex size-6 items-center justify-center rounded-md border bg-white text-sm text-primary hover:bg-secondary hover:text-primary",
                          {
                            "bg-primary text-white hover:bg-primary hover:text-white":
                              projectId === project.id,
                          },
                        )}
                      >
                        {project.name[0]}
                      </Button>
                    ) : (
                      <div
                        className=""
                        onClick={() => {
                          setProjectId(project.id);
                        }}
                      >
                        <div
                          className={cn(
                            "flex size-6 items-center justify-center rounded-md border bg-white text-sm text-primary",
                            {
                              "bg-primary text-white": projectId === project.id,
                            },
                          )}
                        >
                          {project.name[0]}
                        </div>
                        <span> {project.name}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              <SidebarMenuItem>
                <Link href={"/create"}>
                  {open && (
                    <Button size={"sm"} variant={"outline"} className="w-fit">
                      <Plus />
                      Create Project
                    </Button>
                  )}
                  {!open && (
                    <Button size={"sm"} variant={"outline"} className="w-8">
                      <Plus />
                    </Button>
                  )}
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

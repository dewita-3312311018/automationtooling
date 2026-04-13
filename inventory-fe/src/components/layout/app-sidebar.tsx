"use client";

import * as React from "react";
import { useLocation } from "@tanstack/react-router";
import { History, LayoutDashboard, Package, ClipboardList, ClipboardCheck, Users, MapPin, Shield } from "lucide-react";

import { NavGeneral } from "@/components/layout/nav-general";
import { NavUser } from "@/components/layout/nav-user";
import { useUserPermissions } from "@/features/rbac/hooks/use-user-permissions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useProfile } from "@/features/profile";
import { Permissions } from "@/features/rbac/utils/permission-constants";

const data = {
  project: {
    name: "Automation and Tooling",
    logo: LayoutDashboard,
  },
  navMain: [

    {
      title: "Stock",
      url: "/stock",
      icon: Package,
      permission: Permissions.stocks.read,
    },
    {
      title: "Requests",
      url: "/requests",
      icon: ClipboardList,
      permission: Permissions.requests.read,
    },
    {
      title: "My Requests",
      url: "/my-requests",
      icon: ClipboardCheck,
      permission: Permissions.requests.myRequests,
    },
    {
      title: "Locations",
      url: "/locations",
      icon: MapPin,
      permission: Permissions.locations.read,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
      permission: Permissions.users.read,
    },
  ],
  navSystem: [
    {
      title: "Access Control",
      url: "/rbac",
      icon: Shield,
      permission: Permissions.rbac.read,
    },
    {
      title: "Logs",
      url: "/logs",
      icon: History,
      permission: Permissions.audit.read,
    },
  ],
};

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { hasPermission, isLoading } = useUserPermissions();
  const { data: profile } = useProfile();

  const filteredNavMain = React.useMemo(() => {
    if (isLoading) return [];
    return data.navMain.filter(item => item.permission === null || hasPermission(item.permission));
  }, [hasPermission, isLoading]);

  const filteredNavSystem = React.useMemo(() => {
    if (isLoading) return [];
    return data.navSystem.filter(item => hasPermission(item.permission));
  }, [hasPermission, isLoading]);

  const navMainWithActiveState = React.useMemo(() => {
    return filteredNavMain.map((item) => ({
      ...item,
      isActive: location.pathname.startsWith(item.url),
    }));
  }, [filteredNavMain, location.pathname]);

  const navSystemWithActiveState = React.useMemo(() => {
    return filteredNavSystem.map((item) => ({
      ...item,
      isActive: location.pathname.startsWith(item.url),
    }));
  }, [filteredNavSystem, location.pathname]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <data.project.logo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{data.project.name}</span>
                  <span className="truncate text-xs capitalize">{profile?.role}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navMainWithActiveState.length > 0 && <NavGeneral items={navMainWithActiveState} />}
        {navSystemWithActiveState.length > 0 && <NavGeneral items={navSystemWithActiveState} label="System" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar };

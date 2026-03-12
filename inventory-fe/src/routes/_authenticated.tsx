import React from "react";
import { createFileRoute, Outlet, redirect, useLocation, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { isAuthenticated } from "@/lib/auth";
import { NuqsAdapter } from "nuqs/adapters/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <NuqsAdapter>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-background focus:outline-none">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:h-[60px] lg:px-6">
              <div className="flex items-center gap-1">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-1 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {
                      pathnames.map((value, index) => {
                        const isLast = index === pathnames.length - 1;
                        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const label = value.charAt(0).toUpperCase() + value.slice(1);

                        return (
                          <React.Fragment key={to}>
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage>{label}</BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink asChild>
                                  <Link to={to}>{label}</Link>
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                          </React.Fragment>
                        );
                      })
                    }
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </header>
            <div className="p-4 lg:p-6 lg:pt-8 bg-neutral-50 min-h-[calc(100vh-64px)]">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
      <Toaster />
    </NuqsAdapter>
  );
}

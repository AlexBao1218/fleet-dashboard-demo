import { CarTaxiFront, Database, ExternalLink, Gauge, RotateCcw, Truck, UserRound, Wrench } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useCurrentUserProfile } from "@lark-apaas/client-toolkit/hooks/useCurrentUserProfile";
import { CASE_STUDY_URL, DEMO_LABEL, PROGRAM_NAME, PROGRAM_TAGLINE } from "@/lib/brand";
import { resetDemoData } from "@/platform/store";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@client/src/components/ui/sidebar";

const DASHBOARD_ITEMS = [
  { path: "/fuel-consumption", label: "Fuel Consumption", icon: Gauge },
  { path: "/maintenance", label: "Maintenance", icon: Wrench },
  { path: "/accident", label: "Accident", icon: CarTaxiFront },
] as const;

const NAV_BUTTON_CLASS =
  "text-[#4a4a4a] hover:bg-[#eceff3] hover:text-[#4a4a4a] " +
  "data-[active=true]:bg-white data-[active=true]:font-semibold " +
  "data-[active=true]:shadow-[inset_3px_0_0_0_var(--brand)] " +
  "data-[active=true]:text-brand [&>svg]:data-[active=true]:text-brand " +
  "data-[active=true]:hover:bg-white data-[active=true]:hover:text-brand";

const LayoutContent = () => {
  const { pathname } = useLocation();
  const userInfo = useCurrentUserProfile();
  const displayName = userInfo?.name ?? "Guest";

  // The production app signed in through the platform; the demo has one
  // fixed user and a reset that restores the synthetic dataset.
  const handleReset = () => {
    resetDemoData();
    window.location.reload();
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-2 pb-2 pt-4">
          <Link
            to="/fuel-consumption"
            className="flex flex-col gap-0.5 rounded-md px-2 py-1 leading-tight"
          >
            <span className="flex items-center gap-2 text-[20px] font-bold leading-7 text-[#083060] group-data-[collapsible=icon]:hidden">
              <Truck className="size-6 shrink-0" strokeWidth={2.2} />
              {PROGRAM_NAME}
            </span>
            <span className="hidden size-8 items-center justify-center rounded-md bg-brand text-white group-data-[collapsible=icon]:flex">
              <Truck className="size-4" />
            </span>
            <span className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              {PROGRAM_TAGLINE}
            </span>
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              {DEMO_LABEL}
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.08em] text-[#8a8a8a] group-data-[collapsible=icon]:hidden">
              Dashboards
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {DASHBOARD_ITEMS.map((item: (typeof DASHBOARD_ITEMS)[number]) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.path}
                      tooltip={item.label}
                      className={NAV_BUTTON_CLASS}
                    >
                      <Link to={item.path}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/data-management"}
                tooltip="Data Management"
                className={NAV_BUTTON_CLASS}
              >
                <Link to="/data-management">
                  <Database className="size-4" />
                  <span>Data Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Case study" className={NAV_BUTTON_CLASS}>
                <a href={CASE_STUDY_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  <span>Case study</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                    <UserRound className="size-3.5" />
                  </span>
                  <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Restore the synthetic dataset"
                    className="ml-auto flex items-center gap-1 rounded px-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group-data-[collapsible=icon]:hidden"
                  >
                    <RotateCcw className="size-3" />
                    Reset data
                  </button>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex items-center gap-2 border-b border-[#e6e6e6] px-4 py-2 md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
};

const Layout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default Layout;

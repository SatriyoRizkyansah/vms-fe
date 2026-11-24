import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Building2,
  CalendarDays,
  FileBarChart2,
  LogOut,
  Plus,
  Settings2,
  Smartphone,
  UserRound,
  type LucideIcon,
} from "lucide-react";
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
} from "@/components/ui/sidebar";

type NavigationItem = { title: string; url: string; icon: LucideIcon; exact?: boolean };

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email?: string; role?: string };
  canSeeSettings: boolean;
  onLogout: () => void;
};

const mainNavigation: NavigationItem[] = [
  { title: "Ringkasan", url: "/app", icon: Activity, exact: true },
  { title: "Kunjungan", url: "/app/visits", icon: CalendarDays },
  { title: "Perangkat", url: "/app/devices", icon: Smartphone },
];

const adminNavigation: NavigationItem[] = [
  { title: "Lokasi", url: "/app/locations", icon: Building2 },
  { title: "Laporan", url: "/app/reports", icon: FileBarChart2 },
  { title: "Pengaturan", url: "/app/settings", icon: Settings2 },
];

function SidebarLinks({ items }: { items: NavigationItem[] }) {
  const location = useLocation();
  return (
    <SidebarMenu>
      {items.map(({ title, url, icon: Icon, exact }) => (
        <SidebarMenuItem key={url}>
          <SidebarMenuButton
            render={<Link to={url} />}
            isActive={exact ? location.pathname === url : location.pathname.startsWith(url)}
            tooltip={title}
          >
            <Icon />
            <span>{title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar({ user, canSeeSettings, onLogout, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/app" />}
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              tooltip="LEMIGAS VMS"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">V</span>
              <span className="grid text-left leading-tight">
                <span className="font-semibold">LEMIGAS</span>
                <span className="text-xs text-muted-foreground">Visitor Management</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operasional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinks items={mainNavigation} />
          </SidebarGroupContent>
        </SidebarGroup>
        {canSeeSettings && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarLinks items={adminNavigation} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {user.role !== "AUDITOR" && (
          <SidebarGroup>
            <SidebarGroupLabel>Aksi cepat</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link to="/app/walk-in" />} tooltip="Tamu walk-in">
                    <Plus />
                    <span>Tamu walk-in</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex min-w-0 items-center gap-2 rounded-md p-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                <UserRound className="size-4" />
              </div>
              <div className="grid min-w-0 flex-1 text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.role ?? "Staf"}</span>
              </div>
              <SidebarMenuButton className="w-auto shrink-0" onClick={onLogout} tooltip="Keluar" aria-label="Keluar">
                <LogOut />
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

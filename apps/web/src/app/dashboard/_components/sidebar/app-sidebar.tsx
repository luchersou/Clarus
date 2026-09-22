"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { useEffect } from "react";

import Logo from "@/app/dashboard/_components/sidebar/logo";
import { NavMain } from "@/app/dashboard/_components/sidebar/nav-main";
import { NavUser } from "@/app/dashboard/_components/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useIsTablet } from "@/hooks/use-breakpoints";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
  <Sidebar collapsible="icon" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! cursor-default hover:bg-transparent">
            <Logo />
            <span className="text-foreground font-semibold">Clarus</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <ScrollArea className="h-full">
        <NavMain />
      </ScrollArea>
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
);
}
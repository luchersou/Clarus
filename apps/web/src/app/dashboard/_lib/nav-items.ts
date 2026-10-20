import {
  BarChart3Icon,
  FileTextIcon,
  HomeIcon,
  MessageSquareIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navItems: NavGroup[] = [
  {
    title: "Navigation",
    items: [
      {
        title: "Home",
        href: "/dashboard",
        icon: HomeIcon,
      },
      {
        title: "Documents",
        href: "/dashboard/documents",
        icon: FileTextIcon,
      },
      {
        title: "Analyses",
        href: "/dashboard/analyses",
        icon: BarChart3Icon,
      },
      {
        title: "Chat",
        href: "/dashboard/chat",
        icon: MessageSquareIcon,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

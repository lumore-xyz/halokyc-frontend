import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BarChart3Icon,
  BoxesIcon,
  BrainCircuitIcon,
  Building2Icon,
  ChartLineIcon,
  CircleDollarSignIcon,
  ClockIcon,
  GaugeIcon,
  InboxIcon,
  KeyRoundIcon,
  ListChecksIcon,
  ListTodoIcon,
  ScanSearchIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TerminalIcon,
  UsersIcon,
  WebhookIcon,
  WorkflowIcon,
} from "lucide-react";

import type { ClientRole, PlatformRole } from "@/lib/api-client";

export type AppNavAudience = "client" | "admin" | "shared";

export type AppNavScope = "workspace" | "organization";

export type AppNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Allow-list of client roles that may see this entry. */
  roles?: ClientRole[];
  /** Allow-list of platform roles that may see this entry. */
  platformRoles?: PlatformRole[];
  /** Where the entry lives. Default: workspace-scoped. */
  scope?: AppNavScope;
};

export type AppNavGroup = {
  label: string;
  audience: AppNavAudience;
  items: AppNavItem[];
};

/**
 * Client-side navigation groups for the customer console.
 *
 * Items are filtered by the caller's `organizationRole` via
 * `useNavGroups(audience, role)`. Each `roles` array restricts an item to
 * the listed roles; entries without `roles` are visible to every customer.
 *
 * `scope: "organization"` keeps the URL unchanged when the workspace
 * switcher rewrites workspace-scoped entries (the default).
 */
export const APP_NAV_GROUPS: AppNavGroup[] = [
  {
    label: "Workspace",
    audience: "client",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: GaugeIcon,
        exact: true,
      },
      {
        title: "Verifications",
        url: "/dashboard/sessions",
        icon: ListChecksIcon,
        roles: [
          "client_owner",
          "client_admin",
          "client_reviewer",
          "client_developer",
        ],
      },
      {
        title: "Manual review",
        url: "/dashboard/reviews",
        icon: ScanSearchIcon,
        exact: true,
        roles: ["client_owner", "client_admin", "client_reviewer"],
      },
      {
        title: "Assigned reviews",
        url: "/dashboard/reviews/assigned",
        icon: ListTodoIcon,
        roles: ["client_reviewer"],
      },
      {
        title: "Completed reviews",
        url: "/dashboard/reviews/completed",
        icon: ListChecksIcon,
        roles: ["client_reviewer"],
      },
      {
        title: "Workflows",
        url: "/dashboard/workflows",
        icon: WorkflowIcon,
        roles: ["client_owner", "client_admin", "client_developer"],
      },
      {
        title: "API keys",
        url: "/dashboard/api-keys",
        icon: KeyRoundIcon,
        roles: ["client_owner", "client_admin", "client_developer"],
      },
      {
        title: "Webhooks",
        url: "/dashboard/webhooks",
        icon: WebhookIcon,
        roles: ["client_owner", "client_admin", "client_developer"],
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: ChartLineIcon,
        roles: ["client_owner", "client_admin"],
      },
      {
        title: "Audit logs",
        url: "/dashboard/audit-logs",
        icon: ScrollTextIcon,
        roles: ["client_owner", "client_admin"],
      },
    ],
  },
  {
    label: "Organization",
    audience: "client",
    items: [
      {
        title: "Workspaces",
        url: "/dashboard/workspaces",
        icon: BoxesIcon,
        roles: ["client_owner", "client_admin"],
        scope: "organization",
      },
      {
        title: "Team",
        url: "/dashboard/team",
        icon: UsersIcon,
        roles: ["client_owner", "client_admin"],
        scope: "organization",
      },
      {
        title: "Billing",
        url: "/dashboard/billing",
        icon: ActivityIcon,
        roles: ["client_owner", "client_admin"],
        scope: "organization",
      },
    ],
  },
  {
    label: "Account",
    audience: "client",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: SettingsIcon,
        scope: "organization",
      },
    ],
  },
  {
    label: "Developer",
    audience: "client",
    items: [
      { title: "API console", url: "/dashboard/console", icon: TerminalIcon },
      {
        title: "Integration logs",
        url: "/dashboard/integration-logs",
        icon: BarChart3Icon,
      },
      {
        title: "Docs",
        url: "/dashboard/docs",
        icon: ListTodoIcon,
      },
    ],
  },
  {
    label: "Operator",
    audience: "admin",
    items: [
      {
        title: "Overview",
        url: "/admin",
        icon: GaugeIcon,
        exact: true,
      },
      {
        title: "Organizations",
        url: "/admin/organizations",
        icon: Building2Icon,
        platformRoles: [
          "platform_owner",
          "platform_business_admin",
          "platform_support",
        ],
      },
      {
        title: "Workspaces",
        url: "/admin/workspaces",
        icon: BoxesIcon,
        platformRoles: [
          "platform_owner",
          "platform_business_admin",
          "platform_support",
        ],
      },
      {
        title: "Verifications",
        url: "/admin/verifications",
        icon: ScanSearchIcon,
        platformRoles: [
          "platform_owner",
          "platform_business_admin",
          "platform_support",
        ],
      },
      {
        title: "Billing & credits",
        url: "/admin/billing",
        icon: CircleDollarSignIcon,
        platformRoles: ["platform_owner", "platform_business_admin"],
      },
      {
        title: "Support",
        url: "/admin/support",
        icon: ShieldAlertIcon,
        platformRoles: [
          "platform_owner",
          "platform_business_admin",
          "platform_support",
        ],
      },
      {
        title: "Sales",
        url: "/admin/sales",
        icon: ShoppingCartIcon,
        platformRoles: ["platform_owner", "platform_business_admin"],
      },
      {
        title: "AI providers",
        url: "/admin/ai-providers",
        icon: BrainCircuitIcon,
        platformRoles: ["platform_owner"],
      },
      {
        title: "Platform admins",
        url: "/admin/platform-admins",
        icon: UsersIcon,
        platformRoles: ["platform_owner"],
      },
      {
        title: "Audit logs",
        url: "/admin/audit-logs",
        icon: ScrollTextIcon,
        platformRoles: ["platform_owner", "platform_business_admin"],
      },
      {
        title: "Data subject requests",
        url: "/admin/dsr",
        icon: ScrollTextIcon,
        platformRoles: ["platform_owner", "platform_business_admin"],
      },
      {
        title: "Retention",
        url: "/admin/retention",
        icon: ClockIcon,
        platformRoles: ["platform_owner", "platform_business_admin"],
      },
      {
        title: "System settings",
        url: "/admin/system-settings",
        icon: SettingsIcon,
        platformRoles: ["platform_owner"],
      },
    ],
  },
  {
    label: "Admin",
    audience: "admin",
    items: [
      { title: "Clients", url: "/admin/clients", icon: Building2Icon },
      { title: "Ledger", url: "/admin/ledger", icon: ScrollTextIcon },
      { title: "Review queue", url: "/admin/reviews", icon: InboxIcon },
    ],
  },
];

export const APP_AUDIENCE_META: Record<
  AppNavAudience,
  { label: string; icon: LucideIcon; tagline: string }
> = {
  client: {
    label: "Client workspace",
    icon: ShieldCheckIcon,
    tagline: "Your API keys, usage, and integration settings.",
  },
  admin: {
    label: "Operator console",
    icon: ShieldCheckIcon,
    tagline: "Role-aware internal console for HaloKYC operators.",
  },
  shared: {
    label: "Developer tools",
    icon: TerminalIcon,
    tagline: "Run live verifications against the HaloKYC API.",
  },
};

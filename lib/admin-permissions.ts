import type { AdminRole } from "@/lib/types";

export type AdminPermission =
  | "dashboard:view"
  | "cars:view"
  | "cars:edit_content"
  | "cars:edit_commercial"
  | "cars:delete"
  | "crm:view"
  | "crm:edit"
  | "calendar:view"
  | "calendar:edit"
  | "settings:view"
  | "settings:edit"
  | "analytics:view"
  | "admins:manage";

const permissions: Record<AdminRole, readonly AdminPermission[]> = {
  owner: ["dashboard:view", "cars:view", "cars:edit_content", "cars:edit_commercial", "cars:delete", "crm:view", "crm:edit", "calendar:view", "calendar:edit", "settings:view", "settings:edit", "analytics:view", "admins:manage"],
  manager: ["dashboard:view", "cars:view", "cars:edit_content", "cars:edit_commercial", "crm:view", "crm:edit", "calendar:view", "calendar:edit", "analytics:view"],
  content_manager: ["dashboard:view", "cars:view", "cars:edit_content", "settings:view", "settings:edit", "analytics:view"],
  viewer: ["dashboard:view", "cars:view", "analytics:view"],
};

export function can(role: AdminRole, permission: AdminPermission) {
  return permissions[role].includes(permission);
}

export const roleLabels: Record<AdminRole, string> = {
  owner: "Owner",
  manager: "Manager",
  content_manager: "Content manager",
  viewer: "Viewer",
};


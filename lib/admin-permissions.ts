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
  | "financing:view"
  | "financing:edit"
  | "ads:view"
  | "ads:edit"
  | "ads:delete"
  | "admins:manage";

const permissions: Record<AdminRole, readonly AdminPermission[]> = {
  owner: ["dashboard:view", "cars:view", "cars:edit_content", "cars:edit_commercial", "cars:delete", "crm:view", "crm:edit", "calendar:view", "calendar:edit", "settings:view", "settings:edit", "analytics:view", "financing:view", "financing:edit", "ads:view", "ads:edit", "ads:delete", "admins:manage"],
  manager: ["dashboard:view", "cars:view", "cars:edit_content", "cars:edit_commercial", "crm:view", "crm:edit", "calendar:view", "calendar:edit", "analytics:view", "financing:view", "financing:edit", "ads:view", "ads:edit", "ads:delete"],
  content_manager: ["dashboard:view", "cars:view", "cars:edit_content", "settings:view", "settings:edit", "analytics:view", "ads:view", "ads:edit", "ads:delete"],
  viewer: ["dashboard:view", "cars:view", "analytics:view", "financing:view", "ads:view"],
};

export function can(role: AdminRole, permission: AdminPermission) {
  return permissions[role].includes(permission);
}

export { adminRoleLabels as roleLabels } from "@/lib/admin-i18n";

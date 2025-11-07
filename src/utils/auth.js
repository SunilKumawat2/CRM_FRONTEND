// utils/auth.js

// Check login token
export const isLoggedIn = () => !!localStorage.getItem("admin_token");

// Get saved role
export const getUserRole = () => localStorage.getItem("login_role");

// Get permissions array
export const getUserPermissions = () =>
  JSON.parse(localStorage.getItem("permissions") || "[]");

// Check if a specific permission exists
// requiredPermission format: "module_action", e.g., "dashboard_view"
export const hasPermission = (requiredPermission) => {
  const role = getUserRole();
  const permissions = getUserPermissions();

  if (!requiredPermission) return true;
  if (role === "super_admin") return true;

  const [moduleName, actionName] = requiredPermission.split("_");

  // Normalize comparison
  return permissions.some(
    (perm) =>
      perm.module.toLowerCase() === moduleName.toLowerCase() &&
      perm.actions.map((a) => a.toLowerCase()).includes(actionName.toLowerCase())
  );
};

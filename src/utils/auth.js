// utils/auth.js

// Check login token
export const isLoggedIn = () => !!localStorage.getItem("admin_token");

// Get saved role
export const getUserRole = () => localStorage.getItem("login_role");
// Get permissions array
export const getUserPermissions = () =>
  JSON.parse(localStorage.getItem("permissions") || "[]");

const normalize = (str) =>
  str.toLowerCase().replace(/\s+/g, "_");

export const hasPermission = (requiredPermission) => {
  const role = getUserRole();
  const permissions = getUserPermissions();

  if (!requiredPermission) return true;
  if (role === "super_admin") return true;

  const [moduleName, actionName] = requiredPermission.split("_");

  return permissions.some((perm) => {
    const normalizedModule = normalize(perm.module);

    return (
      normalizedModule === moduleName &&
      perm.actions
        .map((a) => a.toLowerCase())
        .includes(actionName.toLowerCase())
    );
  });
};
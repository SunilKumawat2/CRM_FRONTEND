// utils/auth.js

// Check login token
export const isLoggedIn = () => !!localStorage.getItem("admin_token");

// Get saved role
// export const getUserRole = () => localStorage.getItem("login_role");
// Get permissions array
export const getUserPermissions = () =>
  JSON.parse(localStorage.getItem("permissions") || "[]");

const normalize = (str) =>
  str.toLowerCase().replace(/\s+/g, "_");

export const hasPermission = (user, requiredPermission) => {
  // const role = getUserRole();
  // const permissions = getUserPermissions();

  if (!requiredPermission) return true;
  // If user not loaded yet
  if (!user) return false;

  // Super Admin bypass
  if (user?.role === "super_admin")
    return true;

  // Permissions from API user object
  const permissions = user?.permissions || [];

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
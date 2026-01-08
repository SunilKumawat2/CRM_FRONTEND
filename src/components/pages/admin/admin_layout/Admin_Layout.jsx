import React, { useState, useEffect } from "react";
import Sidebar_Admin from "../admin_sidebar/Sidebar_Admin";
import Header_Admin from "../../../common/admin_header/Admin_Header";
import Admin_Footer from "../../../common/admin_footer/Admin_Footer";
import "../../../../assets/css/AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("admin_theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={`admin-layout ${isCollapsed ? "collapsed" : ""}`}>
      <Sidebar_Admin
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="admin-main">
        <Header_Admin theme={theme} toggleTheme={toggleTheme} />
        <main className="admin-content">{children}</main>
        <Admin_Footer />
      </div>
    </div>
  );
};

export default AdminLayout;

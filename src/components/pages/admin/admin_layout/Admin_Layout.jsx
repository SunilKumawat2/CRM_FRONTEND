import React, { useState } from "react";
import Sidebar_Admin from "../admin_sidebar/Sidebar_Admin";
import "../../../../assets/css/AdminLayout.css";
import Header_Admin from "../../../common/admin_header/Admin_Header";
import Admin_Footer from "../../../common/admin_footer/Admin_Footer";

const AdminLayout = ({ children }) => {
  // Sidebar expand/collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${isCollapsed ? "collapsed" : ""}`}>
      {/* Pass the state and toggle function to sidebar */}
      <Sidebar_Admin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content area */}
      <div className="admin-main">
        <Header_Admin />
        <main className="admin-content">{children}</main>
        <Admin_Footer />
      </div>
    </div>
  );
};

export default AdminLayout;

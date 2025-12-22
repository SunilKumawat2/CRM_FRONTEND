// components/pages/admin/admin_sidebar/Sidebar_Admin.js

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserShield,
  FaCog,
  FaSignOutAlt,
  FaEnvelopeOpenText,
  FaBars,
  FaPhoneAlt
} from "react-icons/fa";
import { hasPermission } from "../../../../utils/auth";
import { MdOutlineBedroomParent } from "react-icons/md";

const Sidebar_Admin = ({ isCollapsed, setIsCollapsed }) => {
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // State for status dropdown
  const [status, setStatus] = useState("All Status");

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    console.log("Selected Status:", e.target.value);
    // You can call a filter function here if needed
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <nav className="sidebar-menu">
        {hasPermission("dashboard_view") && (
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <FaTachometerAlt className="menu-icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
        )}

        {/* Roles */}
        {hasPermission("roles_view") && (
          <NavLink
            to="/admin-role-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <FaUserShield className="menu-icon" />
            {!isCollapsed && <span>Roles</span>}
          </NavLink>
        )}

        {/* Admins */}
        {hasPermission("admins_view") && (
          <NavLink
            to="/admin-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <FaUserShield className="menu-icon" />
            {!isCollapsed && <span>Admins</span>}
          </NavLink>
        )}

        {/* Inquiries */}
        {/* {hasPermission("inquiries_view") && (
          <NavLink
            to="/admin-inquiry"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <FaEnvelopeOpenText className="menu-icon" />
            {!isCollapsed && <span>Inquiries</span>}
          </NavLink>
        )}  */}

        {/* Inquiries */}
        {/* {hasPermission("inquiries_view") && (
          <NavLink
            to="/admin-lead-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <FaPhoneAlt  className="menu-icon" />
            {!isCollapsed && <span>Lead</span>}
          </NavLink>
        )}  */}

        {/* Rooms Management */}
        {hasPermission("rooms_view") && (
          <NavLink
            to="/admin-room-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Rooms</span>}
          </NavLink>
        )}

        {/* Rooms booking Management */}
        {hasPermission("booking_view") && (
          <NavLink
            to="/admin-room-booking-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Room Booking</span>}
          </NavLink>
        )}
        {/* Rooms booking Management */}
        {hasPermission("booking_view") && (
          <NavLink
            to="/admin-guest-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Guests</span>}
          </NavLink>
        )}
        {hasPermission("booking_view") && (
          <NavLink
            to="/admin-housekeeping-list"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Housekeeping</span>}
          </NavLink>
        )}
   {hasPermission("attendance_view") && (
          <NavLink
            to="/admin-staff-attendance"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Staff Attendance</span>}
          </NavLink>
        )}
   {hasPermission("invoice_view") && (
          <NavLink
            to="/admin-invoice"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Invoice</span>}
          </NavLink>
        )}
   {hasPermission("valet_view") && (
          <NavLink
            to="/admin-valet-parking"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <MdOutlineBedroomParent className="menu-icon" /> {/* you can change to a bed icon */}
            {!isCollapsed && <span>Valet Parking</span>}
          </NavLink>
        )}

        {/* Settings */}
        {/* {hasPermission("settings_view") && (
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            <FaCog className="menu-icon" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        )}  */}


      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <FaSignOutAlt className="menu-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar_Admin;

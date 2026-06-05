import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";
import { MdOutlineBedroomParent } from "react-icons/md";
import { useState, useEffect } from "react";
import { hasPermission } from "../../../../utils/auth";

const Sidebar_Admin = ({ isCollapsed, setIsCollapsed }) => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ✅ MENU CONFIG (CLEAN & SCALABLE)
  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin-dashboard",
      permission: "dashboard_view",
    },
    {
      title: "User Management",
      icon: <FaUserShield />,
      children: [
        { title: "Roles", path: "/admin-role-list", permission: "roles_view" },
        { title: "Admins", path: "/admin-list", permission: "admins_view" },
      ],
    },
    {
      title: "Room Management",
      icon: <MdOutlineBedroomParent />,
      children: [
        { title: "Room Types", path: "/admin-room-type", permission: "typerooms_view" },
        { title: "Rooms", path: "/admin-room-list", permission: "rooms_view" },
        { title: "Bookings", path: "/admin-room-booking-list", permission: "bookings_view" },
      ],
    },
    {
      title: "Guests & Services",
      icon: <MdOutlineBedroomParent />,
      children: [
        { title: "Guests", path: "/admin-guest-list", permission: "guests_view" },
        { title: "Housekeeping", path: "/admin-housekeeping-list", permission: "housekeeping_view" },
        { title: "Guest Request", path: "/admin-guest-request", permission: "guest_request_view" },
      ],
    },
    {
      title: "Staff Management",
      icon: <MdOutlineBedroomParent />,
      children: [
        { title: "Staff", path: "/admin-staff", permission: "staffs_view" },
        { title: "Shift", path: "/admin-shift", permission: "shifts_view" },
        { title: "Attendance", path: "/admin-staff-attendance", permission: "staffattendances_view" },
        { title: "Attendance Summary", path: "/admin-staff-attendance-summary", permission: "staffattendances_view" },
      ],
    },
    ,
    {
      title: "HR Management",
      icon: <MdOutlineBedroomParent />,
      children: [
        { title: "Weekly Off", path: "/admin-weekly-off", permission: "weeklyoffs_view" },
        { title: "Holiday", path: "/admin-holiday", permission: "holidaies_view" },
        { title: "Payroll", path: "/admin-payroll", permission: "payroll_view" },
        { title: "Salary Slip", path: "/admin-staff-salary-slip", permission: "SalarySlip_View" },
        { title: "Staff Certificate", path: "/admin-staff-certificates", permission: "StaffCertificate_View" },
      ],
    },
    {
      title: "Reports",
      icon: <MdOutlineBedroomParent />,
      children: [
        { title: "Daily", path: "/admin-daily-reports", permission: "daily_report_view" },
        { title: "Monthly", path: "/admin-monthly-reports", permission: "monthly_report_view" },
        { title: "Occupancy", path: "/admin-occupancy-report", permission: "occupancy_report_view" },
        
      ],
    },
    {
      title: "Other",
      icon: <MdOutlineBedroomParent />,
      children: [
        { title: "Invoice", path: "/admin-invoice", permission: "invoice_view" },
        { title: "Valet Parking", path: "/admin-valet-parking", permission: "valetparking_view" },
        { title: "Event Package", path: "/admin-hotel-event-package", permission: "event_view" },
        { title: "Catering", path: "/admin-catering", permission: "catering_view" },
        { title: "Feedback", path: "/admin-user-feedback", permission: "feedback_view" },
        { title: "Banner", path: "/admin-home-banner", permission: "banner_view" },
        { title: "Site Setting", path: "/admin-hotel-site-setting", permission: "HotelDetails_view" },
       
      ],
    },
  ];

  // ✅ AUTO OPEN ACTIVE MENU
  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.children) {
        const isActive = item.children.some((sub) =>
          location.pathname.startsWith(sub.path)
        );
        if (isActive) {
          setOpenMenus((prev) => ({ ...prev, [index]: true }));
        }
      }
    });
  }, [location.pathname]);

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      
      {/* HEADER */}
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => {
          // SINGLE LINK
          if (!item.children) {
            return (
              hasPermission(item.permission) && (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "menu-link active" : "menu-link"
                  }
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              )
            );
          }

          // DROPDOWN MENU
          return (
            <div key={index} className="menu-group">
              <div
                className="menu-link"
                onClick={() => toggleMenu(index)}
              >
                {item.icon}
                {!isCollapsed && (
                  <>
                    <span>{item.title}</span>
                    <FaChevronDown
                      className={`dropdown-icon ${
                        openMenus[index] ? "open" : ""
                      }`}
                    />
                  </>
                )}
              </div>

              {openMenus[index] && !isCollapsed && (
                <div className="submenu">
                  {item.children.map((sub, i) =>
                    hasPermission(sub.permission) ? (
                      <NavLink
                        key={i}
                        to={sub.path}
                        className={({ isActive }) =>
                          isActive
                            ? "submenu-link active"
                            : "submenu-link"
                        }
                      >
                        {sub.title}
                      </NavLink>
                    ) : null
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar_Admin;
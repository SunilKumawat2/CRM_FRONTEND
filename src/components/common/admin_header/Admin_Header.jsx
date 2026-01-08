import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import { Dropdown, Image, Badge } from "react-bootstrap";
import { Admin_Get_Notifications, Admin_Get_Notifications_Marked_All_Read } from "../../../api/admin/Admin"; // your global API function
import { useNavigate } from "react-router-dom";

const Header_Admin = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = localStorage.getItem("admin_token");

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAdminProfile(data.data);
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await Admin_Get_Notifications();
      console.log("sjkdhdfsf", res)
      const notifs = res.data.notifications;
      setNotifications(notifs);

      // Count unread notifications
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await Admin_Get_Notifications_Marked_All_Read();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };


  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchNotifications();

      // Optional: poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Handle opening notification dropdown
  const handleToggleNotifications = (isOpen) => {
    setShowNotifications(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <header className="admin-header d-flex justify-content-between align-items-center p-3 shadow-sm">
      <div className="header-left">
        <h2>
          <span style={{ color: "red" }}>C</span>RM
        </h2>
      </div>

      <div className="header-right d-flex align-items-center">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            marginRight: "15px",
            color: "var(--text-primary)",
          }}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        {/* Notifications */}
        <Dropdown
          align="end"
          show={showNotifications}
          onToggle={handleToggleNotifications}
        >
          <Dropdown.Toggle as="span" id="notification-dropdown" style={{ cursor: "pointer" }}>
            <FaBell className="header-icon me-3" style={{ fontSize: "20px" }} />
            {unreadCount > 0 && (
              <Badge pill bg="danger" style={{ position: "absolute", top: 0, right: 0 }}>
                {unreadCount}
              </Badge>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu style={{ minWidth: "300px" }}>
            <Dropdown.Header>Notifications</Dropdown.Header>

            {notifications.length === 0 && (
              <Dropdown.Item>No notifications</Dropdown.Item>
            )}

            {notifications.map((notif) => (
              <Dropdown.Item key={notif._id} className={notif.read ? "" : "fw-bold"}>
                {notif.message}
                <div style={{ fontSize: "0.7rem", color: "#888" }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </Dropdown.Item>
            ))}

            <Dropdown.Divider />
            <Dropdown.Item className="text-center text-primary"
              onClick={() => navigate("/admin-notifications")}
            >
              View All
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Profile dropdown */}
        <Dropdown show={showProfile} onToggle={() => setShowProfile(!showProfile)}>
          <Dropdown.Toggle variant="link" className="profile-dropdown-toggle">
            {adminProfile?.profileImage ? (
              <Image
                src={adminProfile.profileImage}
                roundedCircle
                width="40"
                height="40"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <FaUserCircle style={{ fontSize: "30px" }} />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu align="end">
            <div className="p-3 text-center">
              {adminProfile?.profileImage && (
                <Image
                  src={adminProfile.profileImage}
                  roundedCircle
                  width="80"
                  height="80"
                />
              )}
              <h6 className="mt-2">{adminProfile?.name || "Admin Name"}</h6>
              <p className="text-muted mb-0">{adminProfile?.email}</p>
            </div>
            <Dropdown.Divider />
            <Dropdown.Item href="/admin-profile">View Profile</Dropdown.Item>
            <Dropdown.Item href="/" onClick={() => localStorage.clear()}>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header_Admin;

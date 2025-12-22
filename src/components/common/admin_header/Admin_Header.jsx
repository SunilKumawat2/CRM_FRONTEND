import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import { Dropdown, Image } from "react-bootstrap";
import axios from "axios";

const Header_Admin = ({ theme, toggleTheme }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/admin-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminProfile(res.data.data);
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  return (
    <header className="admin-header d-flex justify-content-between align-items-center p-3 shadow-sm">
      <div className="header-left">
        <h2>
          <span style={{ color: "red" }}>C</span>RM
        </h2>
      </div>

      <div className="header-right d-flex align-items-center">
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

        <FaBell
          className="header-icon me-3"
          style={{ fontSize: "20px", cursor: "pointer" }}
        />

        <Dropdown show={showProfile} onToggle={() => setShowProfile(!showProfile)}>
      <Dropdown.Toggle
  variant="link"
  className="profile-dropdown-toggle"
>

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

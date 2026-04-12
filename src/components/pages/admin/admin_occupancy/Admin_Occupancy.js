import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Admin_Get_Occupancy } from "../../../../api/admin/Admin";

const Admin_Occupancy = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchOccupancy = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Occupancy();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
  }, []);

  return (
    <AdminLayout>
      <div className={`container mt-4 ${darkMode ? "dark" : ""}`}>

        {/* HEADER */}
        <div className="occupancy-header">
          <h1>Room Occupancy Dashboard</h1>

          <button
            className="toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : data ? (
          <>
            {/* CARDS */}
            <div className="occupancy-cards">

              <div className="occ-card total">
                <p>Total Rooms</p>
                <h2>{data.totalRooms}</h2>
              </div>

              <div className="occ-card occupied">
                <p>Occupied Rooms</p>
                <h2>{data.occupiedRooms}</h2>
              </div>

              <div className="occ-card rate">
                <p>Occupancy Rate</p>
                <h2>{data.occupancyRate}</h2>
              </div>

            </div>

            {/* PROGRESS BAR */}
            <div className="progress-section">
              <h3>Occupancy Level</h3>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: data.occupancyRate,
                  }}
                ></div>
              </div>

              <p className="progress-text">
                Current occupancy performance
              </p>
            </div>

            {/* STATUS MESSAGE */}
            <div className="status-box">
              {parseFloat(data.occupancyRate) > 80 ? (
                <p className="high">🔥 High Occupancy</p>
              ) : parseFloat(data.occupancyRate) > 50 ? (
                <p className="medium">⚡ متوسط Occupancy</p>
              ) : (
                <p className="low">📉 Low Occupancy</p>
              )}
            </div>
          </>
        ) : (
          <p className="no-data">No data found</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admin_Occupancy;
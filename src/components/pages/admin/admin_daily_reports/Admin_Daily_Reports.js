import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Admin_Get_daily_revenue } from "../../../../api/admin/Admin";

const Admin_Daily_Reports = () => {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
    // 🌙 Dark Mode State
    const [darkMode, setDarkMode] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_daily_revenue(date);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <AdminLayout>
      <div className={`container mt-4 ${darkMode ? "dark" : ""}`}>
        {/* HEADER */}
        <div className="report-header">
          <h1>Daily Revenue Report</h1>

          <div className="report-controls">
            <input
              type="date"
               className="form-control form-control-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button className="primary-button btn-sm small-add-button" onClick={fetchReport}>
              {loading ? "Loading..." : "Fetch"}
            </button>
            
          </div>
        </div>

        {/* CARDS */}
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : data ? (
          <div className="report-cards">
            {/* TOTAL BOOKINGS */}
            <div className="card">
              <p>Total Bookings</p>
              <h2>{data.totalBookings}</h2>
            </div>

            {/* TOTAL REVENUE */}
            <div className="card">
              <p>Total Revenue</p>
              <h2 className="revenue">₹ {data.totalRevenue}</h2>
            </div>

            {/* DATE */}
            <div className="card">
              <p>Date</p>
              <h2 className="date">{data.date}</h2>
            </div>
          </div>
        ) : (
          <p className="no-data">No data found</p>
        )}

        {/* PROGRESS SECTION */}
        {data && (
          <div className="progress-section container mt-4">
            <h3>Revenue Overview</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(data.totalRevenue / 100, 100)}%`,
                }}
              ></div>
            </div>

            <p className="progress-text">
              Visual indicator based on revenue performance
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admin_Daily_Reports;
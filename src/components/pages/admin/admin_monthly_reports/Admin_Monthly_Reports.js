import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Admin_Get_monthly_revenue } from "../../../../api/admin/Admin";
import { Table } from "react-bootstrap";

const Admin_Monthly_Reports = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_monthly_revenue(year);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const getMonthName = (month) => {
    return new Date(0, month - 1).toLocaleString("default", {
      month: "long",
    });
  };

  return (
    <AdminLayout>
      <div className={`container mt-4 ${darkMode ? "dark" : ""}`}>

        {/* HEADER */}
        <div className="report-header">
          <h1>Monthly Revenue Report ({year})</h1>

          <div className="report-controls">
            {/* YEAR INPUT */}
            <input
              type="number"
              value={year}
               className="form-control form-control-sm"
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter year"
            />

            <button onClick={fetchReport} className="primary-button btn-sm small-add-button">
              {loading ? "Loading..." : "Fetch"}
            </button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : data.length > 0 ? (
          <div className="table-container">
            <Table  striped
            bordered
            hover
            responsive
            className="table-smaller custom-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Bookings</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{getMonthName(item._id.month)}</td>
                    <td>{item.totalBookings}</td>
                    <td className="revenue">
                      ₹ {item.totalRevenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <p className="no-data">No data found</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admin_Monthly_Reports;
import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Card, Row, Col, Form, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaHotel,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  Admin_Get_Dashboard,
  Admin_Get_Dashboard_Summary,
  Admin_Get_Loan_Amount,
  Admin_Get_Open_Close_Account,
} from "../../../../api/admin/Admin"; // ✅ Adjust path if needed
import { RiHotelFill,RiHotelBedFill  } from "react-icons/ri";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Admin_Dashboard = () => {
  const currentYear = new Date().getFullYear();

  // ---------------- State ----------------
  const [summary, setSummary] = useState({});
  const [loanData, setLoanData] = useState([]);
  const [openCloseData, setOpenCloseData] = useState([]);
  const [year, setYear] = useState(currentYear);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [dashboard,setDashboard] = useState({});
  console.log("dashboard",dashboard)
  const formatNumber = (num) => (num ? num.toLocaleString("en-IN") : "0");

   // ✅ Fetch all roles
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await Admin_Get_Dashboard();
        setDashboard(res?.data?.stats)
      } catch (err) {
        console.error("Error fetching roles:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(()=>{
      fetchDashboard();
    },[]);

  // ---------------- Fetch Dashboard Data ----------------
  const fetchDashboardData = async (selectedYear) => {
    try {
      setLoading(true);

      console.log("Fetching Dashboard Data for:", selectedYear);

      const [summaryRes, loanRes, openCloseRes] = await Promise.all([
        Admin_Get_Dashboard_Summary(),
        Admin_Get_Loan_Amount(selectedYear),
        Admin_Get_Open_Close_Account(selectedYear),
      ]);

      console.log("🟩 Summary API Raw:", summaryRes?.data);
      console.log("🟩 Loan Amount API Raw:", loanRes?.data);
      console.log("🟩 Open/Close API Raw:", openCloseRes?.data);

      // ✅ Safely extract from response
      setSummary(summaryRes?.data?.data || summaryRes?.data || {});
      setLoanData(loanRes?.data?.data || loanRes?.data || []);
      setOpenCloseData(openCloseRes?.data?.data || openCloseRes?.data || []);
    } catch (error) {
      console.error("❌ Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Lifecycle ----------------
  useEffect(() => {
    fetchDashboardData(year);
  }, [year, filter]);

// ---------------- Chart Data Preparation ----------------
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Loan Amount Chart Data
const loanChartData = months.map((month) => {
  const item = loanData.find((d) => d.month === month);
  return {
    month,
    totalLoanAmount: item ? Number(item.totalLoanAmount) : 0,
  };
});

const barChartData = {
  labels: months,
  datasets: [
    {
      label: "Loan Amount (₹)",
      data: loanChartData.map((item) => item.totalLoanAmount),
      backgroundColor: "#28a745", // green
    },
  ],
};

// Open/Close Status Chart Data (Bar Chart)
const openCloseChartData = months.map((month) => {
  const item = openCloseData.find((d) => d.month === month);
  return {
    month,
    openCount: item ? Number(item.openCount) : 0,
    closedCount: item ? Number(item.closedCount) : 0,
  };
});

const openCloseBarData = {
  labels: months,
  datasets: [
    {
      label: "Open",
      data: openCloseChartData.map((item) => item.openCount),
      backgroundColor: "#28a745", // green for Open
    },
    {
      label: "Closed",
      data: openCloseChartData.map((item) => item.closedCount),
      backgroundColor: "#dc3545", // red for Closed
    },
  ],
};

// Installments Status Pie Chart
const pieChartData = {
  labels: ["Paid", "Due"],
  datasets: [
    {
      label: "Installments",
      data: summary
        ? [
            (summary.totalInstallments || 0) - (summary.dueInstallments || 0),
            summary.dueInstallments || 0,
          ]
        : [0, 0],
      backgroundColor: ["#28a745", "#dc3545"],
      hoverOffset: 10,
    },
  ],
};


  // ---------------- JSX ----------------
  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📊 Admin Dashboard</h2>

        {/* ---------------- Filters ---------------- */}
        <div className="d-flex gap-3">
          <Form.Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Close">Close</option>
          </Form.Select>

          <Form.Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: "130px" }}
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* ---------------- Summary Cards ---------------- */}
          <Row className="g-4 mb-4">
            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center bg-primary text-white">
                <Card.Body>
                  <RiHotelFill size={40} className="mb-2" />
                  <Card.Title>Total Rooms</Card.Title>
                  <h3>{formatNumber(dashboard?.totalRooms)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center bg-success text-white">
                <Card.Body>
                  <FaHotel size={40} className="mb-2" />
                  <Card.Title>Available Rooms</Card.Title>
                  <h3>{formatNumber(summary?.availableRooms)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center bg-warning text-white">
                <Card.Body>
                  <FaMoneyBillWave size={40} className="mb-2" />
                  <Card.Title>Daily Revenue</Card.Title>
                  <h3>{formatNumber(summary?.dailyRevenue)}</h3>
                </Card.Body>
              </Card>
            </Col>
           
            <Col md={3} sm={6}>
              <Card className="shadow-sm border-0 text-center bg-danger text-white">
                <Card.Body>
                  <RiHotelBedFill size={40} className="mb-2" />
                  <Card.Title>Occupied Rooms</Card.Title>
                  <h3>{formatNumber(summary?.occupiedRooms)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        {/* ---------------- Charts ---------------- */}
<Row className="g-4">
  {/* Loan Amount Chart */}
  <Col md={6}>
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title className="mb-3">
          Loan Amount Overview ({year})
        </Card.Title>
        <Bar data={barChartData} />
      </Card.Body>
    </Card>
  </Col>

  {/* Open/Close Chart */}
  <Col md={6}>
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title className="mb-3">
          Open/Close Overview ({year})
        </Card.Title>
        <Bar data={openCloseBarData} />
      </Card.Body>
    </Card>
  </Col>

 
</Row>


          
        </>
      )}
    </AdminLayout>
  );
};

export default Admin_Dashboard;

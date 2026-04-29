import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spinner,
  ListGroup,
  ProgressBar,
} from "react-bootstrap";
import {
  Admin_Get_Staff,
  Admin_Get_Staff_Summary,
} from "../../../../api/admin/Admin";
import AdminLayout from "../admin_layout/Admin_Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Admin_Staff_Attendance_Summary = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [summary, setSummary] = useState({});
  console.log("summary_summary", summary)
  const [type, setType] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  // ✅ ADD THIS
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // ✅ LOAD STAFF
  const loadStaff = async () => {
    const res = await Admin_Get_Staff(1, 50);
    const data = res.data.data || [];

    setStaffList(data);

    if (data.length > 0) {
      setSelectedStaff(data[0]);
    }
  };

  // ✅ LOAD SUMMARY
  const loadSummary = async () => {
    if (!selectedStaff) return;

    setLoading(true);

    const res = await Admin_Get_Staff_Summary({
      staffId: selectedStaff?._id,
      month,
      year,
      type,
    });

    setSummary(res.data.data || {});
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadSummary();
  }, [selectedStaff, type, month, year]);

  // ✅ FILTER SELECTED STAFF DATA
  const data = summary || {};

  const totalDays =
    (data.present || 0) +
    (data.absent || 0) +
    (data.halfDay || 0) +
    (data.shortLeave || 0);

  const percentage = totalDays
    ? ((data.present / totalDays) * 100).toFixed(1)
    : 0;

  const salary = data.salary || {};

  const downloadPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text("Staff Attendance Report", 14, 15);
  
    doc.setFontSize(10);
    doc.text(`Name: ${selectedStaff?.name}`, 14, 25);
    doc.text(`Month: ${month}`, 14, 30);
    doc.text(`Year: ${year}`, 14, 35);
    doc.text(`Type: ${type}`, 14, 40);
  
    const tableData = [
      ["Present", data.present || 0],
      ["Absent", data.absent || 0],
      ["Half Day", data.halfDay || 0],
      ["Short Leave", data.shortLeave || 0],
      ["Holiday", data.holiday || 0],
      ["Weekly Off", data.weeklyOff || 0],
      ["Worked Holiday", data.workedOnHoliday || 0],
      ["Extra Pay Days", data.extraPayDays || 0],
      ["Attendance %", percentage + "%"],
    ];
  
    autoTable(doc, {
      startY: 50,
      head: [["Type", "Count"]],
      body: tableData,
    });
  
    doc.save(`${selectedStaff?.name}_${type}_${month}_${year}.pdf`);
  };

  const downloadExcel = () => {
    const excelData = [
      {
        Name: selectedStaff?.name,
        Month: month,
        Year: year,
        Type: type,
        Present: data.present || 0,
        Absent: data.absent || 0,
        HalfDay: data.halfDay || 0,
        ShortLeave: data.shortLeave || 0,
        Holiday: data.holiday || 0,
        WeeklyOff: data.weeklyOff || 0,
        WorkedHoliday: data.workedOnHoliday || 0,
        ExtraPayDays: data.extraPayDays || 0,
        AttendancePercentage: percentage,
        Salary: data?.salary?.finalSalary || 0,
      },
    ];
  
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
  
    saveAs(
      blob,
      `${selectedStaff?.name}_${type}_${month}_${year}.xlsx`
    );
  };

  return (
    <AdminLayout>
      <Row>
        {/* ================= LEFT STAFF ================= */}
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>

              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">👥 Staff</h6>
                <span className="badge bg-light text-dark">
                  {staffList.length}
                </span>
              </div>

              {/* Staff List */}
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {staffList.map((s) => {
                  const isActive = selectedStaff?._id === s._id;

                  return (
                    <div
                      key={s._id}
                      onClick={() => setSelectedStaff(s)}
                      className={`p-2 mb-2 rounded-3 staff-item ${isActive ? "active" : ""}`}
                      style={{
                        cursor: "pointer",
                        transition: "0.2s",
                        background: isActive ? "#4e85d7" : "#fff",
                        color: isActive ? "#fff" : "#000",
                        border: "1px solid #eee"
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">

                        {/* Avatar */}
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            background: isActive ? "#fff" : "#4e85d7",
                            color: isActive ? "#4e85d7" : "#fff",
                            fontWeight: "bold",
                            fontSize: "14px"
                          }}
                        >
                          {s?.name?.charAt(0)?.toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">
                            {s?.name}
                          </div>
                          <div className={`small ${isActive ? "text-light" : "text-muted"}`}>
                            {s?.role}
                          </div>
                        </div>

                        {/* Status dot */}
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#28a745"
                          }}
                        ></div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* ================= RIGHT ================= */}
        <Col md={9}>
          <div className="d-flex justify-content-between mb-3">
            <h5>{selectedStaff?.name} Summary</h5>

            <div className="d-flex gap-3 align-items-center">

              <div>
                <label className="small text-muted">Month</label>
                <select
                  className="form-select shadow-sm rounded-3"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="small text-muted">Year</label>
                <select
                  className="form-select shadow-sm rounded-3"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex gap-2 mt-3">

                <button
                  className="btn btn-danger btn-sm"
                  onClick={downloadPDF}
                >
                  📄 PDF
                </button>

                <button
                  className="btn btn-success btn-sm"
                  onClick={downloadExcel}
                >
                  📊 Excel
                </button>

              </div>

            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* ================= ATTENDANCE ================= */}
              <Row className="mb-3">
                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Present</h6>
                      <h4 className="text-success">{data?.present || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Absent</h6>
                      <h4 className="text-danger">{data?.absent || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Half Day</h6>
                      <h4 className="text-warning">{data?.halfDay || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Short Leave</h6>
                      <h4 className="text-info">{data?.shortLeave || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Holiday</h6>
                      <h4 className="text-primary">{data?.holiday || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Weekly Off</h6>
                      <h4 className="text-dark">{data?.weeklyOff || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Worked Holiday</h6>
                      <h4 className="text-warning">{data?.workedOnHoliday || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm mt-2">
                    <Card.Body>
                      <h6>Extra Pay Days</h6>
                      <h4 className="text-success">{data?.extraPayDays || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ================= PROGRESS ================= */}
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <h6>Attendance %</h6>
                  <ProgressBar now={percentage} label={`${percentage}%`} />
                </Card.Body>
              </Card>

              {/* ================= SALARY ================= */}
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">💰 Salary Breakdown</h5>

                  <Row>
                    <Col md={6}>
                      <p>Per Day Salary: ₹{salary?.perDaySalary || 0}</p>
                      <p>Base Salary: ₹{salary?.baseSalary || 0}</p>
                      <p>Overtime: ₹{salary?.overtimePay || 0}</p>
                      <p>Bonus: ₹{salary?.bonus || 0}</p>
                    </Col>

                    <Col md={6}>
                      <p>PF ({salary?.pfPercent || 0}%): ₹{salary?.pfDeduction || 0}</p>
                      <p>ESI ({salary?.esiPercent || 0}%): ₹{salary?.esiDeduction || 0}</p>
                      <p>Absent Deduction: ₹{salary?.absentDeduction || 0}</p>

                      <h5 className="text-success">
                        Net Salary: ₹{salary?.finalSalary || 0}
                      </h5>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default Admin_Staff_Attendance_Summary;

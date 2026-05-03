import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Badge, Button, Form } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import {
  Admin_Get_Staff,
  Admin_Get_Payroll,
  Admin_Create_Payroll,
  Admin_Delete_Payroll,
  Admin_Get_Payment_History,
  Admin_Create_PaySalary, // ✅ ADD
} from "../../../../api/admin/Admin";
import hotel_logo from "../../../../assets/images/hotel_logo.jpg";

const Admin_Payroll = () => {
  const [payments, setPayments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // ✅ NEW STATE
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [note, setNote] = useState("");

  // ---------------- LOAD STAFF ----------------
  const loadStaff = async () => {
    const res = await Admin_Get_Staff(1, 50);
    const data = res.data.data || [];

    setStaffList(data);

    if (data.length > 0) {
      setSelectedStaff(data[0]);
    }
  };

  // ---------------- LOAD PAYROLL ----------------
  const loadPayroll = async () => {
    if (!selectedStaff) return;
    setLoading(true);
    try {
      const res = await Admin_Get_Payroll(selectedStaff._id, month, year);
      const list = res.data.data || [];
      const found = list.find((p) => p.month === month && p.year === year);
      setPayroll(found || null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ---------------- GENERATE ----------------
  const handleGenerate = async () => {
    try {
      await Admin_Create_Payroll({
        staffId: selectedStaff._id,
        month,
        year,
      });
      loadPayroll();
    } catch (err) {
      alert(err?.data?.message || "Error generating payroll");
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async () => {
    if (!payroll) return;
    if (!window.confirm("Delete this payroll?")) return;
    await Admin_Delete_Payroll(payroll._id);
    setPayroll(null);
  };

  // ✅ LOAD PAYMENT HISTORY
  const loadPayments = async () => {
    if (!payroll?._id) return;

    try {
      const res = await Admin_Get_Payment_History(payroll._id);
      setPayments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ PAY SALARY
  const handlePaySalary = async () => {
    try {
      await Admin_Create_PaySalary(payroll._id, {
        amount: Number(amount),
        method,
        note,
      });

      setAmount("");
      setNote("");

      loadPayroll();
      loadPayments();
    } catch (err) {
      alert(err?.data?.message || "Payment failed");
    }
  };

 const downloadPDF = () => {
  if (!payroll) return;

  const doc = new jsPDF();

  // ---------------- HEADER ----------------
  // 👉 Add Logo (put your logo in public folder)
  const logo = hotel_logo; // place in public/logo.png

  doc.addImage(logo, "JPG", 14, 10, 30, 30);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HOTEL GRAND PALACE", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Jaipur, Rajasthan | Phone: 9876543210", 105, 24, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SALARY SLIP", 105, 35, { align: "center" });

  // ---------------- EMPLOYEE DETAILS ----------------
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Employee Name: ${selectedStaff?.name}`, 14, 50);
  doc.text(`Role: ${selectedStaff?.role || "-"}`, 14, 56);
  doc.text(`Month: ${month}/${year}`, 150, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 56);

  // ---------------- SALARY TABLE ----------------
  autoTable(doc, {
    startY: 65,
    theme: "grid",
    head: [["Earnings", "Amount", "Deductions", "Amount"]],
    body: [
      [
        "Base Salary",
        payroll.salary?.baseSalary,
        "PF Deduction",
        payroll.salary?.pfDeduction,
      ],
      [
        "Overtime",
        payroll.salary?.overtimePay,
        "ESI Deduction",
        payroll.salary?.esiDeduction,
      ],
      ["", "", "", ""],
      [
        "Total Earnings",
        payroll.salary?.baseSalary + payroll.salary?.overtimePay,
        "Total Deduction",
        (payroll.salary?.pfDeduction || 0) +
          (payroll.salary?.esiDeduction || 0),
      ],
    ],
  });

  // ---------------- NET SALARY ----------------
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");

  doc.text(
    `Net Salary: Rs:${payroll.salary?.finalSalary}`,
    14,
    doc.lastAutoTable.finalY + 10
  );

  doc.text(
    `Paid: Rs: ${payroll.paidAmount} | Remaining: Rs: ${payroll.remainingAmount}`,
    14,
    doc.lastAutoTable.finalY + 18
  );

  // ---------------- PAYMENT HISTORY ----------------
  if (payments.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Date", "Amount", "Method"]],
      body: payments.map((p) => [
        new Date(p.paidAt).toLocaleDateString(),
        `Rs:${p.amount}`,
        p.method,
      ]),
    });
  }

  // ---------------- FOOTER ----------------
  doc.setFontSize(10);
  doc.text(
    "Authorized Signature __________________",
    140,
    280
  );

  doc.text(
    "This is a system generated salary slip.",
    14,
    280
  );

  // ---------------- SAVE ----------------
  doc.save(
    `${selectedStaff?.name}_salary_${month}_${year}.pdf`
  );
};

  const downloadExcel = () => {
    if (!payroll) return;

    const data = [
      {
        Name: selectedStaff?.name,
        Month: `${month}/${year}`,
        BaseSalary: payroll.salary?.baseSalary,
        Overtime: payroll.salary?.overtimePay,
        PF: payroll.salary?.pfDeduction,
        ESI: payroll.salary?.esiDeduction,
        Paid: payroll.paidAmount,
        Remaining: payroll.remainingAmount,
        FinalSalary: payroll.salary?.finalSalary,
      },
    ];

    // ✅ Add payment history also
    payments.forEach((p, i) => {
      data.push({
        Name: `Payment ${i + 1}`,
        Month: new Date(p.paidAt).toLocaleDateString(),
        BaseSalary: "",
        Overtime: "",
        PF: "",
        ESI: "",
        Paid: p.amount,
        Remaining: "",
        FinalSalary: p.method,
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `${selectedStaff?.name}_payroll_${month}_${year}.xlsx`);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadPayroll();
  }, [selectedStaff, month, year]);

  useEffect(() => {
    loadPayments();
  }, [payroll]);

  return (
    <AdminLayout>
      <Row>
        {/* ================= STAFF LIST ================= */}
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <h6 className="fw-bold">👥 Staff</h6>
                <Badge bg="light" text="dark">
                  {staffList.length}
                </Badge>
              </div>

              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {staffList.map((s) => {
                  const isActive = selectedStaff?._id === s._id;

                  return (
                    <div
                      key={s._id}
                      onClick={() => setSelectedStaff(s)}
                      className="p-2 mb-2 rounded-3"
                      style={{
                        cursor: "pointer",
                        background: isActive ? "#4e85d7" : "#fff",
                        color: isActive ? "#fff" : "#000",
                        border: "1px solid #eee",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            background: isActive ? "#fff" : "#4e85d7",
                            color: isActive ? "#4e85d7" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {s.name?.charAt(0)}
                        </div>

                        <div>
                          <div className="fw-semibold small">{s.name}</div>
                          <div className="small">{s.role}</div>
                        </div>
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
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Payroll Dashboard</h5>
              <small className="text-muted">
                {selectedStaff?.name} • {month}/{year}
              </small>
            </div>

            <div className="d-flex gap-2">
              {payroll && (
                <>
                  <Button variant="outline-success" onClick={downloadExcel}>
                    Excel
                  </Button>

                  <Button variant="outline-danger" onClick={downloadPDF}>
                    PDF
                  </Button>
                </>
              )}
              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>

              {!payroll && <Button onClick={handleGenerate}>Generate</Button>}
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : !payroll ? (
            <Card
              className="text-center p-5 shadow-sm"
              style={{
                background: "var(--card-bg)",
                color: "var(--card-text)",
              }}
            >
              <p>No payroll generated</p>
            </Card>
          ) : (
            <>
              {/* ================= SUMMARY CARDS ================= */}
              <Row className="mb-3">
                <Col md={3}>
                  <Card className="shadow-sm border-0 text-center p-3">
                    <small
                      style={{
                        color: "var(--card-text)",
                      }}
                    >
                      Base Salary
                    </small>
                    <h5
                      style={{
                        color: "var(--card-text)",
                      }}
                    >
                      ₹{payroll.salary?.baseSalary}
                    </h5>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="shadow-sm border-0 text-center p-3">
                    <small
                      style={{
                        color: "var(--card-text)",
                      }}
                    >
                      Overtime
                    </small>
                    <h5 className="text-info">
                      ₹{payroll.salary?.overtimePay}
                    </h5>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="shadow-sm border-0 text-center p-3">
                    <small
                      style={{
                        color: "var(--card-text)",
                      }}
                    >
                      Deductions
                    </small>
                    <h5 className="text-danger">
                      ₹
                      {(payroll.salary?.pfDeduction || 0) +
                        (payroll.salary?.esiDeduction || 0)}
                    </h5>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card
                    className="shadow-sm border-0 text-center p-3"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--card-text)",
                    }}
                  >
                    <small
                      style={{
                        color: "var(--card-text)",
                      }}
                    >
                      Net Salary
                    </small>
                    <h4 className="text-success">
                      ₹{payroll.salary?.finalSalary}
                    </h4>
                  </Card>
                </Col>
              </Row>

              {/* ================= DETAILS ================= */}
              <Row>
                {/* LEFT: BREAKDOWN */}
                <Col md={6}>
                  <Card
                    className="shadow-sm border-0"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--card-text)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <Card.Body>
                      <h6 className="mb-3">💰 Salary Breakdown</h6>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Base Salary</span>
                        <span>₹{payroll.salary?.baseSalary}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Overtime Pay</span>
                        <span>₹{payroll.salary?.overtimePay}</span>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between mb-2 text-danger">
                        <span>PF Deduction</span>
                        <span>- ₹{payroll.salary?.pfDeduction}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2 text-danger">
                        <span>ESI Deduction</span>
                        <span>- ₹{payroll.salary?.esiDeduction}</span>
                      </div>

                      <hr />
                      <div className="d-flex justify-content-between mb-2">
                        <span>Paid Salary</span>
                        <span> ₹{payroll?.paidAmount}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Remaining Salary</span>
                        <span> ₹{payroll?.remainingAmount}</span>
                      </div>
                      <hr />

                      <div className="d-flex justify-content-between fw-bold">
                        <span>Final Salary</span>
                        <span className="text-success">
                          ₹{payroll.salary?.finalSalary}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* RIGHT: ATTENDANCE */}
                <Col md={6}>
                  <Card
                    className="shadow-sm border-0"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--card-text)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <Card.Body>
                      <h6 className="mb-3">📊 Attendance Summary</h6>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Present</span>
                        <span>{payroll.summary?.present}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Half Day</span>
                        <span>{payroll.summary?.halfDay}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Leave</span>
                        <span>{payroll.summary?.leave}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2 text-danger">
                        <span>Absent</span>
                        <span>{payroll.summary?.absent}</span>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between">
                        <span>Worked on Holiday</span>
                        <span>{payroll.summary?.workedOnHoliday}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ================= PAYMENT SECTION (NEW) ================= */}
              <Card className="mt-3 shadow-sm border-0">
                <Card.Body
                  style={{
                    background: "var(--card-bg)",
                    color: "var(--card-text)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <h6 className="mb-3">💳 Pay Salary</h6>

                  <Row>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </Col>

                    <Col md={3}>
                      <Form.Select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank</option>
                      </Form.Select>
                    </Col>

                    <Col md={3}>
                      <Form.Control
                        placeholder="Note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </Col>

                    <Col md={2}>
                      <Button onClick={handlePaySalary}>Pay</Button>
                    </Col>
                  </Row>

                  <hr />

                  <h6>📜 Payment History</h6>

                  {payments.length === 0 ? (
                    <p className="text-muted">No payments yet</p>
                  ) : (
                    payments.map((p, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between border-bottom py-2"
                        style={{ borderColor: "var(--panel-border)" }}
                      >
                        <span>₹{p.amount}</span>
                        <span>{p.method}</span>
                        <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>

              {/* ================= ACTIONS ================= */}
              <div className="mt-3 d-flex justify-content-end gap-2">
                <Badge
                  bg={payroll.status === "paid" ? "success" : "warning"}
                  className="p-2"
                >
                  {payroll.status}
                </Badge>

                <Button variant="danger" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default Admin_Payroll;

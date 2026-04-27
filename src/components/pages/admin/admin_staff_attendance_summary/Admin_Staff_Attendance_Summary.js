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

const Admin_Staff_Attendance_Summary = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [summary, setSummary] = useState([]);
  const [type, setType] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

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
      month,
      year,
      type,
    });

    setSummary(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadSummary();
  }, [selectedStaff, type]);

  // ✅ FILTER SELECTED STAFF DATA
  const data = summary.find((s) => s.staff === selectedStaff?._id) || {};

  const totalDays =
    (data.present || 0) +
    (data.absent || 0) +
    (data.halfDay || 0) +
    (data.shortLeave || 0);

  const percentage = totalDays
    ? ((data.present / totalDays) * 100).toFixed(1)
    : 0;

  const salary = data.salary || {};
  return (
    <AdminLayout>
      <Row>
        {/* ================= LEFT STAFF ================= */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="fw-bold mb-3">👥 Staff</h6>

              <ListGroup>
                {staffList.map((s) => (
                  <ListGroup.Item
                    key={s._id}
                    action
                    onClick={() => setSelectedStaff(s)}
                    // className={`mb-1 rounded ${
                    //   selectedStaff?._id === s._id
                    //     ? "bg-primary text-white"
                    //     : ""
                    // }`}
                    className={`d-flex align-items-center py-2 rounded mb-1 staff-list-item ${selectedStaff?._id === s._id ? "selected" : ""
                      }`}
                  >
                    <div className="fw-semibold">
                      {s?.name} ({s?.role})
                    </div>
                    {/* <small>{s.role}</small> */}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* ================= RIGHT ================= */}
        <Col md={9}>
          <div className="d-flex justify-content-between mb-3">
            <h5>{selectedStaff?.name} Summary</h5>

            <div className="d-flex gap-3">
              <div>
                <button
                  className={`btn-sm small-add-button ${type === "monthly"
                      ? "primary-button"
                      : "btn-outline-primary"
                    }`}
                  onClick={() => setType("monthly")}
                >
                  Monthly
                </button>
              </div>
              <div>
                <button
                  className={`btn-sm small-add-button ${type === "yearly" ? "primary-button" : "btn-outline-primary"
                    }`}
                  onClick={() => setType("yearly")}
                >
                  Yearly
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
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h6>Present</h6>
                      <h4 className="text-success">{data.present || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h6>Absent</h6>
                      <h4 className="text-danger">{data.absent || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h6>Half Day</h6>
                      <h4 className="text-warning">{data.halfDay || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h6>Short Leave</h6>
                      <h4 className="text-info">{data.shortLeave || 0}</h4>
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

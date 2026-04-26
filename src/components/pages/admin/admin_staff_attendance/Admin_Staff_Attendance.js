import React, { useEffect, useState } from "react";
import {
  Admin_Get_Staff_Attendance,
  Admin_Create_Staff_Attendance,
  Admin_Update_Staff_Attendance,
  Admin_Get_Staff,
  Admin_Get_Shifts,
  Admin_Create_Shift,
} from "../../../../api/admin/Admin";
import { ToastContainer } from "react-toastify";
import {
  Button,
  Modal,
  Form,
  Table,
  Row,
  Col,
  ListGroup,
  Spinner,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import AdminLayout from "../admin_layout/Admin_Layout";
import { FaEye } from "react-icons/fa";

const Admin_Staff_Attendance = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceLimit] = useState(10); // You can change this or make dropdown
  const [attendanceTotalPages, setAttendanceTotalPages] = useState(1);
  const [isloading, setIsloading] = useState(false);
  const [summary, setSummary] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  console.log("shiftList_shiftList", shiftList);
  const [selectedShift, setSelectedShift] = useState("");
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  // ✅ TODAY DATE
  const today = new Date().toISOString().split("T")[0];

  const handleShiftChange = (e) => {
    setShiftForm({
      ...shiftForm,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------- LOAD STAFF ----------------
  const loadStaff = async () => {
    try {
      const res = await Admin_Get_Staff(1, 50);
      const staff = res.data.data || [];

      setStaffList(staff);

      if (staff.length > 0) {
        setSelectedStaff(staff[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadShifts = async () => {
    try {
      const res = await Admin_Get_Shifts(); // API bana lena
      setShiftList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  // ---------------- LOAD ATTENDANCE ----------------
  const loadAttendance = async (staffId) => {
    if (!staffId) return;

    setLoading(true);
    try {
      const res = await Admin_Get_Staff_Attendance(staffId, 1, 50);
      setAttendanceList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateShift = async () => {
    if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
      toast.error("All fields required");
      return;
    }

    try {
      await Admin_Create_Shift(shiftForm);

      toast.success("Shift Created Successfully");

      setShowShiftModal(false);
      setShiftForm({ name: "", startTime: "", endTime: "" });

      loadShifts(); // reload shifts
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  const formatWorkTime = (minutes) => {
    if (!minutes) return "-";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      loadAttendance(selectedStaff._id);
    }
  }, [selectedStaff]);

  const loadStaffList = async (p = page) => {
    setIsloading(true);
    try {
      const res = await Admin_Get_Staff(p, limit);
      const { data, totalPages } = res.data;

      setIsloading(false);
      setStaffList(data || []);
      setTotalPages(totalPages);
      setPage(p);

      if (data.length > 0) {
        setIsloading(false);
        setSelectedStaff(data[0]);
        loadAttendance(data[0]._id);
      }
    } catch (err) {
      setIsloading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    loadStaffList();
  }, []);

  // ---------------- FIND TODAY ATTENDANCE ----------------

  const todayAttendance = attendanceList.find(
    (a) => new Date(a.date).toISOString().split("T")[0] === today,
  );

  // ---------------- CHECK-IN ----------------
  const handleCheckIn = async () => {
    if (!selectedShift) {
      toast.error("Please select shift");
      return;
    }

    try {
      await Admin_Create_Staff_Attendance({
        staff: selectedStaff._id,
        shift: selectedShift,
        date: new Date().toISOString().split("T")[0],
        checkInTime: new Date().toISOString(),
        notes: notes,
      });

      toast.success("Check-In Successful");
      setShowCheckInModal(false);
      setNotes("");
      setSelectedShift("");

      loadAttendance(selectedStaff._id);
    } catch (err) {
      console.log("error_error", err);
      toast.error(err?.data?.message || "Error");
    }
  };

  // ---------------- CHECK-OUT ----------------
  const handleCheckout = async (id) => {
    try {
      await Admin_Update_Staff_Attendance(id, {
        checkOutTime: new Date().toISOString(),
      });

      toast.success("Check-Out Successful");
      loadAttendance(selectedStaff._id);
    } catch (err) {
      toast.error(err?.data?.message || "Error");
    }
  };

  // ---------------- FORMAT HELPERS ----------------
  const formatTime = (t) => (t ? new Date(t).toLocaleTimeString() : "-");

  const formatWork = (min) => {
    if (!min) return "-";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  // ---------------- STATUS BADGE ----------------
  const renderStatus = (a) => {
    if (a.isHoliday) return <Badge bg="info">Holiday</Badge>;
    if (a.isWeekend) return <Badge bg="secondary">Weekend</Badge>;
    if (a.status === "leave") return <Badge bg="warning">Leave</Badge>;
    if (a.status === "absent") return <Badge bg="danger">Absent</Badge>;
    return <Badge bg="success">Present</Badge>;
  };

  return (
    <AdminLayout>
      <Row>
        {/* ------------------- LEFT STAFF LIST ------------------- */}
        <Col md={3}>
          <div
            className="p-3 shadow-sm rounded staff-panel"
            style={{ minHeight: "100%" }}
          >
            <h6 className="mb-3 fw-bold border-bottom pb-2 staff-panel-title">
              Staff List
            </h6>
            <ToastContainer position="top-right" autoClose={2000} />
            {isloading ? (
              <div className="text-center my-4">
                <Spinner animation="border" /> <p>Loading...</p>
              </div>
            ) : (
              <ListGroup variant="flush" className="staff-list">
                {staffList.length == 0 && (
                  <p className="text-muted text-center small">No staff found</p>
                )}

                {staffList?.map((staff) => (
                  <ListGroup.Item
                    key={staff._id}
                    action
                    onClick={() => {
                      setSelectedStaff(staff);
                      setAttendancePage(1);
                      loadAttendance(staff._id, 1);
                    }}
                    className={`d-flex align-items-center py-2 rounded mb-1 staff-list-item ${
                      selectedStaff?._id === staff._id ? "selected" : ""
                    }`}
                  >
                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-2 staff-avatar">
                      {staff.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="fw-semibold staff-name">{staff.name}</div>
                      <small className="text-muted staff-email">
                        {staff.email || "Staff Member"}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between mt-2 staff-pagination">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => loadStaffList(page - 1)}
              >
                Previous
              </button>

              <span className="staff-page-info">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-sm"
                disabled={page === totalPages}
                onClick={() => loadStaffList(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </Col>

        <Col md={9}>
          {/* ---------------- RIGHT ATTENDANCE ---------------- */}
          <div style={{ flex: 1, padding: 20 }}>
            <div className="d-flex justify-content-between mb-3">
              <h5>{selectedStaff?.name} Attendance</h5>

              {/* 🔥 MAIN BUTTON LOGIC */}
              {!todayAttendance ? (
                <button
                  className="primary-button btn-sm small-add-button"
                  onClick={() => setShowCheckInModal(true)}
                >
                  Check-In
                </button>
              ) : !todayAttendance.checkOutTime ? (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    setSelectedAttendanceId(todayAttendance._id);
                    setShowCheckOutModal(true);
                  }}
                >
                  Check-Out
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" disabled>
                  Completed
                </button>
              )}

              <button
              className="primary-button btn-sm small-add-button"
                onClick={() => setShowShiftModal(true)}
              >
                + Add Shift
              </button>
            </div>

            {/* ---------------- TABLE ---------------- */}
            {loading ? (
              <Spinner />
            ) : (
              <Table
                striped
                bordered
                hover
                responsive
                className="table-smaller custom-table"
              >
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Work</th>
                    <th>Late</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceList.map((a) => (
                    <tr key={a._id}>
                      <td>{new Date(a.date).toLocaleDateString()}</td>

                      {/* SHIFT */}
                      <td>
                        {a.shift ? (
                          <>
                            <div>{a.shift.name}</div>
                            <small className="text-muted">
                              {a.shift.startTime} - {a.shift.endTime}
                            </small>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>{formatTime(a.checkInTime)}</td>
                      <td>{formatTime(a.checkOutTime)}</td>

                      <td>{formatWork(a.totalWorkMinutes)}</td>

                      {/* LATE */}
                      <td>
                        {a.isLate ? (
                          <Badge bg="danger">{a.lateMinutes || 0} min</Badge>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* STATUS */}
                      <td>
                        {a.isHalfDay ? (
                          <Badge bg="warning">Half Day</Badge>
                        ) : a.isShortLeave ? (
                          <Badge bg="info">Short Leave</Badge>
                        ) : a.status === "absent" ? (
                          <Badge bg="danger">Absent</Badge>
                        ) : a.status === "leave" ? (
                          <Badge bg="secondary">Leave</Badge>
                        ) : (
                          <Badge bg="success">Present</Badge>
                        )}
                      </td>

                      <td>{a.verifiedBy ? "✔ Verified" : "Pending"}</td>

                      <td>
                        {/* 👁 VIEW */}
                        {/* <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                         
                        >
                          👁
                        </Button> */}
                        <FaEye style={{cursor:"pointer"}}  onClick={() => {
                            setSelectedAttendance(a);
                            setShowViewModal(true);
                          }}/>
                        {/* CHECKOUT */}
                        {!a.checkOutTime && (
                          <button
                            className="primary-button btn-sm small-add-button"
                            onClick={() => handleCheckout(a._id)}
                          >
                            Check-Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>
      {/* <-------------- Check In --------------------> */}
      <Modal show={showCheckInModal} onHide={() => setShowCheckInModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Check-In</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-view-modal">
          <p>Select Shift and confirm Check-In</p>

          {/* SHIFT SELECT */}
          <Form.Group className="mb-2">
            <Form.Label>Select Shift</Form.Label>
            <Form.Select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="">Select Shift</option>
              {shiftList?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* NOTES */}
          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <button
           className="secondary-button btn-sm small-add-button"
            onClick={() => setShowCheckInModal(false)}
          >
            Cancel
          </button>

          <button className="primary-button btn-sm small-add-button" onClick={handleCheckIn}>
            Confirm Check-In
          </button>
        </Modal.Footer>
      </Modal>
      {/* <--------------- Check Out -------------------> */}
      <Modal
        show={showCheckOutModal}
        onHide={() => setShowCheckOutModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Check-Out</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to Check-Out?</p>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowCheckOutModal(false)}
          >
            Cancel
          </button>

          <button
          className="green-button btn-sm small-add-button"
            variant="success"
            onClick={async () => {
              await handleCheckout(selectedAttendanceId);
              setShowCheckOutModal(false);
            }}
          >
            Confirm Check-Out
          </button>
        </Modal.Footer>
      </Modal>
      {/* <--------- Create Shifts --------------> */}
      <Modal show={showShiftModal} onHide={() => setShowShiftModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Shift</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* NAME */}
            <Form.Group className="mb-2">
              <Form.Label>Shift Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={shiftForm.name}
                onChange={handleShiftChange}
                placeholder="Morning / Evening / Night"
              />
            </Form.Group>

            {/* START TIME */}
            <Form.Group className="mb-2">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={shiftForm.startTime}
                onChange={handleShiftChange}
              />
            </Form.Group>

            {/* END TIME */}
            <Form.Group>
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={shiftForm.endTime}
                onChange={handleShiftChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button className="secondary-button btn-sm small-add-button" onClick={() => setShowShiftModal(false)}>
            Cancel
          </button>

          <button className="primary-button btn-sm small-add-button" onClick={handleCreateShift}>
            Create Shift
          </button>
        </Modal.Footer>
      </Modal>
      {/* <---------- View Details of staff Attendance -------------> */}

      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Attendance Details</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-view-modal">
          {selectedAttendance && (
            <div className="container-fluid">
              {/* TOP SUMMARY */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded shadow-sm bg-light">
                <div>
                  <h6 className="mb-1 fw-bold">
                    {new Date(selectedAttendance.date).toLocaleDateString()}
                  </h6>
                  <small className="text-muted">
                    {selectedAttendance.shift?.name} (
                    {selectedAttendance.shift?.startTime} -{" "}
                    {selectedAttendance.shift?.endTime})
                  </small>
                </div>

                <div>
                  {selectedAttendance.isHalfDay ? (
                    <Badge bg="warning">Half Day</Badge>
                  ) : selectedAttendance.isShortLeave ? (
                    <Badge bg="info">Short Leave</Badge>
                  ) : selectedAttendance.status === "absent" ? (
                    <Badge bg="danger">Absent</Badge>
                  ) : (
                    <Badge bg="success">Present</Badge>
                  )}
                </div>
              </div>

              <Row>
                {/* LEFT CARD */}
                <Col md={6}>
                  <div className="p-3 border rounded shadow-sm mb-3">
                    <h6 className="fw-bold mb-3">Time Details</h6>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Check-In</span>
                      <strong>
                        {formatTime(selectedAttendance.checkInTime)}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Check-Out</span>
                      <strong>
                        {formatTime(selectedAttendance.checkOutTime)}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Work</span>
                      <strong>
                        {formatWork(selectedAttendance.totalWorkMinutes)}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Overtime</span>
                      <strong>
                        {formatWork(selectedAttendance.overtimeMinutes)}
                      </strong>
                    </div>
                  </div>
                </Col>

                {/* RIGHT CARD */}
                <Col md={6}>
                  <div className="p-3 border rounded shadow-sm mb-3">
                    <h6 className="fw-bold mb-3">Performance</h6>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Late</span>
                      <strong>
                        {selectedAttendance.isLate ? (
                          <Badge bg="danger">
                            {selectedAttendance.lateMinutes || 0} min
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Short Leave</span>
                      <strong>
                        {selectedAttendance.shortLeaveMinutes || 0} min
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Status</span>
                      <strong>{selectedAttendance.status}</strong>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* EXTRA DETAILS */}
              <div className="p-3 border rounded shadow-sm">
                <h6 className="fw-bold mb-3">Additional Info</h6>

                <Row>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Location:</strong>{" "}
                      {selectedAttendance.location || "-"}
                    </p>

                    <p className="mb-2">
                      <strong>Device:</strong>{" "}
                      {selectedAttendance.deviceInfo || "-"}
                    </p>
                  </Col>

                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Holiday:</strong>{" "}
                      {selectedAttendance.isHoliday ? "Yes" : "No"}
                    </p>

                    <p className="mb-2">
                      <strong>On Leave:</strong>{" "}
                      {selectedAttendance.isOnLeave ? "Yes" : "No"}
                    </p>
                  </Col>
                </Row>

                <div className="mt-2">
                  <strong>Notes:</strong>
                  <div className="mt-1 p-2 bg-light rounded">
                    {selectedAttendance.notes || "No notes"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <button className="secondary-button btn-sm small-add-button" onClick={() => setShowViewModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Staff_Attendance;

import React, { useEffect, useState } from "react";
import {
  Admin_Get_List,
  Admin_Get_Staff_Attendance,
  Admin_Create_Staff_Attendance,
  Admin_Update_Staff_Attendance,
  Admin_Delete_Staff_Attendance,
  Admin_Verify_Staff_Attendance,
  Admin_Get_Staff_Summary,
} from "../../../../api/admin/Admin";
import { FiPlus, FiEye, FiEdit, FiTrash } from "react-icons/fi";
import {
  Button,
  Modal,
  Form,
  Table,
  Row,
  Col,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";

const Admin_Staff_Attendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [formData, setFormData] = useState({
    staff: "",
    date: "",
    status: "",
    checkInTime: "",
    checkOutTime: "",
    notes: "",
  });
  const [summary, setSummary] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceLimit] = useState(10); // You can change this or make dropdown
  const [attendanceTotalPages, setAttendanceTotalPages] = useState(1);
  const [isloading,setIsloading] = useState(false)

  // -------------------- Load Staff List --------------------
  const loadStaffList = async (p = page) => {
    setIsloading(true)
    try {
      const res = await Admin_Get_List(p, limit);
      const { data, totalPages } = res.data;
      
      setIsloading(false)
      setStaffList(data || []);
      setTotalPages(totalPages);
      setPage(p);
      
      if (data.length > 0) {
        setIsloading(false)
        setSelectedStaff(data[0]);
        loadAttendance(data[0]._id);
      }
    } catch (err) {
      setIsloading(false)
      console.error(err);
    }
  };

  // -------------------- Load Attendance for Selected Staff --------------------
  const loadAttendance = async (staffId, page = 1) => {
    setIsloading(true)
    if (!staffId) return;
    try {
      const res = await Admin_Get_Staff_Attendance(staffId, page, attendanceLimit);
      setIsloading(false)
      setAttendanceList(res.data.data || []);
      setAttendanceTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setIsloading(false)
      console.error(err);
    }
  };


  useEffect(() => {
    loadStaffList();
  }, []);

  // Load attendance when staff is selected
  useEffect(() => {
    if (selectedStaff) {
      loadAttendance(selectedStaff._id);
    }
  }, [selectedStaff]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------- CREATE Attendance --------------------
  const handleCreateAttendance = async () => {
    try {
      const payload = {
        staff: selectedStaff._id,
        date: formData.date,
        status: formData.status,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        notes: formData.notes,
      };

      await Admin_Create_Staff_Attendance(payload);
      setShowCreateModal(false);
      loadAttendance(selectedStaff._id);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- UPDATE Attendance --------------------
  const handleUpdateAttendance = async () => {
    try {
      const payload = {
        status: formData.status,
        notes: formData.notes,
      };

      await Admin_Update_Staff_Attendance(selectedAttendanceId, payload);
      setShowUpdateModal(false);
      loadAttendance(selectedStaff._id);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- DELETE Attendance --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await Admin_Delete_Staff_Attendance(id);
      loadAttendance(selectedStaff._id);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- VERIFY Attendance --------------------
  const handleVerify = async () => {
    try {
      await Admin_Verify_Staff_Attendance(selectedAttendanceId);
      setShowVerifyModal(false);
      loadAttendance(selectedStaff._id);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- Summary --------------------
  const handleSummary = () => {
    // Set default filters to current month & year
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    setFilterMonth(currentMonth);
    setFilterYear(currentYear);

    setSummary([]); // Clear previous summary
    setShowSummaryModal(true);
  };

  const fetchSummary = async () => {
    if (!filterMonth || !filterYear) {
      alert("Please select month and year");
      return;
    }

    try {
      const res = await Admin_Get_Staff_Summary(filterMonth, filterYear);
      setSummary(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
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
              Staff Members
            </h6>
            {
              isloading ? (
  <div className="text-center my-4">
            <Spinner animation="border" /> <p>Loading...</p>
          </div>
              ):(
                 <ListGroup variant="flush" className="staff-list">
              {staffList.length === 0 && (
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
                  className={`d-flex align-items-center py-2 rounded mb-1 staff-list-item ${selectedStaff?._id === staff._id ? "selected" : ""
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
              )
            }
           

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

        {/* ------------------- RIGHT ATTENDANCE TABLE ------------------- */}
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Attendance {selectedStaff ? `: ${selectedStaff.name}` : ""}</h5>

            <div className="d-flex gap-2">
              <button
                variant="success"
                className="primary-button btn-sm small-add-button"
                disabled={!selectedStaff}
                onClick={() => {
                  setFormData({
                    staff: selectedStaff?._id || "",
                    date: "",
                    status: "",
                    checkInTime: "",
                    checkOutTime: "",
                    notes: "",
                  });
                  setShowCreateModal(true);
                }}
              >
                + Add Attendance
              </button>

              <button
                className="secondary-button btn-sm small-add-button"
                variant="primary"
                onClick={handleSummary}
              >
                Summary
              </button>
            </div>
          </div>

          {attendanceList.length > 0 ? (
            <>
              <Table striped bordered hover responsive className="table-smaller">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Notes</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceList &&
                    attendanceList?.map((a) => (
                      <tr key={a._id}>
                        <td>{a.date?.slice(0, 10)}</td>
                        <td>{a.status}</td>
                        <td>{a.checkInTime}</td>
                        <td>{a.checkOutTime}</td>
                        <td>{a.notes}</td>
                        <td>{a.verifiedBy ? "Yes" : "No"}</td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {/* View */}
                            <FiEye
                              className="text-success"
                              size={17}
                              role="button"
                              onClick={() => {
                                setSelectedAttendanceId(a._id);
                                setShowVerifyModal(true);
                              }}
                            />

                            {/* Edit */}
                            <FiEdit
                              className="text-warning"
                              size={17}
                              role="button"
                              onClick={() => {
                                setSelectedAttendanceId(a._id);
                                setFormData({
                                  status: a.status,
                                  notes: a.notes,
                                });
                                setShowUpdateModal(true);
                              }}
                            />

                            <FiTrash
                              className="text-danger"
                              size={17}
                              role="button"
                              onClick={() => handleDelete(a._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={attendancePage === 1}
                  onClick={() => {
                    setAttendancePage(attendancePage - 1);
                    loadAttendance(selectedStaff._id, attendancePage - 1);
                  }}
                >
                  Previous
                </button>

                <span style={{ fontSize: "13px" }}>
                  Page {attendancePage} of {attendanceTotalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={attendancePage === attendanceTotalPages}
                  onClick={() => {
                    setAttendancePage(attendancePage + 1);
                    loadAttendance(selectedStaff._id, attendancePage + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p
              className="text-muted"
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              No attendance data found for this staff member.
            </p>
          )}
        </Col>
      </Row>

      {/* -------------------- CREATE MODAL -------------------- */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">
            Create Attendance
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" onChange={handleChange}>
                <option value="">Select</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Check-In</Form.Label>
              <Form.Control
                type="datetime-local"
                name="checkInTime"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Check-Out</Form.Label>
              <Form.Control
                type="datetime-local"
                name="checkOutTime"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control name="notes" onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowCreateModal(false)}
          >
            Close
          </button>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={handleCreateAttendance}
          >
            Create
          </button>
        </Modal.Footer>
      </Modal>

      {/* -------------------- UPDATE MODAL -------------------- */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">
            Edit Attendance
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowUpdateModal(false)}
          >
            Close
          </button>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={handleUpdateAttendance}
          >
            Update
          </button>
        </Modal.Footer>
      </Modal>

      {/* -------------------- VERIFY MODAL -------------------- */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Attendance</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to verify this attendance?
        </Modal.Body>

        <Modal.Footer>
          <button className="secondary-button btn-sm small-add-button" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </button>
          <button className="primary-button btn-sm small-add-button" onClick={handleVerify}>
            Verify
          </button>
        </Modal.Footer>
      </Modal>

      {/* -------------------- SUMMARY MODAL -------------------- */}
      <Modal
        show={showSummaryModal}
        onHide={() => setShowSummaryModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Attendance Summary</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* -------- FILTER SECTION -------- */}
          <div className="mb-3 p-2 rounded summary-filter">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="summary-label">
                    Month
                  </Form.Label>

                  <Form.Select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="summary-select"
                  >
                    <option value="">Select Month</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("en-US", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="summary-label">
                    Year
                  </Form.Label>

                  <Form.Select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="summary-select"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 6 }, (_, i) => 2023 + i).map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end mt-2">
              <button
                className="primary-button btn-sm small-add-button"
                onClick={fetchSummary}
              >
                Filter Summary
              </button>
            </div>
          </div>

          {/* -------- SUMMARY TABLE -------- */}
          {summary.length === 0 ? (
            <p className="text-muted text-center summary-empty">
              No summary available. Please select month & year.
            </p>
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
                  <th>Staff</th>
                  <th>Email</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                  <th>Half Day</th>
                </tr>
              </thead>

              <tbody>
                {summary.map((s, i) => (
                  <tr key={i}>
                    <td>{s.staffName}</td>
                    <td>{s.email}</td>
                    <td>{s.totalPresent}</td>
                    <td>{s.totalAbsent}</td>
                    <td>{s.totalLeave}</td>
                    <td>{s.totalHalfDay}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowSummaryModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

    </AdminLayout>
  );
};

export default Admin_Staff_Attendance;

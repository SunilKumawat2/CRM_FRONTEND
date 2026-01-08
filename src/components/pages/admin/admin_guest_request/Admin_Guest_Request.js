import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaEdit, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

import {
  Admin_booking_guest_requests,
  Admin_create_guest_request,
  Admin_get_guest_request,
  Admin_update_guest_request,
} from "../../../../api/admin/Admin"; // your API functions
import { Admin_Get_Rooms, Admin_Get_Rooms_Booking_list } from "../../../../api/admin/Admin"; // room & booking APIs
import AdminLayout from "../admin_layout/Admin_Layout";
import { FiPlus } from "react-icons/fi";

const Admin_Guest_Feedback = () => {
  const [guestRequests, setGuestRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    bookingId: "",
    roomId: "",
    requestType: "",
    title: "",
    description: "",
    priority: "low",
    status: "pending",
    remarks: "",
  });
  const [showBookingRequestsModal, setShowBookingRequestsModal] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);



  const page = 1;
  const limit = 50;

  // Fetch guest requests
  const fetchGuestRequests = async () => {
    try {
      setLoading(true);
      const res = await Admin_get_guest_request(page, limit);
      setGuestRequests(res.data?.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Failed to fetch guest requests");
    }
  };

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Rooms(page, limit);
      setRooms(res.data?.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Fetch bookings
  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Rooms_Booking_list("", page, limit);
      setBookings(res.data?.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestRequests();
    fetchRooms();
    loadBookings();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Only send status and remarks for update
        const payload = {
          status: formData.status,
          remarks: formData.remarks || "",
        };
        await Admin_update_guest_request(editId, payload);
        toast.success("Guest request updated successfully");
      } else {
        // Create new guest request
        await Admin_create_guest_request(formData);
        toast.success("Guest request added successfully");
      }

      // Reset form and modal
      setShowAddModal(false);
      setFormData({
        bookingId: "",
        roomId: "",
        requestType: "",
        title: "",
        description: "",
        priority: "low",
        status: "pending",
        remarks: "",
      });
      setEditId(null);

      // Refresh the list
      fetchGuestRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save guest request");
    }
  };

  const handleViewBookingRequests = async (bookingId) => {
    try {
      setSelectedBookingId(bookingId);
      const res = await Admin_booking_guest_requests(bookingId);
      setBookingRequests(res.data.data || []);
      setShowBookingRequestsModal(true);
    } catch (err) {
      console.error("Failed to fetch booking requests:", err);
      toast.error("Failed to fetch guest requests for this booking");
    }
  };


  // Handle edit
  const handleEdit = (request) => {
    setEditId(request._id);
    setFormData({
      status: request.status || "pending",
      remarks: request.remarks || "",
    });
    setShowEditModal(true);
  };


  return (
    <AdminLayout>
      {/* ---------- Header + Add Button ---------- */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Guest Requests</h3>
        <button className="primary-button btn-sm small-add-button text-center" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Add Guest Requests
        </button>
      </div>

      <Table striped bordered hover responsive className="table-smaller">
        <thead>
          <tr>
            <th>#</th>
            <th>Booking Number</th>
            <th>Guest Name</th>
            <th>Room Number</th>
            <th>Room Type</th>
            <th>Request Type</th>
            <th>Title</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="text-center">
                Loading...
              </td>
            </tr>
          ) : guestRequests.length > 0 ? (
            guestRequests.map((req, idx) => (
              <tr key={req._id}>
                <td>{idx + 1}</td>
                <td>{req.booking?.bookingNumber}</td>
                <td>{req.booking?.guestName}</td>
                <td>{req.room?.roomNumber}</td>
                <td>{req.room?.roomType}</td>
                <td>{req.requestType}</td>
                <td>{req.title}</td>
                <td>{req.description}</td>
                <td>{req.priority}</td>
                <td>{req.status}</td>

                <td>
                  <FaEdit
                    size={18}
                    className="text-warning"
                    role="button"
                    onClick={() => handleEdit(req)}
                  />
                  <FaEye
                    size={18}
                    className="text-danger"
                    role="button"
                    onClick={() => handleViewBookingRequests(req.booking._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="text-center">
                No guest requests found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>


      {/* <------- Add Guest Request ---------> */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Add Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="small-form">
            {/* Booking */}
            <Form.Group className="mb-3">
              <Form.Label>Booking</Form.Label>
              <Form.Select
                name="bookingId"
                value={formData.bookingId}
                onChange={handleChange}
                required
              >
                <option value="">Select Booking</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bookingNumber} - {b.guestName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Room */}
            <Form.Group className="mb-3">
              <Form.Label>Room</Form.Label>
              <Form.Select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.roomNumber} - {r.roomType}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Request Type */}
            <Form.Group className="mb-3">
              <Form.Label>Request Type</Form.Label>
              <Form.Select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                required
              >
                <option value="">Select Request Type</option>
                <option value="room_service">Room Service</option>
                <option value="maintenance">Maintenance</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Priority */}
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="primary-button btn-sm small-add-button text-center">
              Add Request
            </button>
            <button
              type="button" className="secondary-button btn-sm small-add-button text-center"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* <--------- update Guest Request ----------> */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Update Request Status</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await Admin_update_guest_request(editId, {
                status: formData.status,
                remarks: formData.remarks || "",
              });
              toast.success("Guest request updated successfully");
              setShowEditModal(false);
              setFormData({ status: "pending", remarks: "" });
              setEditId(null);
              fetchGuestRequests();
            } catch (err) {
              console.error(err);
              toast.error("Failed to update guest request");
            }
          }}
        >
          <Modal.Body className="small-form">
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="primary-button btn-sm small-add-button text-center">
              Update Status
            </button>
            <button
              type="button" className="secondary-button btn-sm small-add-button text-center"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* <--------- View Guest Request Details---------> */}
      <Modal
        show={showBookingRequestsModal}
        onHide={() => setShowBookingRequestsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Guest Requests for Booking: {selectedBookingId}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-view-modal">
          {bookingRequests.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Room Number</th>
                  <th>Request Type</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {bookingRequests.map((req, idx) => (
                  <tr key={req._id}>
                    <td>{idx + 1}</td>
                    <td>{req.roomNumber}</td>
                    <td>{req.requestType}</td>
                    <td>{req.title}</td>
                    <td>{req.description}</td>
                    <td>{req.priority}</td>
                    <td>{req.status}</td>
                    <td>{req.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center">No guest requests found for this booking.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="secondary-button btn-sm"
            onClick={() => setShowBookingRequestsModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

    </AdminLayout>
  );
};

export default Admin_Guest_Feedback;

import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Table, Modal, Button, Form } from "react-bootstrap";
import { FaEye, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import {
    Admin_Get_feedbacks,
    Admin_create_feedback,
    Admin_Get_feedback_details,
    Admin_booking_guest_requests,
} from "../../../../api/admin/Admin";

import { Admin_Get_Rooms, Admin_Get_Rooms_Booking_list, Admin_Get_Rooms_Guest_list } from "../../../../api/admin/Admin";

const Admin_User_Feedback = () => {
    // ------------ STATES ------------
    const [feedbacks, setFeedbacks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dropdown data
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [guests, setGuests] = useState([]);

    // ------------ FORM DATA ------------
    const [formData, setFormData] = useState({
        bookingId: "",
        guestId: "",
        roomId: "",
        roomRating: "",
        roomComment: "",
        serviceRating: "",
        serviceComment: "",
        isAnonymous: false,
    });

    // ------------ FETCH LIST ------------
    const loadFeedbacks = async () => {
        try {
            const res = await Admin_Get_feedbacks();
            setFeedbacks(res.data.data);
        } catch (err) {
            toast.error("Failed to load feedbacks");
        }
    };

    // Fetch dropdown lists
    const fetchCommonData = async () => {
        try {
            const roomRes = await Admin_Get_Rooms(1, 200);
            const bookingRes = await Admin_Get_Rooms_Booking_list("", 1, 200);
            const guestRes = await Admin_Get_Rooms_Guest_list(1, 200);

            setRooms(roomRes.data.data);
            setBookings(bookingRes.data.data);
            setGuests(guestRes.data.data);
        } catch (err) {
            toast.error("Failed to load dropdown values");
        }
    };

    useEffect(() => {
        loadFeedbacks();
        fetchCommonData();
    }, []);

    // ------------ FORM SUBMIT ------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await Admin_create_feedback(formData);
            toast.success("Feedback submitted successfully!");
            setShowAddModal(false);
            loadFeedbacks();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error submitting feedback");
        }
        setLoading(false);
    };

    // ------------ VIEW FEEDBACK DETAILS ------------
    const handleView = async (id) => {
        try {
            const response = await Admin_Get_feedback_details(id); // your API call
            setSelectedFeedback(response.data?.data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching details:", error);
        }
    };

    return (
        <AdminLayout>


            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Guest Requests</h3>
                <button className="primary-button btn-sm small-add-button text-center"
                    onClick={() => setShowAddModal(true)}>
                    <FaPlus /> Add Feedback
                </button>
            </div>

            {/* -------- FEEDBACK TABLE -------- */}
            <Table striped bordered hover responsive className="table-smaller">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Booking</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Room Rating</th>
                        <th>Service Rating</th>
                        <th>Overall Rating</th> {/* 👈 Add this */}
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {feedbacks.length > 0 ? (
                        feedbacks.map((fb, i) => (
                            <tr key={fb._id}>
                                <td>{i + 1}</td>
                                <td>{fb.booking || "-"}</td>
                                <td>{fb.guest?.email || "Anonymous"}</td>
                                <td>{fb.room?.roomNumber || "-"}</td>
                                <td>⭐ {fb.roomRating}/5</td>
                                <td>⭐ {fb.serviceRating}/5</td>
                                <td>⭐ {fb.overallRating?.toFixed(1) || "-"}</td> {/* 👈 Now placed correctly */}
                                <td>
                                    <FaEye
                                        className="text-primary"
                                        style={{ cursor: "pointer", fontSize: "18px" }}
                                        onClick={() => handleView(fb._id)}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center text-muted">No feedbacks found</td>
                        </tr>
                    )}
                </tbody>


            </Table>

            {/* ========================= ADD FEEDBACK MODAL  ================ */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add Feedback</Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-3">

                        {/* Booking Select */}
                        <Form.Group className="mb-3">
                            <Form.Label>Booking</Form.Label>
                            <Form.Select
                                value={formData.bookingId}
                                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
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

                        {/* Guest Select */}
                        <Form.Group className="mb-3">
                            <Form.Label>Guest</Form.Label>
                            <Form.Select
                                value={formData.guestId}
                                onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                                required
                            >
                                <option value="">Select Guest</option>
                                {guests.map((g) => (
                                    <option key={g._id} value={g._id}>
                                        {g.guestName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Room Select */}
                        <Form.Group className="mb-3">
                            <Form.Label>Room</Form.Label>
                            <Form.Select
                                value={formData.roomId}
                                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
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

                        <hr />

                        {/* Ratings + Comments */}
                        <Form.Group className="mb-2">
                            <Form.Label>Room Rating (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max="5"
                                required
                                value={formData.roomRating}
                                onChange={(e) => setFormData({ ...formData, roomRating: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Room Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows="2"
                                value={formData.roomComment}
                                onChange={(e) => setFormData({ ...formData, roomComment: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Service Rating (1-5)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max="5"
                                required
                                value={formData.serviceRating}
                                onChange={(e) => setFormData({ ...formData, serviceRating: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Service Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows="2"
                                value={formData.serviceComment}
                                onChange={(e) => setFormData({ ...formData, serviceComment: e.target.value })}
                            />
                        </Form.Group>

                        {/* Anonymous */}
                        <Form.Check
                            type="checkbox"
                            label="Submit as Anonymous"
                            checked={formData.isAnonymous}
                            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? "Saving..." : "Submit Feedback"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* =================== VIEW FEEDBACK DETAILS MODAL ================= */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Guest Feedback Details</Modal.Title>
                </Modal.Header>

                <Modal.Body className="small-view-modal">
                    {selectedFeedback ? (
                        <div className="p-3">

                            {/*<---------- Booking Information-----------> */}
                            <div className="mb-4 p-3 rounded shadow-sm modal-section">
                                <h5 className="section-title">📌 Booking Information</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <span className="label">Booking ID</span>
                                        <strong>{selectedFeedback.booking}</strong>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <span className="label">Date & Time</span>
                                        <strong>{new Date(selectedFeedback.createdAt).toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Guest & Room */}
                            <div className="mb-4 p-3 rounded shadow-sm modal-section">
                                <h5 className="section-title">👤 Guest & Room Details</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <span className="label">Guest Email</span>
                                        <strong>{selectedFeedback?.guest?.email || "Anonymous"}</strong>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <span className="label">Room Info</span>
                                        <strong>
                                            #{selectedFeedback?.room?.roomNumber} ({selectedFeedback?.room?.roomType})
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/*<----------- Ratings ---------------> */}
                            <div className="mb-4 p-3 rounded shadow-sm modal-section">
                                <h5 className="section-title">⭐ Ratings Summary</h5>
                                <div className="row text-center">
                                    <div className="col-md-4">
                                        <div className="rating-box">Room: ⭐ {selectedFeedback.roomRating}/5</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="rating-box">Service: ⭐ {selectedFeedback.serviceRating}/5</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="rating-box">Overall: ⭐ {selectedFeedback.overallRating?.toFixed(1)}/5</div>
                                    </div>
                                </div>
                            </div>

                            {/*<------------- Comments -----------------> */}
                            <div className="mb-4 p-3 rounded shadow-sm modal-section">
                                <h5 className="section-title">📝 Comments</h5>
                                <p><strong>Room:</strong> {selectedFeedback.roomComment}</p>
                                <p><strong>Service:</strong> {selectedFeedback.serviceComment}</p>
                            </div>

                            {/*<-------------- Staff Ratings ------------> */}
                            {selectedFeedback.staffRatings?.length > 0 && (
                                <div className="p-3 rounded shadow-sm modal-section">
                                    <h5 className="section-title">👨‍💼 Staff Ratings</h5>
                                    {selectedFeedback.staffRatings.map((sr, index) => (
                                        <div key={index} className="border rounded p-3 mb-2 staff-box">
                                            <strong>Rating:</strong> ⭐ {sr.rating}/5 <br />
                                            <strong>Comment:</strong> {sr.comment}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    ) : (
                        <p className="text-center text-muted py-4">Loading details...</p>
                    )}
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between">
                    <div className="text-muted small">
                        <span>Created By:</span> <strong>{selectedFeedback?.createdByAdmin || "N/A"}</strong>
                    </div>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>


        </AdminLayout>
    );
};

export default Admin_User_Feedback;

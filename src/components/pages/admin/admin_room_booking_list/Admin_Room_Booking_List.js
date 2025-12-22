import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { FiPlus, FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
    Admin_Get_Rooms_Booking_list,
    Admin_Get_Rooms_Booking_Details,
    Admin_Post_Room_Booking,
    Admin_Room_Booking_Update,
    Admin_Room_Booking_Delete,
    Admin_Get_Rooms,
    Admin_Room_Booking_CheckIn,
    Admin_Room_Booking_Checkout,
    Admin_Room_Cancel_Booking,
    Admin_Get_Bookings_By_Range,
} from "../../../../api/admin/Admin";
import {
    TbPlayerTrackNextFilled,
    TbPlayerTrackPrevFilled,
} from "react-icons/tb";

const Admin_Room_Booking_List = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [roomList, setRoomList] = useState([]);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [loading, setLoading] = useState(false)
    // Form state for Add/Edit
    const [formData, setFormData] = useState({
        guestName: "",
        guestContact: "",
        guestEmail: "",
        rooms: [
            { room: "", rate: "", guests: "" }
        ],
        checkIn: "",
        checkOut: "",
        source: "manual",
        paymentStatus: "unpaid",
        totalAmount: "",
        depositAmount: "",
        notes: ""
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const totalPages = Math.ceil(total / limit);

    // Handle input changes
    const updateField = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //<--------- Fetch Room Bookings ------------>
    const loadBookings = async () => {
        setLoading(true)
        try {
            const res = await Admin_Get_Rooms_Booking_list("", page, limit);
            setBookings(res.data.data);
            setTotal(res.data.total);
            setLoading(false)
        } catch (err) {
            setLoading(false)
            console.error("Error fetching bookings:", err);
        }
    };


    // <------------- fetch the Room List ------------>
    const loadRooms = async () => {
        try {
            const res = await Admin_Get_Rooms();
            setRoomList(res.data.data);
        } catch (err) {
            console.error("Room Load Error:", err);
        }
    };

    //<-------- Open View the room booking Modal ------------->
    const openViewModal = async (id) => {
        try {
            const res = await Admin_Get_Rooms_Booking_Details(id);
            setSelectedBooking(res.data.data);
            setShowViewModal(true);
        } catch (err) {
            console.error("View Booking Error:", err);
        }
    };

    //<---------- Open Edit Room Booking Modal --------------->
    const openEditModal = async (id) => {
        try {
            const res = await Admin_Get_Rooms_Booking_Details(id);
            const booking_result = res.data.data;
            const firstRoom = booking_result.rooms && booking_result.rooms.length > 0 ? booking_result.rooms[0] : null;
            setFormData({
                guestName: booking_result.guestName || "",
                guestContact: booking_result.guestContact || "",
                guestEmail: booking_result.guestEmail || "",
                rooms: [
                    {
                        room: firstRoom?.room?._id || "",
                        rate: firstRoom?.rate || "",
                        guests: firstRoom?.guests || ""
                    }
                ],
                checkIn: booking_result.checkIn ? booking_result.checkIn.slice(0, 10) : "",
                checkOut: booking_result.checkOut ? booking_result.checkOut.slice(0, 10) : "",
                source: booking_result.source || "manual",
                paymentStatus: booking_result.paymentStatus || "unpaid",
                totalAmount: booking_result.totalAmount || "",
                depositAmount: booking_result.depositAmount || "",
                notes: booking_result.notes || ""
            });
            setSelectedBooking(booking_result);
            setShowEditModal(true);
        } catch (err) {
            console.error("Edit Load Error:", err);
        }
    };

    // <-------- Add Booking ------------->
    const handleAddBooking = async () => {
        try {
            await Admin_Post_Room_Booking(formData);
            setShowAddModal(false);
            loadBookings();
        } catch (err) {
            console.error("Add Booking Error:", err);
        }
    };

    //<-------- Save Edit Room Booking ------------------>
    const handleEditBooking = async () => {
        try {
            await Admin_Room_Booking_Update(selectedBooking._id, formData);
            setShowEditModal(false);
            loadBookings();
        } catch (err) {
            console.error("Update Error:", err);
        }
    };

    //<--------  Delete Room Booking -------------------->
    const handleDeleteBooking = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;
        try {
            await Admin_Room_Booking_Delete(id);
            loadBookings();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    // <------------ CheckIn Room Booking ---------------->
    const handleCheckIn = async (id) => {
        try {
            await Admin_Room_Booking_CheckIn(id);
            toast.success("Guest Checked-In Successfully!");
            loadBookings();
        } catch (err) {
            toast.error(err?.data?.message || "Check-In Failed");
        }
    };

    // <----------- CheckOut Room Booking ----------------->
    const handleCheckOut = async (id) => {
        try {
            await Admin_Room_Booking_Checkout(id);
            toast.success("Guest Checked-Out Successfully!");
            loadBookings();
        } catch (err) {
            toast.error(err?.data?.message || "Check-Out Failed");
        }
    };

    // <--------------- Cancel the Room Booking -------------->
    const handleCancelBooking = async (id) => {
        try {
            await Admin_Room_Cancel_Booking(id);
            toast.success("✅ Booking Cancelled Successfully!");
            loadBookings();
        } catch (err) {
            toast.error(err?.data?.message || "❌ Failed to cancel booking");
        }
    };

    // <------------ get the room booking and checkIn and CheckOut by the date range ---------->
    const handleFilterByRange = async () => {
        if (!rangeStart || !rangeEnd) {
            toast.error("Please select both start and end date");
            return;
        }
        try {
            const res = await Admin_Get_Bookings_By_Range(rangeStart, rangeEnd);
            setBookings(res.data.data);
            toast.success("✅ Bookings Filtered!");
        } catch (err) {
            toast.error("❌ Failed to filter bookings");
        }
    };

    // <------------ Render the Booking List ------------->
    useEffect(() => {
        loadBookings();
    }, [page]);

    // <--------- Render Room List ------------------>
    useEffect(() => {
        loadRooms();
    }, []);

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Room Booking List</h5>
                <button className="primary-button btn-sm small-add-button" onClick={() => setShowAddModal(true)}>
                    <FiPlus size={13} /> Add Booking
                </button>

            </div>
            <ToastContainer position="top-right" autoClose={2000} />
            <div className="d-flex gap-3 mb-3 filter-bar-small">
                <div>
                    <label className="form-label fw-bold">Start Date</label>
                    <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.target.value)}
                    />
                </div>

                <div>
                    <label className="form-label fw-bold">End Date</label>
                    <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.target.value)}
                    />
                </div>

                <div className="align-self-end">
                    <button className="primary-button " onClick={handleFilterByRange}>
                        Filter
                    </button>
                </div>

                <div className="align-self-end">
                    <button className="secondary-button" onClick={loadBookings}>
                        Reset
                    </button>
                </div>

            </div>

            {
                loading ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" /> <p>Loading...</p>
                    </div>
                ) : (
                    <Table striped bordered hover responsive className="table-smaller">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Booking No</th>
                                <th>Guest Name</th>
                                <th>Contact</th>
                                <th>Room No</th>
                                <th>Room Type</th>
                                <th>Check-In</th>
                                <th>Check-Out</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Deposit</th>
                                <th>Actions</th>
                                <th>Check-In/Out</th>
                            </tr>
                        </thead>


                        <tbody>
                            {bookings?.map((booking_result, i) => {
                                const room = booking_result.rooms?.[0] || {};
                                const roomInfo = room.room || {};

                                return (
                                    <tr key={booking_result._id}>
                                        <td>{i + 1}</td>
                                        <td>{booking_result.bookingNumber}</td>
                                        <td>{booking_result.guestName}</td>
                                        <td>{booking_result.guestContact}</td>
                                        <td>{roomInfo.roomNumber || "—"}</td>
                                        <td>{roomInfo.roomType || "—"}</td>
                                        <td>{booking_result.checkIn?.slice(0, 10)}</td>
                                        <td>{booking_result.checkOut?.slice(0, 10)}</td>
                                        {/* Booking Status */}
                                        <td>
                                            <span
                                                className={`badge ${booking_result.status === "confirmed"
                                                    ? "bg-primary"
                                                    : booking_result.status === "checked_in"
                                                        ? "bg-success"
                                                        : booking_result.status === "checked_out"
                                                            ? "bg-warning text-black"
                                                            : booking_result.status === "cancelled"
                                                                ? "bg-danger"
                                                                : "bg-secondary"
                                                    }`}
                                            >
                                                {booking_result.status.replace("_", " ")}
                                            </span>
                                        </td>

                                        {/* Payment */}
                                        <td className="text-capitalize">{booking_result.paymentStatus}</td>

                                        {/* Price */}
                                        <td>₹{booking_result.totalAmount}</td>
                                        <td>₹{booking_result.depositAmount}</td>

                                        {/* Actions */}
                                        <td>
                                            <div className="d-flex align-items-center gap-2">

                                                {/* View */}
                                                <FiEye
                                                    className="text-success"
                                                    size={17}
                                                    role="button"
                                                    onClick={() => openViewModal(booking_result._id)}
                                                />

                                                {/* Edit */}
                                                <FiEdit
                                                    className="text-warning"
                                                    size={17}
                                                    role="button"
                                                    onClick={() => openEditModal(booking_result._id)}
                                                />

                                                <FiTrash
                                                    className="text-danger"
                                                    size={17}
                                                    role="button"
                                                    onClick={() => handleDeleteBooking(booking_result._id)}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ whiteSpace: "nowrap" }}>
                                            {/* ✅ CHECK-IN */}
                                            {booking_result.status === "confirmed" && (
                                                <button className="action-btn btn-checkin" onClick={() => handleCheckIn(booking_result._id)}>
                                                    ✅ Check-In
                                                </button>
                                            )}

                                            {/* ✅ CHECK-OUT */}
                                            {booking_result.status === "checked_in" && (
                                                <button className="action-btn btn-checkout" onClick={() => handleCheckOut(booking_result._id)}>
                                                    📤 Check-Out
                                                </button>
                                            )}

                                            {/* ✅ CANCEL BOOKING */}
                                            {(booking_result.status === "confirmed" || booking_result.status === "pending") && (
                                                <button className="action-btn btn-cancel" onClick={() => handleCancelBooking(booking_result._id)}>
                                                    ❌ Cancel
                                                </button>
                                            )}

                                            {/* ✅ Checked-Out Status */}
                                            {booking_result.status === "checked_out" && (
                                                <button className="action-btn btn-disabled" disabled>
                                                    ✔ Checked-Out
                                                </button>
                                            )}

                                            {/* ✅ Cancelled Status */}
                                            {booking_result.status === "cancelled" && (
                                                <button className="action-btn btn-cancelled" disabled>
                                                    ✖ Cancelled
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )
            }


            <div className="pagination-container mt-4">
                <p className="mb-0 text-muted small">
                    Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                    <strong>{Math.min(page * limit, total)}</strong> of{" "}
                    <strong>{total}</strong> bookings
                </p>


                <div className="pagination-container d-flex justify-content-center mt-3">
                    {/* Prev Button */}
                    <button
                        className="pagination-btn"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <TbPlayerTrackPrevFilled size={20} />
                    </button>

                    {/* Page Indicator */}
                    <span className="pagination-info">
                        Page {page} / {totalPages || 1}
                    </span>

                    {/* Next Button */}
                    <button
                        className="pagination-btn"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        <TbPlayerTrackNextFilled size={20} />
                    </button>
                </div>
            </div>

            {/* =================== ADD BOOKING MODAL ===================== */}
            <Modal show={showAddModal} size="lg" onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="small-form-title" style={{ color: "#f87951" }}>Add Booking</Modal.Title>
                </Modal.Header>

                <Modal.Body className="small-form">
                    <Form>

                        {/* Row 1: Guest Name + Contact */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Guest Name</Form.Label>
                                    <Form.Control
                                        name="guestName"
                                        value={formData.guestName}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        name="guestContact"
                                        value={formData.guestContact}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 2: Email + Room ID */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        name="guestEmail"
                                        value={formData.guestEmail}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Select Room</Form.Label>
                                    <Form.Select
                                        value={formData.rooms[0].room}
                                        onChange={(e) => {
                                            const roomId = e.target.value;

                                            const selectedRoom = roomList.find((r) => r._id === roomId);

                                            const updatedRooms = [...formData.rooms];
                                            updatedRooms[0].room = roomId;
                                            updatedRooms[0].rate = selectedRoom?.baseRate || "";

                                            setFormData({ ...formData, rooms: updatedRooms });
                                        }}
                                    >
                                        <option value="">-- Select Room --</option>
                                        {roomList.map((room) => (
                                            <option key={room._id} value={room._id}>
                                                {room.roomNumber} - {room.roomType}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 3: Rate + Guests */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Rate</Form.Label>
                                    <Form.Control
                                        name="rate"
                                        value={formData.rooms[0].rate}
                                        onChange={(e) => {
                                            const updatedRooms = [...formData.rooms];
                                            updatedRooms[0].rate = e.target.value;
                                            setFormData({ ...formData, rooms: updatedRooms });
                                        }}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>No. of Guests</Form.Label>
                                    <Form.Control
                                        name="guests"
                                        value={formData.rooms[0].guests}
                                        onChange={(e) => {
                                            const updatedRooms = [...formData.rooms];
                                            updatedRooms[0].guests = e.target.value;
                                            setFormData({ ...formData, rooms: updatedRooms });
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 4: Check-In + Check-Out */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Check-In</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkIn"
                                        value={formData.checkIn}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Check-Out</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkOut"
                                        value={formData.checkOut}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 5: Source + Payment Status */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Source</Form.Label>
                                    <Form.Select
                                        name="source"
                                        value={formData.source}
                                        onChange={updateField}
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="online">Online</option>
                                        <option value="channel_manager">Channel Manager</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Payment Status</Form.Label>
                                    <Form.Select
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={updateField}
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 6: Total Amount + Deposit Amount */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Total Amount</Form.Label>
                                    <Form.Control
                                        name="totalAmount"
                                        value={formData.totalAmount}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Deposit Amount</Form.Label>
                                    <Form.Control
                                        name="depositAmount"
                                        value={formData.depositAmount}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Full Row: Notes */}
                        <Form.Group className="mb-2">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                value={formData.notes}
                                onChange={updateField}
                            />
                        </Form.Group>

                    </Form>

                </Modal.Body>

                <Modal.Footer>
                    <button className="secondary-button btn-sm small-add-button" onClick={() => setShowAddModal(false)}>
                        Close
                    </button>

                    <button className="primary-button btn-sm small-add-button" onClick={handleAddBooking}>
                        Save Booking
                    </button>
                </Modal.Footer>
            </Modal>


            {/* ======================== VIEW MODAL =========================== */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
                <Modal.Header closeButton className="primary-background-color text-white">
                    <Modal.Title>Booking Details</Modal.Title>
                </Modal.Header>

                <Modal.Body className="small-view-modal">
                    {selectedBooking && (
                        <div className="p-3">

                            {/* ===================== BOOKING SUMMARY ===================== */}
                            <h5 className="primary-color mb-3">Booking Summary</h5>
                            <div className="row mb-4">

                                <div className="col-6 mb-3">
                                    <strong>Booking Number:</strong>
                                    <div>{selectedBooking.bookingNumber}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Status:</strong>
                                    <div className="text-capitalize">{selectedBooking.status}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Source:</strong>
                                    <div className="text-capitalize">{selectedBooking.source}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Payment Status:</strong>
                                    <div className="text-capitalize">{selectedBooking.paymentStatus}</div>
                                </div>

                            </div>

                            {/* ===================== GUEST INFORMATION ===================== */}
                            <h5 className="primary-color mb-3">Guest Information</h5>
                            <div className="row mb-4">

                                <div className="col-6 mb-3">
                                    <strong>Guest Name:</strong>
                                    <div>{selectedBooking.guestName}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Contact:</strong>
                                    <div>{selectedBooking.guestContact}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Email:</strong>
                                    <div>{selectedBooking.guestEmail}</div>
                                </div>

                            </div>

                            {/* ===================== ROOM DETAILS ===================== */}
                            <h5 className="primary-color mb-3">Room Details</h5>

                            {selectedBooking.rooms?.map((r, i) => (
                                <div key={i} className="border rounded p-3 mb-3">
                                    <div className="row">

                                        <div className="col-4 mb-2">
                                            <strong>Room Number:</strong>
                                            <div>{r.room?.roomNumber}</div>
                                        </div>

                                        <div className="col-4 mb-2">
                                            <strong>Room Type:</strong>
                                            <div>{r.room?.roomType}</div>
                                        </div>

                                        <div className="col-4 mb-2">
                                            <strong>Rate:</strong>
                                            <div>₹{r.rate}</div>
                                        </div>

                                        <div className="col-4 mb-2">
                                            <strong>Guests:</strong>
                                            <div>{r.guests}</div>
                                        </div>

                                        <div className="col-8 mb-2">
                                            <strong>Extra Info:</strong>
                                            <div>{r.extraInfo || "—"}</div>
                                        </div>

                                    </div>
                                </div>
                            ))}

                            {/* ===================== BOOKING DATES ===================== */}
                            <h5 className="primary-color mb-3">Booking Dates</h5>
                            <div className="row mb-4">

                                <div className="col-6 mb-3">
                                    <strong>Check-In:</strong>
                                    <div>{selectedBooking.checkIn?.slice(0, 10)}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Check-Out:</strong>
                                    <div>{selectedBooking.checkOut?.slice(0, 10)}</div>
                                </div>

                            </div>

                            {/* ===================== PAYMENT SUMMARY ===================== */}
                            <h5 className="primary-color mb-3">Payment Summary</h5>
                            <div className="row mb-4">

                                <div className="col-6 mb-3">
                                    <strong>Total Amount:</strong>
                                    <div className="fw-bold text-success">₹{selectedBooking.totalAmount}</div>
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Deposit Amount:</strong>
                                    <div className="fw-bold text-primary">₹{selectedBooking.depositAmount}</div>
                                </div>

                            </div>

                            {/* ===================== NOTES ===================== */}
                            <h5 className="primary-color mb-2">Notes</h5>
                            <p>{selectedBooking.notes || "No notes added"}</p>

                            {/* ===================== CREATED INFO ===================== */}
                            <h6 className="text-muted mt-4">Created By: {selectedBooking.createdBy?.name}</h6>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                Created At: {selectedBooking.createdAt?.slice(0, 10)}
                            </div>

                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="small-view-modal-footer">
                    <button className="secondary-button btn-sm small-add-button" onClick={() => setShowViewModal(false)}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>



            {/* ========================= EDIT MODAL ======================== */}
            <Modal show={showEditModal} size="lg" onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="small-form-title" style={{ color: "#f87951" }}>Edit Booking</Modal.Title>
                </Modal.Header>

                <Modal.Body className="small-form">
                    <Form>

                        {/* Row 1: Guest Name + Contact */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Guest Name</Form.Label>
                                    <Form.Control
                                        name="guestName"
                                        value={formData.guestName}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        name="guestContact"
                                        value={formData.guestContact}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 2: Email + Room Dropdown */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        name="guestEmail"
                                        value={formData.guestEmail}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Select Room</Form.Label>
                                    <Form.Select
                                        value={formData.rooms[0].room}
                                        onChange={(e) => {
                                            const roomId = e.target.value;
                                            const selectedRoom = roomList.find((r) => r._id === roomId);
                                            const updatedRooms = [...formData.rooms];
                                            updatedRooms[0].room = roomId;
                                            updatedRooms[0].rate = selectedRoom?.baseRate || "";

                                            setFormData({ ...formData, rooms: updatedRooms });
                                        }}
                                    >
                                        <option value="">-- Select Room --</option>
                                        {roomList.map((room) => (
                                            <option key={room._id} value={room._id}>
                                                {room.roomNumber} - {room.roomType}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 3: Rate + Guests */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Rate (Auto)</Form.Label>
                                    <Form.Control
                                        value={formData.rooms[0].rate}
                                        readOnly
                                        style={{ background: "#f4f4f4" }}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>No. of Guests</Form.Label>
                                    <Form.Control
                                        name="guests"
                                        value={formData.rooms[0].guests}
                                        onChange={(e) => {
                                            const updatedRooms = [...formData.rooms];
                                            updatedRooms[0].guests = e.target.value;
                                            setFormData({ ...formData, rooms: updatedRooms });
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 4: Checkin + Checkout */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Check-In</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkIn"
                                        value={formData.checkIn}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Check-Out</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkOut"
                                        value={formData.checkOut}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 5: Source + Payment Status */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Source</Form.Label>
                                    <Form.Select
                                        name="source"
                                        value={formData.source}
                                        onChange={updateField}
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="online">Online</option>
                                        <option value="channel_manager">Channel Manager</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Payment Status</Form.Label>
                                    <Form.Select
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={updateField}
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Row 6: Total Amount + Deposit */}
                        <div className="row">
                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Total Amount</Form.Label>
                                    <Form.Control
                                        name="totalAmount"
                                        value={formData.totalAmount}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group className="mb-2">
                                    <Form.Label>Deposit Amount</Form.Label>
                                    <Form.Control
                                        name="depositAmount"
                                        value={formData.depositAmount}
                                        onChange={updateField}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {/* Notes */}
                        <Form.Group className="mb-2">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                value={formData.notes}
                                onChange={updateField}
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <button className="secondary-button btn-sm small-add-button" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </button>

                    <button className="primary-button btn-sm small-add-button" onClick={handleEditBooking}>
                        Update Booking
                    </button>
                </Modal.Footer>
            </Modal>

        </AdminLayout>
    );
};

export default Admin_Room_Booking_List;

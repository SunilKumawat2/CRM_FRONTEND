import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Get_Rooms,
  Admin_Post_Room,
  Admin_Room_Delete,
  Admin_Room_Update,
} from "../../../../api/admin/Admin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import { IMG_BASE_URL } from "../../../../config/Config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Admin_Room_List = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const initialFormData = {
    roomNumber: "",
    roomType: "",
    baseRate: "",
    discountedPrice: "",
    payAtHotel: false,
    freeCancellation: false,
    refundable: false,

    maxAdults: 1,
    maxChildren: 0,
    extraBedAllowed: false,
    maxOccupancy: 1,

    bedType: "Single",
    numberOfBeds: 1,
    hasLivingArea: false,
    hasBalcony: false,

    bathtub: false,
    jacuzzi: false,
    hairDryer: false,

    amenities: [],
    roomView: "City",
    nearElevator: false,
    floorLevel: "Middle",

    wheelchairAccessible: false,
    groundFloor: false,
    seniorFriendly: false,

    smokingAllowed: false,

    earlyCheckin: false,
    lateCheckout: false,
    hourlyStay: false,
    longStayFriendly: false,

    rating: 0,
    tags: [],

    seasonalRates: [
      {
        seasonName: "",
        startDate: "",
        endDate: "",
        price: "",
      },
    ],
    description: "",
    images: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Rooms(page, limit);
      setRooms(res.data?.data || []);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      toast.error(err.response?.data?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();

      // 🔹 Append normal fields
      Object.keys(formData).forEach((key) => {
        if (
          key !== "images" &&
          key !== "seasonalRates" &&
          key !== "amenities" &&
          key !== "tags"
        ) {
          formPayload.append(key, formData[key]);
        }
      });

      // 🔹 Arrays
      formData.amenities.forEach((a) => formPayload.append("amenities[]", a));
      formData.tags.forEach((t) => formPayload.append("tags[]", t));

      // 🔹 Seasonal Rates
      formData.seasonalRates.forEach((rate, index) => {
        formPayload.append(
          `seasonalRates[${index}][seasonName]`,
          rate.seasonName
        );
        formPayload.append(
          `seasonalRates[${index}][startDate]`,
          rate.startDate
        );
        formPayload.append(`seasonalRates[${index}][endDate]`, rate.endDate);
        formPayload.append(`seasonalRates[${index}][price]`, rate.price);
      });

      // 🔹 Images (IMPORTANT)
      formData.images.forEach((image) => {
        formPayload.append("images", image);
      });

      const res = await Admin_Post_Room(formPayload);

      toast.success(res.data?.message || "Room created successfully");
      setShowAddModal(false);
      setFormData(initialFormData);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const yesNoSelect = (label, value, key) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select
        value={value ? "Yes" : "No"}
        onChange={(e) =>
          setFormData({ ...formData, [key]: e.target.value === "Yes" })
        }
      >
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </Form.Select>
    </Form.Group>
  );

  const handleEditRoom = (room) => {
    setSelectedRoom(room);

    setFormData({
      ...initialFormData, // default fallback
      ...room,
      amenities: room.amenities || [],
      tags: room.tags || [],
      seasonalRates:
        room.seasonalRates?.length > 0
          ? room.seasonalRates
          : initialFormData.seasonalRates,
    });

    setShowEditModal(true);
  };

  // Edit Room
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!selectedRoom?._id) {
      toast.warning("No room selected to update.");
      return;
    }

    try {
      const res = await Admin_Room_Update(selectedRoom._id, formData);
      toast.success(res.data?.message || "Room updated successfully");
      setShowEditModal(false);
      fetchRooms();
    } catch (err) {
      console.log("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update room");
    }
  };

  // Delete Room
  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await Admin_Room_Delete(id);
      toast.success(res.data?.message || "Room deleted successfully");
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete room");
    }
  };

  // Handle Edit Button
  const handleEditClick = (room) => {
    setSelectedRoom(room);

    setFormData({
      roomNumber: room?.roomNumber || "",
      roomType: room?.roomType || "",
      baseRate: room?.baseRate || "",
      discountedPrice: room?.discountedPrice || "",
      payAtHotel: room?.payAtHotel ?? false,
      freeCancellation: room?.freeCancellation ?? false,
      refundable: room?.refundable ?? false,

      maxAdults: room?.maxAdults ?? 1,
      maxChildren: room?.maxChildren ?? 0,
      extraBedAllowed: room?.extraBedAllowed ?? false,
      maxOccupancy: room?.maxOccupancy ?? 1,

      bedType: room?.bedType || "Single",
      numberOfBeds: room.numberOfBeds ?? 1,
      hasLivingArea: room.hasLivingArea ?? false,
      hasBalcony: room.hasBalcony ?? false,

      bathtub: room.bathtub ?? false,
      jacuzzi: room.jacuzzi ?? false,
      hairDryer: room.hairDryer ?? false,

      amenities: room.amenities || [],
      tags: room.tags || [],
      roomView: room.roomView || "City",
      nearElevator: room.nearElevator ?? false,
      floorLevel: room.floorLevel || "Middle",

      wheelchairAccessible: room.wheelchairAccessible ?? false,
      groundFloor: room.groundFloor ?? false,
      seniorFriendly: room.seniorFriendly ?? false,

      smokingAllowed: room.smokingAllowed ?? false,
      earlyCheckin: room.earlyCheckin ?? false,
      lateCheckout: room.lateCheckout ?? false,
      hourlyStay: room.hourlyStay ?? false,
      longStayFriendly: room.longStayFriendly ?? false,

      rating: room.rating ?? 0,

      seasonalRates: room.seasonalRates?.length
        ? room.seasonalRates
        : [{ seasonName: "", startDate: "", endDate: "", price: "" }],

      description: room.description || "",
      // images: room.images || [],
      housekeepingStatus: room.housekeepingStatus || "Clean",
      isAvailable: room.isAvailable ?? true,
    });

    setShowEditModal(true);
  };

  // Handle View Button
  const handleViewClick = (room) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };

  // ================= HELPER COMPONENTS =================

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <h5 className="border-bottom pb-2 text-secondary">{title}</h5>
      <div className="row">{children}</div>
    </div>
  );

  const Info = ({ label, value }) => (
    <div className="col-md-4 mb-2">
      <strong>{label}:</strong>
      <br />
      <span>
        {value !== undefined && value !== null ? String(value) : "N/A"}
      </span>
    </div>
  );

  const BooleanList = ({ data }) => (
    <>
      {Object.entries(data).map(([key, value], index) => (
        <div className="col-md-4 mb-2" key={index}>
          <strong>{key}:</strong>
          <br />
          <span className={`badge ${value ? "bg-success" : "bg-danger"}`}>
            {value ? "Yes" : "No"}
          </span>
        </div>
      ))}
    </>
  );

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Room Management</h5>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" /> Add Room
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" /> <p>Loading...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive className="table-smaller">
            <thead>
              <tr>
                <th>#</th>
                <th>Room No</th>
                <th>Type</th>
                <th>Base Rate ($)</th>
                <th>Seasonal Rates</th>
                <th>Available</th>
                <th>Housekeeping</th>
                <th>Amenities</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms?.length > 0 ? (
                rooms.map((room, index) => (
                  <tr key={room._id}>
                    <td>{index + 1}</td>
                    <td>{room.roomNumber}</td>
                    <td>{room.roomType}</td>
                    <td>{room.baseRate}</td>

                    {/* ✅ Seasonal Rates */}
                    <td>
                      {room.seasonalRates?.length > 0 ? (
                        room.seasonalRates.map((s, i) => (
                          <div key={i}>
                            <strong>{s.seasonName}</strong>: ${s.price}
                            <br />
                            <small>
                              {new Date(s.startDate).toLocaleDateString()} -{" "}
                              {new Date(s.endDate).toLocaleDateString()}
                            </small>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>

                    {/* ✅ Availability */}
                    <td>
                      <span
                        className={`badge ${
                          room.isAvailable ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {room.isAvailable ? "Available" : "Not Available"}
                      </span>
                    </td>

                    {/* ✅ Housekeeping */}
                    <td>{room.housekeepingStatus || "N/A"}</td>

                    {/* ✅ Amenities */}
                    <td>{room.amenities?.join(", ") || "N/A"}</td>

                    {/* ✅ Description */}
                    <td style={{ maxWidth: "200px" }}>
                      {room.description?.length > 80
                        ? room.description.slice(0, 80) + "..."
                        : room.description}
                    </td>

                    {/* ✅ Created By */}
                    <td>{room.createdBy?.name || "N/A"}</td>

                    {/* ✅ Created Date */}
                    <td>{new Date(room.createdAt).toLocaleDateString()}</td>

                    {/* ✅ Actions */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FaEye
                          className="text-success"
                          size={17}
                          role="button"
                          onClick={() => handleViewClick(room)}
                        />
                        <FaEdit
                          className="text-warning"
                          size={17}
                          role="button"
                          onClick={() => handleEditClick(room)}
                        />
                        <FaTrash
                          className="text-danger"
                          size={17}
                          role="button"
                          onClick={() => handleDeleteRoom(room._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">
                    {loading ? "Loading rooms..." : "No rooms found"}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        <div className="pagination-container d-flex justify-content-center mt-3">
          {/* Prev */}
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <TbPlayerTrackPrevFilled size={20} />
          </button>

          {/* Page Label */}
          <span className="pagination-info">
            Page {page} / {totalPages || 1}
          </span>

          {/* Next */}
          <button
            className="pagination-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <TbPlayerTrackNextFilled size={20} />
          </button>
        </div>
      </div>

      {/* <------------ Add New Room ----------------> */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Add New Room</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form onSubmit={handleCreateRoom}>
            {/* ----------------- Basic Info ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 small-form-title">
              Room Information
            </h5>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3 ">
                  <Form.Label>Room Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type</Form.Label>
                  <Form.Select
                    value={formData.roomType}
                    onChange={(e) =>
                      setFormData({ ...formData, roomType: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive">Executive</option>
                    <option value="Penthouse">Penthouse</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Rate</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.baseRate}
                    onChange={(e) =>
                      setFormData({ ...formData, baseRate: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discounted Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountedPrice: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                {yesNoSelect("Pay at Hotel", formData.payAtHotel, "payAtHotel")}
              </Col>
              <Col md={4}>
                {yesNoSelect(
                  "Free Cancellation",
                  formData.freeCancellation,
                  "freeCancellation"
                )}
              </Col>
              <Col md={4}>
                {yesNoSelect("Refundable", formData.refundable, "refundable")}
              </Col>
            </Row>

            {/* ----------------- Capacity & Bed ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
              Capacity & Bed
            </h5>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Adults</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxAdults}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAdults: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Children</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxChildren}
                    onChange={(e) =>
                      setFormData({ ...formData, maxChildren: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Extra Bed Allowed",
                  formData.extraBedAllowed,
                  "extraBedAllowed"
                )}
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Occupancy</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) =>
                      setFormData({ ...formData, maxOccupancy: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Bed Type</Form.Label>
                  <Form.Select
                    value={formData.bedType}
                    onChange={(e) =>
                      setFormData({ ...formData, bedType: e.target.value })
                    }
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Beds</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.numberOfBeds}
                    onChange={(e) =>
                      setFormData({ ...formData, numberOfBeds: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Living Area",
                  formData.hasLivingArea,
                  "hasLivingArea"
                )}
              </Col>
              <Col md={3}>
                {yesNoSelect("Balcony", formData.hasBalcony, "hasBalcony")}
              </Col>
            </Row>

            {/* ----------------- Bathroom ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
              Bathroom Features
            </h5>
            <Row>
              <Col md={3}>
                {yesNoSelect("Bathtub", formData.bathtub, "bathtub")}
              </Col>
              <Col md={3}>
                {yesNoSelect("Jacuzzi", formData.jacuzzi, "jacuzzi")}
              </Col>
              <Col md={3}>
                {yesNoSelect("Hair Dryer", formData.hairDryer, "hairDryer")}
              </Col>
            </Row>

            {/* ----------------- View & Location ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
              View & Location
            </h5>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Room View</Form.Label>
                  <Form.Select
                    value={formData.roomView}
                    onChange={(e) =>
                      setFormData({ ...formData, roomView: e.target.value })
                    }
                  >
                    <option value="City">City</option>
                    <option value="Sea">Sea</option>
                    <option value="Mountain">Mountain</option>
                    <option value="Garden">Garden</option>
                    <option value="Pool">Pool</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Near Elevator",
                  formData.nearElevator,
                  "nearElevator"
                )}
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor Level</Form.Label>
                  <Form.Select
                    value={formData.floorLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, floorLevel: e.target.value })
                    }
                  >
                    <option value="Top">Top</option>
                    <option value="Middle">Middle</option>
                    <option value="Lower">Lower</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* ----------------- Accessibility & Policies ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
              Accessibility & Policies
            </h5>
            <Row>
              <Col md={4}>
                {yesNoSelect(
                  "Wheelchair Accessible",
                  formData.wheelchairAccessible,
                  "wheelchairAccessible"
                )}
              </Col>
              <Col md={4}>
                {yesNoSelect(
                  "Ground Floor",
                  formData.groundFloor,
                  "groundFloor"
                )}
              </Col>
              <Col md={4}>
                {yesNoSelect(
                  "Senior Friendly",
                  formData.seniorFriendly,
                  "seniorFriendly"
                )}
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Smoking Allowed",
                  formData.smokingAllowed,
                  "smokingAllowed"
                )}
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Early Check-in",
                  formData.earlyCheckin,
                  "earlyCheckin"
                )}
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Late Checkout",
                  formData.lateCheckout,
                  "lateCheckout"
                )}
              </Col>
              <Col md={3}>
                {yesNoSelect("Hourly Stay", formData.hourlyStay, "hourlyStay")}
              </Col>
              <Col md={3}>
                {yesNoSelect(
                  "Long Stay Friendly",
                  formData.longStayFriendly,
                  "longStayFriendly"
                )}
              </Col>
            </Row>

            {/* ----------------- Rating & Tags ----------------- */}
            <Row className="mt-3">
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={9}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tags.join(",")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value.split(","),
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* ----------------- Amenities ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-2 mt-2 small-section-title">
              Amenities
            </h5>

            <Row className="small-amenities">
              {["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Room Service"].map(
                (amenity) => (
                  <Col md={4} key={amenity}>
                    <Form.Check
                      type="checkbox"
                      label={amenity}
                      value={amenity}
                      className="custom-amenity-checkbox small-amenity-checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        setFormData((prev) => ({
                          ...prev,
                          amenities: checked
                            ? [...prev.amenities, value]
                            : prev.amenities.filter((a) => a !== value),
                        }));
                      }}
                    />
                  </Col>
                )
              )}
            </Row>

            {/* ----------------- Seasonal Rates ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
              Seasonal Pricing
            </h5>
            {formData.seasonalRates.map((rate, index) => (
              <Row key={index} className="align-items-end mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Season Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={rate.seasonName}
                      onChange={(e) => {
                        const updated = [...formData.seasonalRates];
                        updated[index].seasonName = e.target.value;
                        setFormData({ ...formData, seasonalRates: updated });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={rate.startDate}
                      onChange={(e) => {
                        const updated = [...formData.seasonalRates];
                        updated[index].startDate = e.target.value;
                        setFormData({ ...formData, seasonalRates: updated });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={rate.endDate}
                      onChange={(e) => {
                        const updated = [...formData.seasonalRates];
                        updated[index].endDate = e.target.value;
                        setFormData({ ...formData, seasonalRates: updated });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={rate.price}
                      onChange={(e) => {
                        const updated = [...formData.seasonalRates];
                        updated[index].price = e.target.value;
                        setFormData({ ...formData, seasonalRates: updated });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <button
                    className="primary-checkout-button "
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        seasonalRates: formData.seasonalRates.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                  >
                    ✕
                  </button>
                </Col>
              </Row>
            ))}
            <div className="text-end mb-3">
              <button
                className="primary-button btn-sm small-add-button"
                size="sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    seasonalRates: [
                      ...formData.seasonalRates,
                      { seasonName: "", startDate: "", endDate: "", price: "" },
                    ],
                  })
                }
              >
                + Add Seasonal Rate
              </button>
            </div>
            {/* ----------------- Room Images ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
              Room Images (Max 5)
            </h5>

            <Form.Group className="mb-3">
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);

                  setFormData((prev) => {
                    const combined = [...prev.images, ...newFiles].slice(0, 5);
                    return { ...prev, images: combined };
                  });
                }}
              />
              <small className="text-muted">
                Upload up to 5 images (jpg, png, jpeg)
              </small>
            </Form.Group>
            {/* Image Preview */}
            {formData.images.length > 0 && (
              <Row className="mt-3">
                {formData.images.map((file, index) => (
                  <Col md={2} key={index} className="mb-2 position-relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                      }}
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "8px",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </Col>
                ))}
              </Row>
            )}

            {/* ----------------- Description ----------------- */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>

              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Enter room description..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowAddModal(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button btn-sm small-add-button"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Room"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* <-------------- Edit Room  -----------------------> */}
     {/* <-------------- Edit Room  -----------------------> */}
<Modal
  show={showEditModal}
  onHide={() => setShowEditModal(false)}
  size="xl"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title className="small-form-title">Edit Room</Modal.Title>
  </Modal.Header>

  <Modal.Body className="small-form">
    <Form onSubmit={handleUpdateRoom}>
      {/* ----------------- Room Information ----------------- */}
      {/* Copy the entire Room Info section from Add modal here */}
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Room Number</Form.Label>
            <Form.Control
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Room Type</Form.Label>
            <Form.Select
              value={formData.roomType}
              onChange={(e) =>
                setFormData({ ...formData, roomType: e.target.value })
              }
              required
            >
              <option value="">Select Type</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Executive">Executive</option>
              <option value="Penthouse">Penthouse</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Base Rate</Form.Label>
            <Form.Control
              type="number"
              value={formData.baseRate}
              onChange={(e) =>
                setFormData({ ...formData, baseRate: e.target.value })
              }
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* ----------------- Capacity & Bed ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- Bathroom Features ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- View & Location ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- Accessibility & Policies ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- Rating & Tags ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- Amenities ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- Seasonal Rates ----------------- */}
      {/* Copy this section from Add modal */}

      {/* ----------------- Room Images ----------------- */}
      <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4 small-form-title">
        Room Images (Max 5)
      </h5>
      <Form.Group className="mb-3">
        <Form.Control
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files);
            setFormData((prev) => {
              const combined = [...prev.images, ...newFiles].slice(0, 5);
              return { ...prev, images: combined };
            });
          }}
        />
        <small className="text-muted">
          Upload up to 5 images (jpg, png, jpeg)
        </small>
      </Form.Group>

     <Row className="mt-3">
  {formData.images.map((img, index) => {
    if (!img) return null;

    let src = "";

    // 1️⃣ If img is a File object (newly uploaded)
    if (img instanceof File) {
      src = URL.createObjectURL(img);
    }
    // 2️⃣ If img is a string URL (existing images from backend)
    else if (typeof img === "string") {
      // If your backend provides only filename, prepend API URL
      src = img.startsWith("http")
        ? img
        : `${process.env.REACT_APP_API_URL}/uploads/${img}`;
    } else {
      return null; // skip anything else
    }

    return (
      <Col md={2} key={index} className="mb-2 position-relative">
        <img
          src={src}
          alt="room"
          style={{
            width: "100%",
            height: "100px",
            objectFit: "cover",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        />
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              images: prev.images.filter((_, i) => i !== index),
            }))
          }
          style={{
            position: "absolute",
            top: "4px",
            right: "8px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "22px",
            height: "22px",
          }}
        >
          ×
        </button>
      </Col>
    );
  })}
</Row>



      {/* ----------------- Description ----------------- */}
      <Form.Group className="mb-3 mt-4">
        <Form.Label>Description</Form.Label>
        <ReactQuill
          theme="snow"
          value={formData.description}
          onChange={(value) =>
            setFormData({ ...formData, description: value })
          }
        />
      </Form.Group>

      <Modal.Footer>
        <button
          type="button"
          className="secondary-button btn-sm small-add-button"
          onClick={() => setShowEditModal(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="primary-button btn-sm small-add-button"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Room"}
        </button>
      </Modal.Footer>
    </Form>
  </Modal.Body>
</Modal>


      {/* ✅ View Room Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🏨 Room Details</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-view-modal">
          {selectedRoom ? (
            <div className="p-3">
              {/* ================= BASIC INFO ================= */}
              <Section title="Basic Information">
                <Info label="Room Number" value={selectedRoom.roomNumber} />
                <Info label="Room Type" value={selectedRoom.roomType} />
                <Info label="Room View" value={selectedRoom.roomView} />
                <Info label="Floor Level" value={selectedRoom.floorLevel} />
                <Info label="Near Elevator" value={selectedRoom.nearElevator} />
              </Section>

              {/* ================= PRICING ================= */}
              <Section title="Pricing & Policies">
                <Info label="Base Rate" value={`$${selectedRoom.baseRate}`} />
                <Info
                  label="Discounted Price"
                  value={`$${selectedRoom.discountedPrice}`}
                />
                <Info label="Pay at Hotel" value={selectedRoom.payAtHotel} />
                <Info
                  label="Free Cancellation"
                  value={selectedRoom.freeCancellation}
                />
                <Info label="Refundable" value={selectedRoom.refundable} />
              </Section>

              {/* ================= OCCUPANCY ================= */}
              <Section title="Occupancy">
                <Info label="Max Adults" value={selectedRoom.maxAdults} />
                <Info label="Max Children" value={selectedRoom.maxChildren} />
                <Info label="Max Occupancy" value={selectedRoom.maxOccupancy} />
                <Info
                  label="Extra Bed Allowed"
                  value={selectedRoom.extraBedAllowed}
                />
              </Section>

              {/* ================= BED DETAILS ================= */}
              <Section title="Bed Details">
                <Info label="Bed Type" value={selectedRoom.bedType} />
                <Info
                  label="Number of Beds"
                  value={selectedRoom.numberOfBeds}
                />
              </Section>

              {/* ================= ROOM FEATURES ================= */}
              <Section title="Room Features">
                <BooleanList
                  data={{
                    "Living Area": selectedRoom.hasLivingArea,
                    Balcony: selectedRoom.hasBalcony,
                    "Attached Bathroom": selectedRoom.attachedBathroom,
                    Jacuzzi: selectedRoom.jacuzzi,
                    Bathtub: selectedRoom.bathtub,
                    "Shower Only": selectedRoom.showerOnly,
                  }}
                />
              </Section>

              {/* ================= UTILITIES ================= */}
              <Section title="Utilities">
                <BooleanList
                  data={{
                    "Hot Water": selectedRoom.hotWater,
                    "Hair Dryer": selectedRoom.hairDryer,
                  }}
                />
              </Section>

              {/* ================= ACCESSIBILITY ================= */}
              <Section title="Accessibility">
                <BooleanList
                  data={{
                    "Wheelchair Accessible": selectedRoom.wheelchairAccessible,
                    "Elevator Access": selectedRoom.elevatorAccess,
                    "Ground Floor": selectedRoom.groundFloor,
                    "Senior Friendly": selectedRoom.seniorFriendly,
                  }}
                />
              </Section>

              {/* ================= STAY OPTIONS ================= */}
              <Section title="Stay Options">
                <BooleanList
                  data={{
                    "Smoking Allowed": selectedRoom.smokingAllowed,
                    "Early Check-in": selectedRoom.earlyCheckin,
                    "Late Checkout": selectedRoom.lateCheckout,
                    "Hourly Stay": selectedRoom.hourlyStay,
                    "Long Stay Friendly": selectedRoom.longStayFriendly,
                  }}
                />
              </Section>

              {/* ================= STATUS ================= */}
              <Section title="Status">
                <Info
                  label="Availability"
                  value={selectedRoom.isAvailable ? "Available" : "Unavailable"}
                />
                <Info
                  label="Housekeeping Status"
                  value={selectedRoom.housekeepingStatus}
                />
                <Info label="Rating" value={selectedRoom.rating} />
                <Info
                  label="Total Bookings"
                  value={selectedRoom.totalBookings}
                />
              </Section>

              {/* ================= SEASONAL RATES ================= */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary">
                  Seasonal Rates
                </h5>
                {selectedRoom.seasonalRates?.length ? (
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Season</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRoom.seasonalRates.map((s, i) => (
                        <tr key={i}>
                          <td>{s.seasonName}</td>
                          <td>{new Date(s.startDate).toLocaleDateString()}</td>
                          <td>{new Date(s.endDate).toLocaleDateString()}</td>
                          <td>${s.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No seasonal rates</p>
                )}
              </div>

              {/* ================= AMENITIES ================= */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary">Amenities</h5>
                {selectedRoom.amenities?.length ? (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((a, i) => (
                      <span key={i} className="badge bg-primary">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No amenities</p>
                )}
              </div>

              {/* ================= DESCRIPTION ================= */}
              <Section title="Description">
                <p className="text-muted">{selectedRoom.description}</p>
              </Section>

              {/* ================= META ================= */}
              <div className="text-end small text-muted">
                <div>
                  <strong>Created By:</strong> {selectedRoom.createdBy?.name}
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedRoom.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Updated:</strong>{" "}
                  {new Date(selectedRoom.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">No details available</p>
          )}

          {/* ================= ROOM IMAGES ================= */}
          <Section title="Room Images">
            {selectedRoom?.images && selectedRoom?.images?.length > 0 ? (
              <Row className="g-3">
                {selectedRoom?.images.map((img, index) => (
                  <Col md={3} key={index}>
                    <img
                      src={`${IMG_BASE_URL}/${img}`}
                      alt={`Room ${index + 1}`}
                      className="img-fluid rounded shadow-sm"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        width: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        window.open(`${IMG_BASE_URL}/${img}`, "_blank")
                      }
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted">No images available</p>
            )}
          </Section>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Room_List;

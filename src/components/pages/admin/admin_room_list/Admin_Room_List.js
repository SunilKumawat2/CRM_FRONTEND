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

const Admin_Room_List = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  // Selected Room
  const [selectedRoom, setSelectedRoom] = useState(null);
  // Room Form Data
  // const [formData, setFormData] = useState({
  //   roomNumber: "",
  //   roomType: "",
  //   baseRate: "",
  //   housekeepingStatus: "Clean",
  //   isAvailable: true,
  //   amenities: [], // ✅ must be an array
  //   seasonalRates: [
  //     {
  //       seasonName: "",
  //       startDate: "",
  //       endDate: "",
  //       price: "",
  //     },
  //   ],
  //   description: "",
  // });
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

  // Create Room
  // const handleCreateRoom = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await Admin_Post_Room(formData);
  //     toast.success(res.data?.message || "Room created successfully");
  //     setShowAddModal(false);
  //     setFormData({
  //       roomNumber: "",
  //       roomType: "",
  //       baseRate: "",
  //       housekeepingStatus: "Clean",
  //       isAvailable: true,
  //       amenities: [], // ✅ must be an array
  //       seasonalRates: [
  //         {
  //           seasonName: "",
  //           startDate: "",
  //           endDate: "",
  //           price: "",
  //         },
  //       ],
  //       description: "",
  //     });

  //     fetchRooms();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Failed to create room");
  //   }
  // };
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Admin_Post_Room(formData);
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
    setSelectedRoom(room); // ✅ store the selected room
    setFormData({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "",
      baseRate: room.baseRate || "",
      housekeepingStatus: room.housekeepingStatus || "Clean",
      isAvailable: room.isAvailable ?? true,
      amenities: room.amenities || [],
      seasonalRates: room.seasonalRates?.length
        ? room.seasonalRates
        : [{ seasonName: "", startDate: "", endDate: "", price: "" }],
      description: room.description || "",
    });
    setShowEditModal(true);
  };

  // Handle View Button
  const handleViewClick = (room) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };

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
                        className={`badge ${room.isAvailable ? "bg-success" : "bg-danger"
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

      {/* ✅ Add Room Modal */}
      {/* <Modal

        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="small-form-title"

          >
            Add New Room
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form onSubmit={handleCreateRoom}>
            <h5 className="text-secondary border-bottom pb-2 mb-3">
              Room Information
            </h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
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

              <Col md={6}>
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
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Rate (per night)</Form.Label>
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

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Housekeeping Status</Form.Label>
                  <Form.Select
                    value={formData.housekeepingStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        housekeepingStatus: e.target.value,
                      })
                    }
                  >
                    <option value="Clean">Clean</option>
                    <option value="Dirty">Dirty</option>
                    <option value="In Maintenance">In Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small-switch-label">
                    Availability
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    id="availability-switch"
                    className="custom-switch small-switch"
                    label={formData.isAvailable ? "Available" : "Not Available"}
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

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

            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">
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
                      placeholder="e.g. Winter Offer"
                      required
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
                      required
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
                      required
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
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={1} className="btn-primary">
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

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this room (e.g. Sea view, spacious, etc.)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleCreateRoom}
            disabled={loading}
            className="primary-button btn-sm small-add-button"
          >
            {loading ? "Saving..." : "Save Room"}
          </button>
        </Modal.Footer>
      </Modal> */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Room</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleCreateRoom}>
            {/* ----------------- Basic Info ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3">Room Information</h5>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type</Form.Label>
                  <Form.Select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>{yesNoSelect("Pay at Hotel", formData.payAtHotel, "payAtHotel")}</Col>
              <Col md={4}>{yesNoSelect("Free Cancellation", formData.freeCancellation, "freeCancellation")}</Col>
              <Col md={4}>{yesNoSelect("Refundable", formData.refundable, "refundable")}</Col>
            </Row>

            {/* ----------------- Capacity & Bed ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">Capacity & Bed</h5>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Adults</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxAdults}
                    onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Children</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxChildren}
                    onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>{yesNoSelect("Extra Bed Allowed", formData.extraBedAllowed, "extraBedAllowed")}</Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Occupancy</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Bed Type</Form.Label>
                  <Form.Select
                    value={formData.bedType}
                    onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, numberOfBeds: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>{yesNoSelect("Living Area", formData.hasLivingArea, "hasLivingArea")}</Col>
              <Col md={3}>{yesNoSelect("Balcony", formData.hasBalcony, "hasBalcony")}</Col>
            </Row>

            {/* ----------------- Bathroom ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">Bathroom Features</h5>
            <Row>
              <Col md={3}>{yesNoSelect("Bathtub", formData.bathtub, "bathtub")}</Col>
              <Col md={3}>{yesNoSelect("Jacuzzi", formData.jacuzzi, "jacuzzi")}</Col>
              <Col md={3}>{yesNoSelect("Hair Dryer", formData.hairDryer, "hairDryer")}</Col>
            </Row>

            {/* ----------------- View & Location ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">View & Location</h5>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Room View</Form.Label>
                  <Form.Select
                    value={formData.roomView}
                    onChange={(e) => setFormData({ ...formData, roomView: e.target.value })}
                  >
                    <option value="City">City</option>
                    <option value="Sea">Sea</option>
                    <option value="Mountain">Mountain</option>
                    <option value="Garden">Garden</option>
                    <option value="Pool">Pool</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>{yesNoSelect("Near Elevator", formData.nearElevator, "nearElevator")}</Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor Level</Form.Label>
                  <Form.Select
                    value={formData.floorLevel}
                    onChange={(e) => setFormData({ ...formData, floorLevel: e.target.value })}
                  >
                    <option value="Top">Top</option>
                    <option value="Middle">Middle</option>
                    <option value="Lower">Lower</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* ----------------- Accessibility & Policies ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">Accessibility & Policies</h5>
            <Row>
              <Col md={4}>{yesNoSelect("Wheelchair Accessible", formData.wheelchairAccessible, "wheelchairAccessible")}</Col>
              <Col md={4}>{yesNoSelect("Ground Floor", formData.groundFloor, "groundFloor")}</Col>
              <Col md={4}>{yesNoSelect("Senior Friendly", formData.seniorFriendly, "seniorFriendly")}</Col>
              <Col md={3}>{yesNoSelect("Smoking Allowed", formData.smokingAllowed, "smokingAllowed")}</Col>
              <Col md={3}>{yesNoSelect("Early Check-in", formData.earlyCheckin, "earlyCheckin")}</Col>
              <Col md={3}>{yesNoSelect("Late Checkout", formData.lateCheckout, "lateCheckout")}</Col>
              <Col md={3}>{yesNoSelect("Hourly Stay", formData.hourlyStay, "hourlyStay")}</Col>
              <Col md={3}>{yesNoSelect("Long Stay Friendly", formData.longStayFriendly, "longStayFriendly")}</Col>
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
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={9}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tags.join(",")}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",") })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* ----------------- Amenities ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-2 mt-2">Amenities</h5>
            <Row className="mb-3">
              {["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Room Service", "Breakfast", "Smart TV"].map((amenity) => (
                <Col md={4} key={amenity}>
                  <Form.Check
                    type="checkbox"
                    label={amenity}
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        amenities: checked ? [...prev.amenities, value] : prev.amenities.filter((a) => a !== value),
                      }));
                    }}
                  />
                </Col>
              ))}
            </Row>

            {/* ----------------- Seasonal Rates ----------------- */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">Seasonal Pricing</h5>
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
                    type="button"
                    className="btn btn-danger"
                    onClick={() =>
                      setFormData({ ...formData, seasonalRates: formData.seasonalRates.filter((_, i) => i !== index) })
                    }
                  >
                    ✕
                  </button>
                </Col>
              </Row>
            ))}
            <div className="text-end mb-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setFormData({ ...formData, seasonalRates: [...formData.seasonalRates, { seasonName: "", startDate: "", endDate: "", price: "" }] })
                }
              >
                + Add Seasonal Rate
              </button>
            </div>

            {/* ----------------- Description ----------------- */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddModal(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Room"}
          </button>
        </Modal.Footer>
      </Modal>


      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="small-form-title"
          >
            Edit Room
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form onSubmit={handleUpdateRoom}>
            {/* 🔹 Basic Info */}
            <h5 className="text-secondary border-bottom pb-2 mb-3">
              Room Information
            </h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
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

              <Col md={6}>
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
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Rate (per night)</Form.Label>
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

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Housekeeping Status</Form.Label>
                  <Form.Select
                    value={formData.housekeepingStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        housekeepingStatus: e.target.value,
                      })
                    }
                  >
                    <option value="Clean">Clean</option>
                    <option value="Dirty">Dirty</option>
                    <option value="In Maintenance">In Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2 small-switch-group">
                  <Form.Label className="small-switch-label">
                    Availability
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    id="availability-switch"
                    className="custom-switch small-switch"
                    label={formData.isAvailable ? "Available" : "Not Available"}
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* 🔹 Amenities */}
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
                      className="custom-amenity-checkbox small-amenity-checkbox"
                      value={amenity}
                      checked={formData.amenities?.includes(amenity)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        setFormData((prev) => ({
                          ...prev,
                          amenities: checked
                            ? [...(prev.amenities || []), value]
                            : (prev.amenities || []).filter((a) => a !== value),
                        }));
                      }}
                    />
                  </Col>
                )
              )}
            </Row>

            {/* 🔹 Seasonal Rates */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-4">
              Seasonal Pricing
            </h5>
            {formData.seasonalRates?.map((rate, index) => (
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
                      placeholder="e.g. Winter Offer"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={rate.startDate?.split("T")[0] || ""}
                      onChange={(e) => {
                        const updated = [...formData.seasonalRates];
                        updated[index].startDate = e.target.value;
                        setFormData({ ...formData, seasonalRates: updated });
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={rate.endDate?.split("T")[0] || ""}
                      onChange={(e) => {
                        const updated = [...formData.seasonalRates];
                        updated[index].endDate = e.target.value;
                        setFormData({ ...formData, seasonalRates: updated });
                      }}
                      required
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
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={1} className="text-center">
                  <button
                    size="sm"
                    className="primary-checkout-button"
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

            {/* 🔹 Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this room (e.g. Sea view, spacious, etc.)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            variant="secondary"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>
          <button
            className="primary-button btn-sm small-add-button"
            type="submit"
            onClick={handleUpdateRoom}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Room"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ✅ View Room Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton >
          <Modal.Title>
            🏨 Room Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-view-modal">
          {selectedRoom ? (
            <div className="p-3">
              {/* Basic Info */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary">
                  Basic Information
                </h5>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>Room Number:</strong> <br />
                    <span>{selectedRoom.roomNumber}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Room Type:</strong> <br />
                    <span>{selectedRoom.roomType}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Base Rate:</strong> <br />
                    <span>${selectedRoom.baseRate}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Availability:</strong> <br />
                    <span
                      className={`badge ${selectedRoom.isAvailable ? "bg-success" : "bg-danger"
                        }`}
                    >
                      {selectedRoom.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Housekeeping Status:</strong> <br />
                    <span>{selectedRoom.housekeepingStatus}</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Created By:</strong> <br />
                    <span>{selectedRoom.createdBy?.name || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Seasonal Rates */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary">
                  Seasonal Rates
                </h5>
                {selectedRoom.seasonalRates?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Season</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Price ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRoom.seasonalRates.map((s, i) => (
                          <tr key={i}>
                            <td>{s.seasonName}</td>
                            <td>
                              {new Date(s.startDate).toLocaleDateString()}
                            </td>
                            <td>{new Date(s.endDate).toLocaleDateString()}</td>
                            <td>{s.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No seasonal rates available.</p>
                )}
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary">Amenities</h5>
                {selectedRoom.amenities?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="badge text-white px-3 py-2"
                        style={{ backgroundColor: "#f87951" }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No amenities listed.</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary">
                  Description
                </h5>
                <p className="text-muted">
                  {selectedRoom.description || "N/A"}
                </p>
              </div>

              {/* Dates */}
              <div className="mb-2 text-end text-muted small">
                <strong>Created:</strong>{" "}
                {new Date(selectedRoom.createdAt).toLocaleString()}
                <br />
                <strong>Last Updated:</strong>{" "}
                {new Date(selectedRoom.updatedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">No details available</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
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

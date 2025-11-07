import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Get_Rooms,
  Admin_Post_Room,
  Admin_Room_Delete,
  Admin_Room_Update,
} from "../../../../api/admin/Admin";

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
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    baseRate: "",
    housekeepingStatus: "Clean",
    isAvailable: true,
    amenities: [], // ✅ must be an array
    seasonalRates: [
      {
        seasonName: "",
        startDate: "",
        endDate: "",
        price: "",
      },
    ],
    description: "",
  });

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Rooms();
      setRooms(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      alert(err.response?.data?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await Admin_Post_Room(formData);
      alert(res.data?.message || "Room created successfully");
      setShowAddModal(false);
      setFormData({
        roomNumber: "",
        roomType: "",
        baseRate: "",
        housekeepingStatus: "Clean",
        isAvailable: true,
        amenities: [], // ✅ must be an array
        seasonalRates: [
          {
            seasonName: "",
            startDate: "",
            endDate: "",
            price: "",
          },
        ],
        description: "",
      });

      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create room");
    }
  };

  // Edit Room
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!selectedRoom?._id) {
      alert("No room selected to update.");
      return;
    }

    try {
      const res = await Admin_Room_Update(selectedRoom._id, formData);
      alert(res.data?.message || "Room updated successfully");
      setShowEditModal(false);
      fetchRooms();
    } catch (err) {
      console.log("Update error:", err);
      alert(err.response?.data?.message || "Failed to update room");
    }
  };

  // Delete Room
  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await Admin_Room_Delete(id);
      alert(res.data?.message || "Room deleted successfully");
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
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
          <h4>Room Management</h4>
          <button
            className="primary-button"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" /> Add Room
          </button>
        </div>

        <Table striped bordered hover responsive>
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
      </div>

      {/* ✅ Add Room Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="btn-primary" style={{color:"#f87951"}}>Add New Room</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form onSubmit={handleCreateRoom}>
            {/* 🔹 Basic Info Section */}
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
                  <Form.Label>Availability</Form.Label>
                  <Form.Check
                    type="switch"
                    id="availability-switch"
                    className="custom-switch"
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

            {/* 🔹 Amenities Section */}
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-3">
              Amenities
            </h5>

            <Row>
              {["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Room Service"].map(
                (amenity) => (
                  <Col md={4} key={amenity}>
                    <Form.Check
                      type="checkbox"
                      label={amenity}
                      value={amenity}
                      className="custom-amenity-checkbox"
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

            {/* 🔹 Seasonal Rates Section */}
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
                  className="primary-checkout-button"
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
                className="primary-button"
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
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <button
            variant="primary"
            type="submit"
            onClick={handleCreateRoom}
            disabled={loading}
            className="primary-button"
          >
            {loading ? "Saving..." : "Save Room"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Edit Room Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold" style={{color:"#f87951"}}>Edit Room</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
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
                <Form.Group className="mb-3">
                  <Form.Label>Availability</Form.Label>
                  <Form.Check
                    type="switch"
                  id="availability-switch"
                    className="custom-switch"
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
            <h5 className="text-secondary border-bottom pb-2 mb-3 mt-3">
              Amenities
            </h5>
            <Row>
              {["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Room Service"].map(
                (amenity) => (
                  <Col md={4} key={amenity}>
                    <Form.Check
                      type="checkbox"
                      label={amenity}
                        className="custom-amenity-checkbox"
                      value={amenity}
                      checked={formData.amenities?.includes(amenity)} // ✅ safe check
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
                className="primary-button"
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
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <button
            className="primary-button"
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
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold" style={{color:"#f87951"}}>
            🏨 Room Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
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
                      className={`badge ${
                        selectedRoom.isAvailable ? "bg-success" : "bg-danger"
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
                        className="badge text-white px-3 py-2" style={{backgroundColor:"#f87951"}}
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
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Room_List;

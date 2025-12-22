import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import AdminLayout from "../admin_layout/Admin_Layout";

import {
  Admin_Get_Housekeeping,
  Admin_Create_Housekeeping,
  Admin_Update_Housekeeping,
  Admin_Delete_Housekeeping,
  Admin_Get_Rooms,
  Admin_Get_List,
  Admin_Verify_Clean_Housekeeping,
} from "../../../../api/admin/Admin";
import { FiCheckCircle } from "react-icons/fi";

const Admin_Housekeeping = () => {
  const [housekeepingList, setHousekeepingList] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyItem, setVerifyItem] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isloading, setIsloading] = useState(false)
  const [formData, setFormData] = useState({
    room: "",
    assignedTo: "",
    scheduleDate: "",
    shift: "morning",
    notes: "",
    amenitiesReplaced: [{ item: "", quantity: "" }],
    laundryStatus: "in_progress",
  });

  const openVerifyModal = (item) => {
    setVerifyItem(item);
    setShowVerifyModal(true);
  };

  const handleVerify = async () => {
    try {
      await Admin_Verify_Clean_Housekeeping(verifyItem._id);
      setShowVerifyModal(false);
      loadHousekeeping(); // refresh API
    } catch (error) {
      console.error(error);
    }
  };


  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadHousekeeping();
    await loadRooms();
    await loadAdminList();
  };

  const loadHousekeeping = async () => {
    setIsloading(true)
    try {
      const res = await Admin_Get_Housekeeping();
      setHousekeepingList(res.data.data || []);
      setIsloading(false)
    } catch (error) {
      setIsloading(false)
      console.log(error);
    }
  };

  const loadRooms = async () => {
    const res = await Admin_Get_Rooms(1, 100, "");
    setRooms(res.data.data || []);
  };

  const loadAdminList = async () => {
    const res = await Admin_Get_List();
    setAdminList(res.data.data || []);
  };

  // FORM HANDLERS
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (index, field, value) => {
    const updated = [...formData.amenitiesReplaced];
    updated[index][field] = value;
    setFormData({ ...formData, amenitiesReplaced: updated });
  };

  const addAmenity = () => {
    setFormData({
      ...formData,
      amenitiesReplaced: [
        ...formData.amenitiesReplaced,
        { item: "", quantity: "" },
      ],
    });
  };

  // ADD HOUSEKEEPING
  const handleAdd = async () => {
    try {
      await Admin_Create_Housekeeping(formData);
      setShowAddModal(false);
      loadHousekeeping();
    } catch (error) {
      console.log(error);
    }
  };

  // OPEN VIEW MODAL
  const openViewModal = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (item) => {
    setSelectedItem(item);

    // pre-fill form
    setFormData({
      room: item.room?._id,
      assignedTo: item.assignedTo?._id,
      scheduleDate: item.scheduleDate?.slice(0, 10),
      shift: item.shift,
      notes: item.notes,
      amenitiesReplaced: item.amenitiesReplaced,
      laundryStatus: item.laundryStatus,
    });

    setShowEditModal(true);
  };

  // SUBMIT EDIT
  const handleEdit = async () => {
    try {
      await Admin_Update_Housekeeping(selectedItem._id, formData);
      setShowEditModal(false);
      loadHousekeeping();
    } catch (error) {
      console.log(error);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this housekeeping record?"
      )
    )
      return;
    try {
      await Admin_Delete_Housekeeping(id);
      loadHousekeeping();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <h4>Housekeeping List</h4>
        <button
          className="primary-button btn-sm small-add-button"
          onClick={() => setShowAddModal(true)}
        >
          + Add Housekeeping
        </button>
      </div>
      {
        isloading ? (
          <div className="text-center my-4">
            <Spinner animation="border" /> <p>Loading...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive className="table-smaller">
            <thead>
              <tr>
                <th>#</th>
                <th>Room</th>
                <th>Type</th>
                <th>Assigned</th>
                <th>Shift</th>
                <th>Cleaning</th>
                <th>Laundry</th>
                <th>Condition</th>
                <th>Date</th>
                <th>Amenities</th>
                <th>Notes</th>
                <th>Verified By</th>
                <th>Verified At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {housekeepingList.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>

                  <td>{item.room?.roomNumber || "—"}</td>
                  <td>{item.room?.roomType || "—"}</td>

                  <td>{item.assignedTo?.name || "—"}</td>

                  <td className="text-capitalize">{item.shift}</td>
                  <td className="text-capitalize">{item.cleaningStatus}</td>
                  <td className="text-capitalize">{item.laundryStatus}</td>

                  <td className="text-capitalize">{item.roomCondition || "—"}</td>

                  <td>{item.scheduleDate?.slice(0, 10)}</td>

                  <td>
                    {item.amenitiesReplaced?.length > 0
                      ? item.amenitiesReplaced.map((am) => (
                        <span key={am._id} className="badge bg-info me-1">
                          {am.item} × {am.quantity}
                        </span>
                      ))
                      : "—"}
                  </td>

                  <td>{item.notes || "—"}</td>

                  <td>{item.verifiedBy?.name || "—"}</td>

                  <td>{item.verifiedAt?.slice(0, 10) || "—"}</td>

                  {/* ACTION BUTTONS */}
                  <td>
                    <div className="d-flex gap-2">
                      {/* VERIFY */}
                      <FiCheckCircle
                        size={18}
                        className="text-primary"
                        role="button"
                        onClick={() => openVerifyModal(item)}
                      />

                      {/* EDIT */}
                      <FiEdit
                        size={18}
                        className="text-warning"
                        role="button"
                        onClick={() => openEditModal(item)}
                      />

                      {/* DELETE */}
                      <FiTrash
                        size={18}
                        className="text-danger"
                        role="button"
                        onClick={() => handleDelete(item._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      }


      {/* ---------------------------------------------------- */}
      {/* EDIT HouseKeeping MODAL */}
      {/* ---------------------------------------------------- */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Edit Housekeeping</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-form">
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Room</Form.Label>
                  <Form.Select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                  >
                    {rooms.map((r) => (
                      <option value={r._id}>{r.roomNumber}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Assigned To</Form.Label>
                  <Form.Select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                  >
                    {adminList.map((a) => (
                      <option value={a._id}>{a.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Shift</Form.Label>
                  <Form.Select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* LAUNDRY */}
            <Row className="mt-3">
              <Col>
                <Form.Label>Laundry Status</Form.Label>
                <Form.Select
                  name="laundryStatus"
                  value={formData.laundryStatus}
                  onChange={handleChange}
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </Form.Select>
              </Col>
            </Row>

            {/* NOTES */}
            <Form.Group className="mt-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button text-center"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>

          <button
            className="primary-button btn-sm small-add-button text-center"
            onClick={handleEdit}
          >
            Update
          </button>
        </Modal.Footer>

      </Modal>
      {/* <---------- Add HouseKeeping ---------------> */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Add Housekeeping</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form>
            {/* ROOM + ASSIGNED TO */}
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Select Room</Form.Label>
                  <Form.Select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                  >
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.roomNumber} - {r.roomType}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Assigned To</Form.Label>
                  <Form.Select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">Select Staff</option>
                    {adminList.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* DATE + SHIFT */}
            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Schedule Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Shift</Form.Label>
                  <Form.Select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* LAUNDRY STATUS */}
            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Laundry Status</Form.Label>
                  <Form.Select
                    name="laundryStatus"
                    value={formData.laundryStatus}
                    onChange={handleChange}
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* NOTES */}
            <Form.Group className="mt-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            {/* AMENITIES LIST */}
            <h5 className="mt-4 mb-2">Amenities Replaced</h5>

            {formData.amenitiesReplaced.map((am, index) => (
              <Row key={index} className="mb-2">
                <Col>
                  <Form.Control
                    placeholder="Item"
                    value={am.item}
                    onChange={(e) =>
                      handleAmenityChange(index, "item", e.target.value)
                    }
                  />
                </Col>

                <Col>
                  <Form.Control
                    placeholder="Qty"
                    type="number"
                    value={am.quantity}
                    onChange={(e) =>
                      handleAmenityChange(index, "quantity", e.target.value)
                    }
                  />
                </Col>
              </Row>
            ))}

            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2"
              onClick={addAmenity}
            >
              + Add Amenity
            </button>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>

          <button className="primary-button btn-sm small-add-button" onClick={handleAdd}>
            Save
          </button>
        </Modal.Footer>
      </Modal>

      {/* <----------- Verify Cleaning ------------> */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Verify Cleaning</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {verifyItem && (
            <div className="px-1">

              <div className="d-flex justify-content-between">
                <strong>Room:</strong>
                <span>{verifyItem.room?.roomNumber} ({verifyItem.room?.roomType})</span>
              </div>
              <hr />

              <div className="d-flex justify-content-between">
                <strong>Assigned To:</strong>
                <span>{verifyItem.assignedTo?.name}</span>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <strong>Shift:</strong>
                <span className="text-capitalize">{verifyItem.shift}</span>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <strong>Cleaning Status:</strong>
                <span className="badge bg-success">{verifyItem.cleaningStatus}</span>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <strong>Laundry Status:</strong>
                <span className="badge bg-warning text-dark">{verifyItem.laundryStatus}</span>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <strong>Room Condition:</strong>
                <span className="text-capitalize">{verifyItem.roomCondition}</span>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <strong>Schedule Date:</strong>
                <span>{verifyItem.scheduleDate?.slice(0, 10)}</span>
              </div>

              <hr />

              <strong>Notes:</strong>
              <p className="mt-1">{verifyItem.notes || "No notes added"}</p>

              <strong>Amenities Replaced:</strong>
              <div className="mt-2">
                {verifyItem.amenitiesReplaced?.length > 0 ? (
                  verifyItem.amenitiesReplaced.map((am) => (
                    <span key={am._id} className="badge bg-info text-dark me-2">
                      {am.item} × {am.quantity}
                    </span>
                  ))
                ) : (
                  <p>No amenities replaced</p>
                )}
              </div>

            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button className="secondary-button btn-sm small-add-button text-center" onClick={() => setShowVerifyModal(false)}>
            Close
          </button>
          <button className="primary-button btn-sm small-add-button text-center" onClick={handleVerify}>
            ✔ Verify Cleaning
          </button>
        </Modal.Footer>
      </Modal>


    </AdminLayout>
  );
};

export default Admin_Housekeeping;

import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Spinner } from "react-bootstrap";
import {
  Admin_Get_Shifts,
  Admin_Create_Shift,
  Admin_Shift_Delete,
  Admin_Shift_Update,
} from "../../../../api/admin/Admin";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import AdminLayout from "../admin_layout/Admin_Layout";

const Admin_Shift = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedShift, setSelectedShift] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  // ================= LOAD =================
  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await Admin_Get_Shifts();
      setShifts(res.data.data);
    } catch (err) {
      toast.error("Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  // ================= HANDLE INPUT =================
  const updateField = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= ADD =================
  const handleAdd = async () => {
    try {
      await Admin_Create_Shift(formData);
      toast.success("Shift Created");
      setShowAdd(false);
      loadShifts();
    } catch (err) {
      toast.error(err?.data?.message || "Error creating shift");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shift?")) return;

    try {
      await Admin_Shift_Delete(id);
      toast.success("Deleted");
      loadShifts();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= OPEN EDIT =================
  const openEdit = (shift) => {
    setSelectedShift(shift._id);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
    setShowEdit(true);
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      await Admin_Shift_Update(selectedShift, formData);
      toast.success("Updated");
      setShowEdit(false);
      loadShifts();
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <AdminLayout>
      <div className="container">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4>Shift Management</h4>

          <button
             className="primary-button btn-sm small-add-button"
            onClick={() => setShowAdd(true)}
          >
            <FiPlus /> Add Shift
          </button>
        </div>

        <ToastContainer />

        {/* TABLE */}
        {loading ? (
          <Spinner />
        ) : (
          <Table striped bordered hover responsive className="table-smaller">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {shifts?.map((s, i) => (
                <tr key={s._id}>
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.startTime}</td>
                  <td>{s.endTime}</td>

                  <td>
                    <FiEdit
                      className="text-warning me-2"
                      role="button"
                      onClick={() => openEdit(s)}
                    />

                    <FiTrash
                      className="text-danger"
                      role="button"
                      onClick={() => handleDelete(s._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* ================= ADD MODAL ================= */}
        <Modal show={showAdd} onHide={() => setShowAdd(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">Add Shift</Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={updateField}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={updateField}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={updateField}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <button  className="secondary-button btn-sm small-add-button" onClick={() => setShowAdd(false)}>Cancel</button>
            <button  className="primary-button btn-sm small-add-button" onClick={handleAdd}>Save</button>
          </Modal.Footer>
        </Modal>

        {/* ================= EDIT MODAL ================= */}
        <Modal show={showEdit} onHide={() => setShowEdit(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">Edit Shift</Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={updateField}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={updateField}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={updateField}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <button   className="secondary-button btn-sm small-add-button" onClick={() => setShowEdit(false)}>Cancel</button>
            <button  className="primary-button btn-sm small-add-button" onClick={handleUpdate}>Update</button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Admin_Shift;
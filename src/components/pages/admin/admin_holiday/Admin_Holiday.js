import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Spinner } from "react-bootstrap";
import {
  Admin_Get_Holiday,
  Admin_Create_Holiday,
  Admin_Holiday_Delete,
  Admin_Holiday_Update,
} from "../../../../api/admin/Admin";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import AdminLayout from "../admin_layout/Admin_Layout";

const Admin_Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "company",
  });

  // ================= LOAD =================
  const loadHolidays = async () => {
    setLoading(true);
    try {
      const res = await Admin_Get_Holiday();
      setHolidays(res.data.data || []);
    } catch {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  // ================= FORM =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openAdd = () => {
    setIsEdit(false);
    setFormData({
      name: "",
      date: "",
      type: "company",
    });
    setShowModal(true);
  };

  const openEdit = (holiday) => {
    setIsEdit(true);
    setSelectedId(holiday._id);
    setFormData({
      name: holiday.name,
      date: holiday.date?.slice(0, 10),
      type: holiday.type,
    });
    setShowModal(true);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await Admin_Holiday_Update(selectedId, formData);
        toast.success("Holiday updated");
      } else {
        await Admin_Create_Holiday(formData);
        toast.success("Holiday created");
      }

      setShowModal(false);
      loadHolidays();
    } catch (err) {
      toast.error(err?.data?.message || "Error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    try {
      await Admin_Holiday_Delete(id);
      toast.success("Deleted");
      loadHolidays();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= TYPE COLOR =================
  const getTypeColor = (type) => {
    if (type === "national") return "success";
    if (type === "festival") return "warning";
    return "secondary";
  };

  return (
    <AdminLayout>
      <div className="container">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4>Holiday Management</h4>

          <button   className="primary-button btn-sm small-add-button" onClick={openAdd}>
            <FiPlus /> Add Holiday
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <Spinner />
        ) : (
          <Table  striped
          bordered
          hover
          responsive
          className="table-smaller custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {holidays.map((h, i) => (
                <tr key={h._id}>
                  <td>{i + 1}</td>
                  <td>{h.name}</td>
                  <td>{h.date?.slice(0, 10)}</td>

                  <td>
                    <span className={`badge bg-${getTypeColor(h.type)}`}>
                      {h.type}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <FiEdit
                        className="text-warning"
                        role="button"
                        onClick={() => openEdit(h)}
                      />

                      <FiTrash
                        className="text-danger"
                        role="button"
                        onClick={() => handleDelete(h._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">
              {isEdit ? "Edit Holiday" : "Add Holiday"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="company">Company</option>
                  <option value="festival">Festival</option>
                  <option value="national">National</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <button
                className="secondary-button btn-sm small-add-button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>

            <button
                className="primary-button btn-sm small-add-button"
              onClick={handleSubmit}
            >
              {isEdit ? "Update" : "Save"}
            </button>
          </Modal.Footer>
        </Modal>

        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </AdminLayout>
  );
};

export default Admin_Holiday;
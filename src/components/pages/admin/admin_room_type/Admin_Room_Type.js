import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Create_Room_Type,
  Admin_Get_Room_Type,
  Admin_Room_Type_Delete,
  Admin_Room_Type_Update,
} from "../../../../api/admin/Admin";
import { toast, ToastContainer } from "react-toastify";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";

const Admin_Room_Type = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
  });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  // ✅ Fetch
  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Room_Type(page, limit);
      setRoomTypes(res.data.data || []);
      setTotal(res.data.total);
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [page]);

  // ✅ Create
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await Admin_Create_Room_Type(formData);
      toast.success(res.data.message);
      setShowModal(false);
      setFormData({ name: "", description: "", basePrice: "" });
      fetchRoomTypes();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room type?")) return;
    try {
      const res = await Admin_Room_Type_Delete(id);
      toast.success(res.data.message);
      fetchRoomTypes();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      basePrice: item.basePrice || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateRoomType = async () => {
    try {
      const res = await Admin_Room_Type_Update(editId, formData);
      toast.success(res.data.message || "Updated successfully");
      setShowEditModal(false);
      fetchRoomTypes();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h5>Room Type Management</h5>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={() => setShowModal(true)}
          >
            + Add Room Type
          </button>
        </div>

        <ToastContainer />

        {loading ? (
          <div className="text-center">
            <Spinner />
          </div>
        ) : (
          <Table striped bordered hover responsive className="table-smaller custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.length > 0 ? (
                roomTypes.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.description || "-"}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="d-flex p-3 gap-2">
                      <button
                        className="secondary-button btn-sm small-add-button"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="primary-button btn-sm small-add-button"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No room types found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        {/* Pagination */}
        <div className="d-flex justify-content-center">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            <TbPlayerTrackPrevFilled />
          </button>

          <span className="mx-2">
            {page} / {totalPages || 1}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <TbPlayerTrackNextFilled />
          </button>
        </div>
      </div>

      {/* Create Room Type Modal ------------------> */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Add Room Type</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-form">
          <Form onSubmit={handleCreate}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Form.Group>

            <div className="d-flex p-3 gap-2">
              <button
                type="button"
                className="secondary-button btn-sm small-add-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button btn-sm small-add-button">
                Save
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* =============== Edit Room Type Modal =============== */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Edit Room Type</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form>
            {/* ✅ Row 1 – Name + Price */}
            <div className="row">
              <div className="col-12">
                <Form.Group className="mb-2">
                  <Form.Label className="small-label">
                    Room Type Name
                  </Form.Label>
                  <Form.Control
                    name="name"
                    className="small-input"
                    value={formData.name}
                    onChange={updateField}
                    placeholder="Enter room type"
                  />
                </Form.Group>
              </div>

             
            </div>

            {/* ✅ Description */}
            <Form.Group className="mb-2">
              <Form.Label className="small-label">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                className="small-input"
                value={formData.description}
                onChange={updateField}
                placeholder="Enter description"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>

          <button
            className="primary-button btn-sm small-add-button"
            onClick={handleUpdateRoomType}
          >
            Update Room Type
          </button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Room_Type;

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Get_List,
  Admin_Delete,
  Admin_Register,
  Admin_Get_Role_List,
} from "../../../../api/admin/Admin";
import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin_List = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // ✅ Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_List();
      setAdmins(res.data.data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error(err.response?.data?.message || "Error fetching admins");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Role_List();
      setRoles(res.data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error(err.response?.data?.message || "Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  // ✅ Delete admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await Admin_Delete(id);
      toast.success("Admin deleted successfully");
      fetchAdmins();
    } catch (err) {
      console.error("Error deleting admin:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // ✅ Create new admin
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await Admin_Register(formData);
      toast.success("Admin created successfully");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "" });
      fetchAdmins();
    } catch (err) {
      console.error("Error creating admin:", err);
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Admin List</h5>
          <button  className="primary-button btn-sm small-add-button" onClick={() => setShowModal(true)}>+ Create Admin</button>
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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin, idx) => (
                  <tr key={admin._id}>
                    <td>{idx + 1}</td>
                    <td>{admin.name || "-"}</td>
                    <td>{admin.email}</td>
                    <td>{admin.role?.name || admin.role || "-"}</td>
                    <td>{admin.role?.description || "-"}</td>
                    <td>
                      {admin.role?.permissions?.length > 0
                        ? admin.role.permissions
                            .map(
                              (perm) =>
                                `${perm.module} (${perm.actions.join(", ")})`
                            )
                            .join("; ")
                        : "-"}
                    </td>
                    <td>
                      {admin.role?.name !== "super_admin" && (
                        
                        <FaTrash className="btn-primary"  onClick={() => handleDelete(admin._id)}/>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* ✅ Create Admin Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Create New Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-form">
          <Form onSubmit={handleCreate}>
            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </Form.Group>

            {/* ✅ Role Field (Dynamic Dropdown) */}
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
              >
                <option value="">-- Select Role --</option>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading roles...</option>
                )}
              </Form.Select>
            </Form.Group>

            
              <Modal.Footer>
              <button className="secondary-button btn-sm small-add-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>{" "}
              <button className="primary-button btn-sm small-add-button" type="submit">
                Create
              </button>
              </Modal.Footer>
          
          </Form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_List;

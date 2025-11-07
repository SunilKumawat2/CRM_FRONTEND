import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Create_Role,
  Admin_Role_Delete,
  Admin_Get_Role_List,
  Admin_Role_Update,
} from "../../../../api/admin/Admin";

const Admin_Role_List = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const modules = ["Dashboard", "Inquiries", "Roles", "Admins", "Rooms", "Settings"];
  const actions = ["view", "create", "edit", "delete"];
  const [permissions, setPermissions] = useState({});

  // ✅ Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Role_List();
      setRoles(res.data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      alert(err.response?.data?.message || "Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a role name");
      return;
    }
    try {
      const res = await Admin_Create_Role(formData);
      alert(res.data.message || "Role created successfully");
      setShowModal(false);
      setFormData({ name: "", description: "" });
      fetchRoles();
    } catch (err) {
      console.error("Error creating role:", err);
      alert(err.response?.data?.message || "Failed to create role");
    }
  };

  // ✅ Delete role
  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await Admin_Role_Delete(id);
      alert(res.data?.message || "Role deleted successfully");
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      alert(err.response?.data?.message || "Failed to delete role");
    }
  };

  // ✅ Open permissions modal
  const handleOpenPermissions = (role) => {
    setSelectedRole(role);
    const permsObj = {};
    modules.forEach((mod) => {
      permsObj[mod] = role.permissions?.find((p) => p.module === mod)?.actions || [];
    });
    setPermissions(permsObj);
    setShowPermModal(true);
  };

  // ✅ Toggle permission checkbox
  const togglePermission = (module, action) => {
    setPermissions((prev) => {
      const newActions = prev[module].includes(action)
        ? prev[module].filter((a) => a !== action)
        : [...prev[module], action];
      return { ...prev, [module]: newActions };
    });
  };

  // ✅ Save updated permissions
const handleSavePermissions = async () => {
  try {
    if (!selectedRole) return;
    const payload = Object.keys(permissions).map((mod) => ({
      module: mod,
      actions: permissions[mod],
    }));
    const res = await Admin_Role_Update(selectedRole._id, { permissions: payload });
    alert(res.data.message || "Permissions updated successfully");
    setShowPermModal(false);
    fetchRoles(); // Refresh role list
  } catch (err) {
    console.error("Error updating permissions:", err);
    alert(err.response?.data?.message || "Failed to update permissions");
  }
};

useEffect(() => {
  fetchRoles();
}, []);

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Role Management</h5>
          <button className="primary-button btn-sm small-add-button" onClick={() => setShowModal(true)}>+ Create Role</button>
        </div>

        <Table striped bordered hover responsive className="table-smaller">
          <thead>
            <tr>
              <th>#</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {roles?.length > 0 ? (
              roles?.map((role, index) => (
                <tr key={role?._id}>
                  <td>{index + 1}</td>
                  <td>{role?.name}</td>
                  <td>{role?.description || "-"}</td>
                  <td>{new Date(role?.createdAt).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenPermissions(role)}
                    >
                      Permissions
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteRole(role._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  {loading ? "Loading roles..." : "No roles found"}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* ✅ Create Role Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateRole}>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter role name (e.g., Manager)"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Short description of role"
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ✅ Permissions Modal */}
      <Modal show={showPermModal} onHide={() => setShowPermModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Permissions: {selectedRole?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modules.map((mod) => (
            <div key={mod} className="mb-2">
              <strong>{mod}</strong>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {actions.map((act) => (
                  <Form.Check 
                    key={act}
                    type="checkbox"
                    label={act}
                    checked={permissions[mod]?.includes(act) || false}
                    onChange={() => togglePermission(mod, act)}
                  />
                ))}
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePermissions}>Save</Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Role_List;

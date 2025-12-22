import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Create_Role,
  Admin_Role_Delete,
  Admin_Get_Role_List,
  Admin_Role_Update,
} from "../../../../api/admin/Admin";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import { ToastContainer, toast } from "react-toastify";


const Admin_Role_List = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const modules = [
    "Dashboard",
    "Inquiries",
    "Roles",
    "Admins",
    "Rooms",
    "Settings",
  ];
  const actions = ["view", "create", "edit", "delete"];
  const [permissions, setPermissions] = useState({});
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  // ✅ Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Role_List(page, limit);
      setRoles(res.data.data || []);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error(err.response?.data?.message || "Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Please enter a role name");
      return;
    }
    try {
      const res = await Admin_Create_Role(formData);
      toast.success(res.data.message || "Role created successfully");
      setShowModal(false);
      setFormData({ name: "", description: "" });
      fetchRoles();
    } catch (err) {
      console.error("Error creating role:", err);
      toast.error(err.response?.data?.message || "Failed to create role");
    }
  };

  // ✅ Delete role
  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await Admin_Role_Delete(id);
      toast.success(res.data?.message || "Role deleted successfully");
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
  };

  // ✅ Open permissions modal
  const handleOpenPermissions = (role) => {
    setSelectedRole(role);
    const permsObj = {};
    modules.forEach((mod) => {
      permsObj[mod] =
        role.permissions?.find((p) => p.module === mod)?.actions || [];
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
      const res = await Admin_Role_Update(selectedRole._id, {
        permissions: payload,
      });
      toast.success(res.data.message || "Permissions updated successfully");
      setShowPermModal(false);
      fetchRoles(); // Refresh role list
    } catch (err) {
      console.error("Error updating permissions:", err);
      toast.error(err.response?.data?.message || "Failed to update permissions");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Role Management</h5>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={() => setShowModal(true)}
          >
            + Create Role
          </button>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
     {
      loading ? (
 <div className="text-center my-4">
            <Spinner animation="border" /> <p>Loading...</p>
          </div>
      ):(
 <Table striped bordered hover responsive className="table-smaller custom-table">
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
                  <td className="d-flex p-3 gap-2">
                    <button
                      className="primary-button btn-sm small-add-button"
                      onClick={() => handleOpenPermissions(role)}
                    >
                      Permissions
                    </button>
                    <button
                      className="secondary-button btn-sm small-add-button"
                      onClick={() => handleDeleteRole(role._id)}
                    >
                      Delete
                    </button>
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
      )
     }
       

        <div className="pagination-container d-flex justify-content-center mt-3">
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <TbPlayerTrackPrevFilled size={20} />
          </button>

          <span className="pagination-info">
            Page {page} / {totalPages || 1}
          </span>

          <button
            className="pagination-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <TbPlayerTrackNextFilled size={20} />
          </button>
        </div>

      </div>

      {/* ✅ Create Role Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">
            Create New Role
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-form">
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
            <Modal.Footer>
              <button
                onClick={() => setShowModal(false)}
                className="secondary-button btn-sm small-add-button"
              >
                Cancel
              </button>
              <button
                className="primary-button btn-sm small-add-button"
                type="submit"
              >
                Create
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ✅ Permissions Modal */}
      <Modal
        show={showPermModal}
        onHide={() => setShowPermModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Manage Permissions: {selectedRole?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-view-modal">
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
          <button
            className="secondary-button btn-sm small-add-button"
            onClick={() => setShowPermModal(false)}
          >
            Cancel
          </button>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={handleSavePermissions}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Role_List;

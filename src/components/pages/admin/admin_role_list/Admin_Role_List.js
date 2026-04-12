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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Admin_Role_List = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const modules = [
    { name: "Dashboard", slug: "dashboard" },
    { name: "Inquiries", slug: "inquiries" },
    { name: "Roles", slug: "roles" },
    { name: "Admins", slug: "admins" },
    { name: "Rooms", slug: "rooms" },
    { name: "Room Types", slug: "room_types" },
    { name: "Guests", slug: "guests" },
    { name: "HouseKeeping", slug: "housekeeping" },
    { name: "Staff Attendance", slug: "staff_attendance" },
    { name: "Invoice", slug: "invoice" },
    { name: "Valet Parking", slug: "valet_parking" },
    { name: "Event Package", slug: "event_package" },
    { name: "Catering", slug: "catering" },
    { name: "User Feedback", slug: "user_feedback" },
    { name: "Daily Reports", slug: "daily_reports" },
    { name: "Monthly Reports", slug: "monthly_reports" },
    { name: "Occupancy Reports", slug: "occupancy_reports" },
    { name: "Bookings", slug: "bookings" },
    { name: "Settings", slug: "settings" },
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
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, "_");
  // ✅ Open permissions modal
  const handleOpenPermissions = (role) => {
    setSelectedRole(role);
    const permsObj = {};
    modules.forEach((mod) => {
      permsObj[mod.name] =
        role.permissions?.find((p) => normalize(p.module) === mod.slug)
          ?.actions || [];
    });
    setPermissions(permsObj);
    setShowPermModal(true);
  };

  // ✅ Toggle permission checkbox
  const togglePermission = (moduleName, action) => {
    setPermissions((prev) => {
      const current = prev[moduleName] || [];

      const newActions = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      return { ...prev, [moduleName]: newActions };
    });
  };

  // ✅ Save updated permissions
  const handleSavePermissions = async () => {
    try {
      if (!selectedRole) return;
      const payload = modules.map((mod) => ({
        module: mod.slug,
        actions: permissions[mod.name] || [],
      }));
      const res = await Admin_Role_Update(selectedRole._id, {
        permissions: payload,
      });
      toast.success(res.data.message || "Permissions updated successfully");
      setShowPermModal(false);
      fetchRoles(); // Refresh role list
    } catch (err) {
      console.error("Error updating permissions:", err);
      toast.error(
        err.response?.data?.message || "Failed to update permissions",
      );
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  // <---------- Export To Excel -------------->
  const exportToExcel = () => {
    if (!roles.length) return;

    const data = roles.map((role, index) => ({
      "#": index + 1,
      "Role Name": role.name,
      Description: role.description || "-",
      "Created Date": new Date(role.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "Roles_Report.xlsx");
  };
  // <----------- Export to PDF ---------------->
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = ["#", "Role Name", "Description", "Created Date"];

    const tableRows = roles.map((role, index) => [
      index + 1,
      role.name,
      role.description || "-",
      new Date(role.createdAt).toLocaleString(),
    ]);

    doc.text("Roles Report", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Roles_Report.pdf");
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Role Management</h5>
          <div className="d-flex gap-2">
            <button
              className="primary-button btn-sm small-add-button"
              onClick={() => setShowModal(true)}
            >
              + Create Role
            </button>

            <button
              className="green-button btn-sm small-add-button"
              onClick={exportToExcel}
            >
              Export Excel
            </button>

            <button
              className="red-button btn-sm small-add-button"
              onClick={exportToPDF}
            >
              Export PDF
            </button>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" /> <p>Loading...</p>
          </div>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className="table-smaller custom-table"
          >
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
        )}

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
          <Modal.Title className="small-form-title">
            Manage Permissions: {selectedRole?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-view-modal">
          {modules.map((mod) => (
            <div key={mod.slug}>
              <strong>{mod.name}</strong>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {actions.map((act) => (
                  <Form.Check
                    key={act}
                    type="checkbox"
                    label={act}
                    checked={permissions[mod.name]?.includes(act) || false}
                    onChange={() => togglePermission(mod.name, act)}
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

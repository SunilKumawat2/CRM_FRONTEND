import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Get_Staff,
  Admin_Create_Staff,
  Admin_Delete_Staff,
} from "../../../../api/admin/Admin"; // adjust path
import { Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const Admin_Staff = () => {
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    shift: "",
    salary: "",
  });

  const [image, setImage] = useState(null);

  // ✅ Fetch Staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_Staff();
      setStaff(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ✅ Create Staff
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (image) {
        data.append("profileImage", image);
      }

      await Admin_Create_Staff(data);

      toast.success("Staff created successfully");
      setShowModal(false);

      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        shift: "",
        salary: "",
      });

      setImage(null);

      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  // ✅ Delete Staff
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff?")) return;

    try {
      await Admin_Delete_Staff(id);
      toast.success("Deleted successfully");
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h5>Staff List</h5>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={() => setShowModal(true)}
          >
            + Add Staff
          </button>
        </div>

        <ToastContainer />

        {loading ? (
          <div className="text-center">
            <Spinner />
          </div>
        ) : (
          <Table striped bordered hover responsive className="table-smaller">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {staff?.length > 0 ? (
                staff?.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>{item.role}</td>
                    <td>{item.shift}</td>
                    <td>
                      <FaTrash
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => handleDelete(item._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No staff found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* ✅ Create Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Add Staff</Modal.Title>
        </Modal.Header>

        <Modal.Body className="small-form">
          <Form onSubmit={handleCreate}>
            {/* 🔹 Row 1 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* 🔹 Row 2 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
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
                    <option value="housekeeping">Housekeeping</option>
                    <option value="reception">Reception</option>
                    <option value="manager">Manager</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* 🔹 Row 3 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    <option value="">-- Select Department --</option>
                    <option value="front_office">Front Office</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Shift</Form.Label>
                  <Form.Select
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                  >
                    <option value="">-- Select Shift --</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* 🔹 Row 4 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Salary"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end">
              <button
                className="primary-button btn-sm small-add-button"
                type="submit"
              >
                Create
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Staff;

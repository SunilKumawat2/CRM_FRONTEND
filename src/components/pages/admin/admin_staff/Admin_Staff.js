import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Get_Staff,
  Admin_Create_Staff,
  Admin_Delete_Staff,
  Admin_Get_Shifts,
} from "../../../../api/admin/Admin"; // adjust path
import { Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const Admin_Staff = () => {
  const [shifts, setShifts] = useState([]);
  console.log("staff_shift", shifts);
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

    joiningDate: "",
    leavingDate: "",
    experienceYears: "",

    employeeCode: "",
    employmentType: "",

    idProofType: "",
    idProofNumber: "",

    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",

    currentAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [idProofImage, setIdProofImage] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [previousExperiences, setPreviousExperiences] = useState([
    {
      companyName: "",
      role: "",
      years: "",
    },
  ]);

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

  // ✅ Create Staff
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Append Text Fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Profile Image
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      // ID Proof Image
      if (idProofImage) {
        data.append("idProofImage", idProofImage);
      }

      // Multiple Documents
      if (documents.length > 0) {
        for (let i = 0; i < documents.length; i++) {
          data.append("documents", documents[i]);
        }
      }

      await Admin_Create_Staff(data);

      toast.success("Staff created successfully");

      setShowModal(false);

      fetchStaff();

      // Reset Form
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        shift: "",
        salary: "",

        joiningDate: "",
        leavingDate: "",
        experienceYears: "",

        employeeCode: "",
        employmentType: "",

        idProofType: "",
        idProofNumber: "",

        emergencyName: "",
        emergencyRelation: "",
        emergencyPhone: "",

        currentAddress: "",
        permanentAddress: "",
        city: "",
        state: "",
        pincode: "",
      });

      setProfileImage(null);
      setIdProofImage(null);
      setDocuments([]);
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
                <th>Department</th>
                <th>Employment Type</th>
                <th>Experience</th>
                <th>Employee Code</th>
                <th>Joining Date</th>
                <th>Leaving Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {staff?.length > 0 ? (
                staff?.map((item, index) => (
                  <tr key={item?._id}>
                    <td>{index + 1}</td>
                    <td>{item?.name}</td>
                    <td>{item?.email}</td>
                    <td>{item?.phone}</td>
                    <td>{item?.role}</td>
                    <td>{item?.shift}</td>
                    <td>{item?.department}</td>
                    <td>{item?.employmentType}</td>
                    <td>{item?.experienceYears}</td>
                    <td>{item?.employeeCode}</td>
                    <td>
                      {item?.joiningDate
                        ? new Date(item?.joiningDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td>
                      {item?.leavingDate
                        ? new Date(item?.leavingDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
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
      <Modal
        size="xl"
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
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
                    {shifts?.map((shifts_result, index) => {
                      return (
                        <>
                          <option value="morning">
                            {shifts_result?.name} ({shifts_result?.startTime} to{" "}
                            {shifts_result?.endTime})
                          </option>
                        </>
                      );
                    })}
                    {/* <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option> */}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Joining Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        joiningDate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (Years)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Experience"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Proof Type</Form.Label>

                  <Form.Select
                    value={formData.idProofType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        idProofType: e.target.value,
                      })
                    }
                  >
                    <option value="">Select</option>
                    <option value="aadhar">Aadhar</option>
                    <option value="pan">PAN</option>
                    <option value="passport">Passport</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Proof Number</Form.Label>

                  <Form.Control
                    placeholder="ID Number"
                    value={formData.idProofNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        idProofNumber: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>

                  <Form.Control
                    type="file"
                    onChange={(e) => setProfileImage(e.target.files[0])}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Proof Image</Form.Label>

                  <Form.Control
                    type="file"
                    onChange={(e) => setIdProofImage(e.target.files[0])}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Documents</Form.Label>

                  <Form.Control
                    type="file"
                    multiple
                    onChange={(e) => setDocuments(e.target.files)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee Code</Form.Label>

                  <Form.Control
                    placeholder="Employee Code"
                    value={formData.employeeCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employeeCode: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employment Type</Form.Label>

                  <Form.Select
                    value={formData.employmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentType: e.target.value,
                      })
                    }
                  >
                    <option value="">Select</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Leaving Date</Form.Label>

                  <Form.Control
                    type="date"
                    value={formData.leavingDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leavingDate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Name</Form.Label>

                  <Form.Control
                    placeholder="Emergency Name"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyName: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Relation</Form.Label>

                  <Form.Control
                    placeholder="Relation"
                    value={formData.emergencyRelation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyRelation: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Phone</Form.Label>

                  <Form.Control
                    placeholder="Phone"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyPhone: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Address</Form.Label>

                  <Form.Control
                    placeholder="Current Address"
                    value={formData.currentAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAddress: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Permanent Address</Form.Label>

                  <Form.Control
                    placeholder="Permanent Address"
                    value={formData.permanentAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permanentAddress: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>

                  <Form.Control
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>

                  <Form.Control
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        state: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Pincode</Form.Label>

                  <Form.Control
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pincode: e.target.value,
                      })
                    }
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

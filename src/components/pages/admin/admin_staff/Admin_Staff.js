import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Get_Staff,
  Admin_Create_Staff,
  Admin_Delete_Staff,
  Admin_Get_Shifts,
  Admin_Get_Hotel_Site_Settings,
} from "../../../../api/admin/Admin"; // adjust path
import { Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { FaTrash, FaEye, FaUserTie, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { IMG_BASE_URL } from "../../../../config/Config";
import user_icons from "../../../../assets/images/user_icons.jpg"
import { FaFileAlt } from "react-icons/fa";

const Admin_Staff = () => {
  const [shifts, setShifts] = useState([]);
  const [hotelsetting, setHotelSetting] = useState([]);
  console.log("staff_shift", hotelsetting);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  console.log("selectedStaff_selectedStaff", selectedStaff)
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

  const [showExperienceModal, setShowExperienceModal] = useState(false);
 const [gethotelsite,setGetHotelSite] = useState({})
  const [previousExperiences, setPreviousExperiences] = useState([
    {
      companyName: "",
      role: "",
      years: "",
    },
  ]);

  const handleView = (staffData) => {
    setSelectedStaff(staffData);
    setShowViewModal(true);
  };

  const handleExperienceLetter = (staff) => {
    setSelectedStaff(staff);
    setShowExperienceModal(true);
  };

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

  // ================= LOAD =================
  const loadHotelSiteSettings = async () => {
    setLoading(true);
    try {
      const res = await Admin_Get_Hotel_Site_Settings();
      setHotelSetting(res.data.data);
    } catch (err) {
      toast.error("Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotelSiteSettings();
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

  const formatText = (text) => {
    if (!text) return "-";

    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
                      <div className="d-flex align-items-center gap-3">

                        {/* VIEW */}
                        <FaEye
                          size={18}
                          style={{
                            cursor: "pointer",
                            color: "#0d6efd",
                          }}
                          onClick={() => handleView(item)}
                        />

                        {/* EXPERIENCE LETTER */}
                        <FaFileAlt
                          className="action-icon text-success"
                          onClick={() => handleExperienceLetter(item)}
                        />

                        {/* DELETE */}
                        <FaTrash
                          size={16}
                          style={{
                            cursor: "pointer",
                            color: "red",
                          }}
                          onClick={() => handleDelete(item._id)}
                        />
                      </div>
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
              <Col md={3}>
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

              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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

              <Col md={3}>
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
              <Col md={3}>
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

              <Col md={3}>
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
              <Col md={3}>
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

              <Col md={3}>
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
              <Col md={3}>
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

              <Col md={3}>
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

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setProfileImage(e.target.files[0])}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Proof Image</Form.Label>

                  <Form.Control
                    type="file"
                    onChange={(e) => setIdProofImage(e.target.files[0])}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Documents</Form.Label>

                  <Form.Control
                    type="file"
                    multiple
                    onChange={(e) => setDocuments(e.target.files)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
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
            </Row>

            <Row>
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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
            </Row>
            <Row>

              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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


      {/* ================= VIEW STAFF MODAL ================= */}

      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          {/* <Modal.Title className="fw-bold text-primary small-form-title">
            Staff Details
          </Modal.Title> */}
        </Modal.Header>

        <Modal.Body className="small-view-modal">
          {selectedStaff && (
            <div className="container-fluid">

              {/* TOP PROFILE SECTION */}
              <div
                className="p-1 rounded-4 mb-1"
                style={{
                  background: "linear-gradient(135deg, #4e85d7, #4e85d7)",
                  color: "#fff",
                }}
              >
                <Row className="align-items-center">
                  <Col md={2} className="text-center">
                    {
                      selectedStaff?.profileImage ? (
                        <img
                          src={`${IMG_BASE_URL}${selectedStaff?.profileImage}`}
                          alt="profile"
                          className="img-fluid rounded-circle border border-3 border-white"
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <img
                          src={user_icons}
                          alt="profile"
                          className="img-fluid rounded-circle border border-3 border-white"
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                      )
                    }

                  </Col>

                  <Col md={10}>
                    <h4 className="fw-bold mb-1">
                      {selectedStaff?.name}
                    </h4>

                    <p className="mb-2">
                      {formatText(selectedStaff?.role)} ({formatText(selectedStaff?.employmentType)})
                    </p>

                    <div className="d-flex flex-wrap gap-4 mt-3">

                      <div>
                        <FaEnvelope className="me-2" />
                        {selectedStaff?.email}
                      </div>

                      <div>
                        <FaPhoneAlt className="me-2" />
                        {selectedStaff?.phone}
                      </div>

                      <div>
                        <FaUserTie className="me-2" />
                        {formatText(selectedStaff?.department)}
                      </div>

                    </div>
                  </Col>
                </Row>
              </div>

              {/* DETAILS SECTION */}
              <Row>

                {/* EMPLOYMENT DETAILS */}
                <Col md={4}>
                  <div className="shadow-sm border-0 rounded-4 mb-4 overflow-hidden bg-white">

                    <div
                      className="px-4 py-3 text-white fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
                        fontSize: "17px",
                      }}
                    >
                      Employment Details
                    </div>

                    <div className="p-3">
                      <Table bordered hover responsive className="mb-0 align-middle">
                        <tbody>

                          <tr>
                            <th width="45%">Employee Code</th>
                            <td>{selectedStaff?.employeeCode || "-"}</td>
                          </tr>

                          <tr>
                            <th>Experience</th>
                            <td>
                              {selectedStaff?.experienceYears || 0} Years
                            </td>
                          </tr>

                          <tr>
                            <th>Shift</th>
                            <td>{formatText(selectedStaff?.shift || "-")}</td>
                          </tr>

                          <tr>
                            <th>Joining Date</th>
                            <td>
                              {selectedStaff?.joiningDate
                                ? new Date(
                                  selectedStaff?.joiningDate
                                ).toLocaleDateString("en-GB")
                                : "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Leaving Date</th>
                            <td>
                              {selectedStaff?.leavingDate
                                ? new Date(
                                  selectedStaff?.leavingDate
                                ).toLocaleDateString("en-GB")
                                : "-"}
                            </td>
                          </tr>

                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Col>

                {/* PERSONAL DETAILS */}
                <Col md={4}>
                  <div className="shadow-sm border-0 rounded-4 mb-4 overflow-hidden bg-white">

                    <div
                      className="px-4 py-3 text-white fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #198754, #157347)",
                        fontSize: "17px",
                      }}
                    >
                      Personal Details
                    </div>

                    <div className="p-3">
                      <Table bordered hover responsive className="mb-0 align-middle">
                        <tbody>

                          <tr>
                            <th width="45%">ID Proof Type</th>
                            <td>
                              {formatText(selectedStaff?.idProof?.type || "-")}
                            </td>
                          </tr>

                          <tr>
                            <th>ID Proof Number</th>
                            <td>
                              {selectedStaff?.idProof?.number || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Emergency Name</th>
                            <td>
                              {selectedStaff?.emergencyContact?.name || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Emergency Phone</th>
                            <td>
                              {selectedStaff?.emergencyContact?.phone || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Relation</th>
                            <td>
                              {selectedStaff?.emergencyContact?.relation || "-"}
                            </td>
                          </tr>

                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Col>

                {/* ADDRESS DETAILS */}
                <Col md={4}>
                  <div className="shadow-sm border-0 rounded-4 mb-4 overflow-hidden bg-white">

                    <div
                      className="px-4 py-3 text-white fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #6f42c1, #5a32a3)",
                        fontSize: "17px",
                      }}
                    >
                      Address Details
                    </div>

                    <div className="p-3">
                      <Table bordered hover responsive className="mb-0 align-middle">
                        <tbody>

                          <tr>
                            <th width="45%">City</th>
                            <td>
                              {selectedStaff?.address?.city || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>State</th>
                            <td>
                              {selectedStaff?.address?.state || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Pin Code</th>
                            <td>
                              {selectedStaff?.address?.pincode || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Current Address</th>
                            <td>
                              {selectedStaff?.address?.currentAddress || "-"}
                            </td>
                          </tr>

                          <tr>
                            <th>Permanent Address</th>
                            <td>
                              {selectedStaff?.address?.permanentAddress || "-"}
                            </td>
                          </tr>

                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Col>

              </Row>

            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* EXPERIENCE LETTER MODAL */}

      <Modal
        show={showExperienceModal}
        onHide={() => setShowExperienceModal(false)}
        size="lg"
        centered
      >

        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">
            Experience Letter
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <div
            id="experience-letter"
            className="p-5 bg-white"
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
            }}
          >

            {/* COMPANY HEADER */}
            <div className="text-center mb-5">

              <h2 className="fw-bold text-primary">
                {hotelsetting?.name}
              </h2>

              <p className="mb-1">
                {hotelsetting?.address}
              </p>

              <p>
                {hotelsetting?.email}
              </p>

            </div>

            {/* DATE */}
            <div className="mb-4">
              <strong>Date:</strong>{" "}
              {new Date().toLocaleDateString("en-GB")}
            </div>

            {/* TITLE */}
            <div className="text-center mb-4">
              <h4 className="fw-bold text-decoration-underline">
                EXPERIENCE LETTER
              </h4>
            </div>

            {/* BODY */}
            <div style={{ lineHeight: "32px", fontSize: "16px" }}>

              <p>
                To Whom It May Concern,
              </p>

              <p>
                This is to certify that{" "}
                <strong>{selectedStaff?.name}</strong>
                {" "}was employed with{" "}
                <strong>{hotelsetting?.name}</strong>
                {" "}as a{" "}
                <strong>
                  {formatText(selectedStaff?.role)}
                </strong>
                {" "}in the{" "}
                <strong>
                  {formatText(selectedStaff?.department)}
                </strong>
                {" "}department.
              </p>

              <p>
                The employee worked with us from{" "}
                <strong>
                  {selectedStaff?.joiningDate
                    ? new Date(
                      selectedStaff?.joiningDate
                    ).toLocaleDateString("en-GB")
                    : "-"}
                </strong>
                {" "}to{" "}
                <strong>
                  {selectedStaff?.leavingDate
                    ? new Date(
                      selectedStaff?.leavingDate
                    ).toLocaleDateString("en-GB")
                    : "Present"}
                </strong>.
              </p>

              <p>
                During the employment period, the employee
                demonstrated professionalism, dedication,
                and excellent performance in assigned duties.
              </p>

              <p>
                We appreciate the contributions made by{" "}
                <strong>{selectedStaff?.name}</strong>
                {" "}and wish them success in future endeavors.
              </p>

            </div>

            {/* FOOTER */}
            <div className="mt-5">

              <p className="mb-5">
                Sincerely,
              </p>

              <h6 className="fw-bold mb-1">
                {hotelsetting?.hrName}
              </h6>

              <p>
                {hotelsetting?.name}
              </p>

            </div>

          </div>

        </Modal.Body>

        <Modal.Footer>

          <button
            className="btn btn-success"
            onClick={() => window.print()}
          >
            Print
          </button>

        </Modal.Footer>

      </Modal>
    </AdminLayout>
  );
};

export default Admin_Staff;

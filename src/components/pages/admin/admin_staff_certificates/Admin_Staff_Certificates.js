import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Create_Certificate,
  Admin_Get_Certificates,
  Admin_Get_Certificate_Details,
  Admin_Delete_Certificate,
  Admin_Get_Staff,
} from "../../../../api/admin/Admin";

import { toast } from "react-toastify";
import { Modal, Button, Table } from "react-bootstrap";
import { IMG_BASE_URL } from "../../../../config/Config";
import { FaEye } from "react-icons/fa";

const Admin_Staff_Certificates = () => {
  const [staffList, setStaffList] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [selectedCertificate, setSelectedCertificate] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    staffId: "",
    certificateType: "experience",
    remarks: "",
  });

  useEffect(() => {
    loadCertificates();
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const response = await Admin_Get_Staff();

      setStaffList(response.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCertificates = async () => {
    try {
      const response =
        await Admin_Get_Certificates();

      setCertificates(response.data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load certificates");
    }
  };

  const generateCertificate = async () => {
    try {
      if (!formData.staffId) {
        return toast.error("Select Staff");
      }

      const response =
        await Admin_Create_Certificate(formData);

      toast.success(response.data.message);

      setFormData({
        staffId: "",
        certificateType: "experience",
        remarks: "",
      });

      loadCertificates();
    } catch (err) {
      console.log(err);

      toast.error(
        err?.data?.message ||
        "Failed to generate certificate"
      );
    }
  };

  const viewCertificate = async (id) => {
    try {
      const response =
        await Admin_Get_Certificate_Details(id);

      setSelectedCertificate(response.data.data);

      setShowModal(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch certificate");
    }
  };

  const deleteCertificate = async (id) => {
    try {
      if (!window.confirm("Delete certificate?")) {
        return;
      }

      await Admin_Delete_Certificate(id);

      toast.success("Deleted successfully");

      loadCertificates();
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">

        {/* Generate Certificate */}

        <div className="card shadow mb-4">
          <div className="card-header">
            Generate Certificate
          </div>

          <div className="card-body">
            <div className="row">

              <div className="col-md-4">
                <label>Staff</label>

                <select
                  className="form-control"
                  value={formData.staffId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      staffId: e.target.value,
                    })
                  }
                >
                  <option value="">
                    Select Staff
                  </option>

                  {staffList.map((staff) => (
                    <option
                      key={staff._id}
                      value={staff._id}
                    >
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label>Certificate Type</label>

                <select
                  className="form-control"
                  value={formData.certificateType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificateType:
                        e.target.value,
                    })
                  }
                >
                  <option value="experience">
                    Experience
                  </option>

                  <option value="employment">
                    Employment
                  </option>

                  <option value="joining">
                    Joining
                  </option>

                  <option value="relieving">
                    Relieving
                  </option>

                  <option value="salary">
                    Salary
                  </option>
                </select>
              </div>

              <div className="col-md-3">
                <label>Remarks</label>

                <input
                  type="text"
                  className="form-control"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={generateCertificate}
                >
                  Generate
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Certificate List */}

        <div className="card shadow">
          <div className="card-header">
            Staff Certificates
          </div>

          <div className="card-body table-responsive">

            <Table striped bordered hover responsive className="table-smaller">
              <thead>
                <tr>
                  <th>Certificate No</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Issue Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No Certificates Found
                    </td>
                  </tr>
                ) : (
                  certificates.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.certificateNo}
                      </td>

                      <td>
                        {item.staff?.name}
                      </td>

                      <td>
                        {item.certificateType}
                      </td>

                      <td>
                        {new Date(
                          item.issueDate
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                        <FaEye
                          className="text-success"
                          size={17}
                          role="button"
                          onClick={() =>
                            viewCertificate(
                              item._id
                            )
                          }
                        />
                        {/* <FaEdit
                          className="text-warning"
                          size={17}
                          role="button"
                          onClick={() => handleEditClick(room)}
                        />
                        <FaTrash
                          className="text-danger"
                          size={17}
                          role="button"
                          onClick={() => handleDeleteRoom(room._id)}
                        /> */}
                        <FaEye
                          className="text-success"
                          size={17}
                          role="button"
                          onClick={() =>
                            viewCertificate(
                              item._id
                            )
                          }
                        />
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              viewCertificate(
                                item._id
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              deleteCertificate(
                                item._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </Table>

          </div>
        </div>

        {/* View Modal */}

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">
              Certificate Details
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-view-modal">

            {selectedCertificate && (
              <div
                id="certificate-print"
                className="bg-white p-4 rounded shadow-sm"
              >

                {/* Header */}

                <div className="text-center border-bottom pb-3 mb-4">
                  <img
                    src="/logo.png"
                    alt="logo"
                    style={{
                      height: "70px",
                      objectFit: "contain",
                    }}
                  />

                  <h3 className="fw-bold mt-2 mb-0">
                    HOTEL MANAGEMENT SYSTEM
                  </h3>

                  <p className="text-muted mb-0">
                    Employee Salary Certificate
                  </p>
                </div>

                {/* Employee Section */}

                <div className="row">

                  <div className="col-md-3 text-center">

                    <img
                      src={`${IMG_BASE_URL}/${selectedCertificate.staff?.profileImage}`}
                      alt="staff"
                      className="img-thumbnail"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "cover",
                      }}
                    />

                  </div>

                  <div className="col-md-9">

                    <table className="table table-bordered">

                      <tbody>

                        <tr>
                          <th width="35%">
                            Certificate No
                          </th>

                          <td>
                            {selectedCertificate.certificateNo}
                          </td>
                        </tr>

                        <tr>
                          <th>Employee Name</th>

                          <td>
                            {
                              selectedCertificate.staff?.name
                            }
                          </td>
                        </tr>

                        <tr>
                          <th>Employee Code</th>

                          <td>
                            {
                              selectedCertificate.staff?.employeeCode
                            }
                          </td>
                        </tr>

                        <tr>
                          <th>Designation</th>

                          <td>
                            {
                              selectedCertificate.staff?.role
                            }
                          </td>
                        </tr>

                        <tr>
                          <th>Department</th>

                          <td>
                            {
                              selectedCertificate.staff?.department
                            }
                          </td>
                        </tr>

                        <tr>
                          <th>Employment Type</th>

                          <td>
                            {
                              selectedCertificate.staff
                                ?.employmentType
                            }
                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* Salary Information */}

                <div className="card mt-4 border-success">

                  <div className="card-header bg-success text-white fw-bold">
                    Current Salary Information
                  </div>

                  <div className="card-body">

                    <div className="row">

                      <div className="col-md-6">

                        <h5 className="mb-3">
                          Current Monthly Salary
                        </h5>

                        <h2 className="text-success fw-bold">
                          ₹
                          {selectedCertificate.staff?.salary?.toLocaleString()}
                        </h2>

                      </div>

                      <div className="col-md-6">

                        <table className="table table-sm">

                          <tbody>

                            <tr>
                              <th>Joining Date</th>

                              <td>
                                {new Date(
                                  selectedCertificate.staff?.joiningDate
                                ).toLocaleDateString()}
                              </td>
                            </tr>

                            <tr>
                              <th>Experience</th>

                              <td>
                                {
                                  selectedCertificate.staff
                                    ?.experienceYears
                                }{" "}
                                Years
                              </td>
                            </tr>

                            <tr>
                              <th>Status</th>

                              <td>
                                <span className="badge bg-success">
                                  Active Employee
                                </span>
                              </td>
                            </tr>

                          </tbody>

                        </table>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Address */}

                {/* <div className="card mt-4">

        <div className="card-header fw-bold">
          Employee Address
        </div>

        <div className="card-body">

          <p className="mb-0">

            {
              selectedCertificate.staff?.address
                ?.currentAddress
            }

            {", "}

            {
              selectedCertificate.staff?.address
                ?.city
            }

            {", "}

            {
              selectedCertificate.staff?.address
                ?.state
            }

            {" - "}

            {
              selectedCertificate.staff?.address
                ?.pincode
            }

          </p>

        </div>

      </div> */}

                {/* Certificate Statement */}

                <div className="mt-4 p-3 border rounded bg-light">

                  <h5 className="fw-bold">
                    Salary Verification Certificate
                  </h5>

                  <p className="mb-0">

                    This is to certify that
                    <strong>
                      {" "}
                      {
                        selectedCertificate.staff?.name
                      }{" "}
                    </strong>

                    is employed with our organization as a

                    <strong>
                      {" "}
                      {
                        selectedCertificate.staff?.role
                      }{" "}
                    </strong>

                    and is currently drawing a gross monthly
                    salary of

                    <strong className="text-success">
                      {" "}
                      ₹
                      {
                        selectedCertificate.staff?.salary
                      }
                    </strong>

                    .

                    This certificate is issued upon the
                    employee's request for official purposes.

                  </p>

                </div>

                {/* Footer */}

                <div className="row mt-5">

                  <div className="col-md-6">
                    <p>
                      Generated By:
                      <br />
                      <strong>
                        {
                          selectedCertificate.generatedBy
                            ?.name
                        }
                      </strong>
                    </p>
                  </div>

                  <div className="col-md-6 text-end">

                    <div
                      style={{
                        height: "70px",
                      }}
                    />

                    <p className="fw-bold border-top pt-2">
                      Authorized Signature
                    </p>

                  </div>

                </div>

              </div>
            )}

          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                setShowModal(false)
              }
            >
              Close
            </Button>

            <Button
              variant="primary"
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </AdminLayout>
  );
};

export default Admin_Staff_Certificates;

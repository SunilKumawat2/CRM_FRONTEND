import React, { useEffect, useState } from "react";
import {
  Admin_Get_Salary_Slip_Summary,
  Admin_Get_salary_slip_details,
  Admin_Create_salary_slip,
  Admin_Get_Staff,
  Admin_Get_Salary_Slips
} from "../../../../api/admin/Admin";
import {
  Modal,
  Button,
  Table
} from "react-bootstrap";

import AdminLayout from "../admin_layout/Admin_Layout";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";

const Admin_Staff_Salary_Slip = () => {
  const [summary, setSummary] = useState({});
  const [selectedSlip, setSelectedSlip] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const loadSummary = async () => {
    try {
      const response = await Admin_Get_Salary_Slip_Summary();

      setSummary(response.data.data || {});
    } catch (err) {
      console.log(err);
      toast.error("Failed to load summary");
    }
  };


  const loadSalarySlips = async () => {
    try {
      const response =
        await Admin_Get_Salary_Slips();

      setSalarySlips(response.data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load salary slips");
    }
  };

  const loadStaff = async () => {
    try {
      const response = await Admin_Get_Staff();

      setStaffList(response.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    loadSummary();
    loadSalarySlips();
    loadStaff();
  }, []);

  const generateSalarySlip = async () => {
    try {
      if (
        !formData.staffId ||
        !formData.month ||
        !formData.year
      ) {
        return toast.error(
          "Please select staff, month and year"
        );
      }

      const response =
        await Admin_Create_salary_slip(formData);

      toast.success(
        response.data.message ||
        "Salary Slip Generated"
      );

      setSelectedSlip(response.data.data);

      loadSalarySlips();
      loadSummary();
    } catch (err) {
      console.log(err);

      toast.error(
        err?.data?.message ||
        "Failed to generate salary slip"
      );
    }
  };

  const getSlipDetails = async (id) => {
    try {
      const response =
        await Admin_Get_salary_slip_details(id);
      setSelectedSlip(response.data.data);
      setShowModal(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch details");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">

        {/* Summary Cards */}

        <div className="row mb-4">

          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6>Total Employees</h6>

                <h2>
                  {summary?.totalEmployees || 0}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6>Total Salary</h6>

                <h2>
                  ₹{summary?.totalSalary || 0}
                </h2>
              </div>
            </div>
          </div>

        </div>

        {/* Generate Salary Slip */}

        <div className="card mb-4">
          <div className="card-header">
            Generate Salary Slip
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
                <label>Month</label>

                <select
                  className="form-control"
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      month: e.target.value,
                    })
                  }
                >
                  {[...Array(12)].map((_, i) => (
                    <option
                      key={i + 1}
                      value={i + 1}
                    >
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label>Year</label>

                <input
                  type="number"
                  className="form-control"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={generateSalarySlip}
                >
                  Generate
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Salary Slip Details */}

        <div className="card mb-4">
          <div className="card-header">
            Salary Slips
          </div>

          <div className="card-body table-responsive">

            <Table striped bordered hover responsive className="table-smaller">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Net Salary</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {salarySlips.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No Salary Slips Found
                    </td>
                  </tr>
                ) : (
                  salarySlips.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.employeeName}
                      </td>

                      <td>
                        {item.month}
                      </td>

                      <td>
                        {item.year}
                      </td>

                      <td>
                        ₹{item.netSalary}
                      </td>

                      <td>
                        <FaEye  className="text-success"
                          size={17}
                          role="button"
                          onClick={() =>
                            getSlipDetails(item._id)
                          }
                          />
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </Table>

          </div>
        </div>

      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered className="small-view-modal"
      >
        <Modal.Header closeButton >
          <Modal.Title>
            Salary Slip Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {selectedSlip && (
            <>
              {/* Employee Info */}

              <div className="row mb-3">

                <div className="col-md-6">
                  <strong>Employee:</strong>
                  <br />
                  {selectedSlip.employeeName}
                </div>

                <div className="col-md-6">
                  <strong>Employee Code:</strong>
                  <br />
                  {selectedSlip.employeeCode}
                </div>

              </div>

              <div className="row mb-3">

                <div className="col-md-6">
                  <strong>Designation:</strong>
                  <br />
                  {selectedSlip.designation}
                </div>

                <div className="col-md-6">
                  <strong>Salary Month:</strong>
                  <br />
                  {selectedSlip.month}/{selectedSlip.year}
                </div>

              </div>

              <hr />

              {/* Attendance */}

              <h5 className="mb-3">
                Attendance Summary
              </h5>

              <div className="row mb-4">

                <div className="col-md-3">
                  Present:
                  <strong>
                    {" "}
                    {selectedSlip.summary?.present || 0}
                  </strong>
                </div>

                <div className="col-md-3">
                  Absent:
                  <strong>
                    {" "}
                    {selectedSlip.summary?.absent || 0}
                  </strong>
                </div>

                <div className="col-md-3">
                  Leave:
                  <strong>
                    {" "}
                    {selectedSlip.summary?.leave || 0}
                  </strong>
                </div>

                <div className="col-md-3">
                  Half Day:
                  <strong>
                    {" "}
                    {selectedSlip.summary?.halfDay || 0}
                  </strong>
                </div>

              </div>

              <hr />

              {/* Earnings */}

              <h5 className="mb-3 text-success">
                Earnings
              </h5>

              <table className="table table-bordered">
                <tbody>

                  <tr>
                    <td>Basic Salary</td>
                    <td>
                      ₹
                      {
                        selectedSlip.earnings
                          ?.basicSalary
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>Overtime Pay</td>
                    <td>
                      ₹
                      {
                        selectedSlip.earnings
                          ?.overtimePay
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>Bonus</td>
                    <td>
                      ₹
                      {
                        selectedSlip.earnings
                          ?.bonus
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>Gross Salary</td>
                    <td>
                      <strong>
                        ₹
                        {
                          selectedSlip.earnings
                            ?.grossSalary
                        }
                      </strong>
                    </td>
                  </tr>

                </tbody>
              </table>

              {/* Deductions */}

              <h5 className="mb-3 text-danger">
                Deductions
              </h5>

              <table className="table table-bordered">
                <tbody>

                  <tr>
                    <td>PF</td>
                    <td>
                      ₹
                      {
                        selectedSlip.deductions
                          ?.pf
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>ESI</td>
                    <td>
                      ₹
                      {
                        selectedSlip.deductions
                          ?.esi
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>Absent Deduction</td>
                    <td>
                      ₹
                      {
                        selectedSlip.deductions
                          ?.absentDeduction
                      }
                    </td>
                  </tr>

                  <tr>
                    <td>Total Deduction</td>
                    <td>
                      <strong>
                        ₹
                        {
                          selectedSlip.deductions
                            ?.totalDeduction
                        }
                      </strong>
                    </td>
                  </tr>

                </tbody>
              </table>

              {/* Net Salary */}

              <div className="alert alert-success text-center">
                <h4 className="mb-0">
                  Net Salary : ₹
                  {selectedSlip.netSalary}
                </h4>
              </div>
            </>
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

        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Staff_Salary_Slip;
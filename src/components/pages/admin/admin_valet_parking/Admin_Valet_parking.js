import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Table, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_create_valet_parking,
  Admin_Delete_valet_parking,
  Admin_Get_valet_parking,
  Admin_Update_valet_parking,
} from "../../../../api/admin/Admin";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

const Admin_Valet_parking = () => {
  const [show, setShow] = useState(false);
  const [parkingList, setParkingList] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [formData, setFormData] = useState({
    guestName: "",
    roomNumber: "",
    vehicleNumber: "",
    vehicleBrand: "",
    vehicleModel: "",
    color: "",
    parkingSlot: "",
    slipNumber: "",
    notes: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  console.log("editId_editId", editId)
  // ---------------- Modal handlers ----------------
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  // ---------------- Form change ----------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        guestName: formData.guestName,
        roomNumber: formData.roomNumber,
        vehicleNumber: formData.vehicleNumber,
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        color: formData.color,
        parkingSlot: formData.parkingSlot,
        slipNumber: formData.slipNumber,
        notes: formData.notes,
      };
      if (isEdit) {
        await Admin_Update_valet_parking(
          editId,
          payload
        );
        toast.success("Valet updated successfully");
      } else {
        await Admin_create_valet_parking(
          payload
        );
        toast.success(
          "Valet created successfully"
        );
      }
      handleClose();
      getParkingList();
    } catch (error) {
      console.error(error);
      if(error?.response?.data?.status == "403"){
        toast.error(error?.response?.data?.message);
        // alert(error?.response?.message)
      }
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true)
    setEditId(item._id);

    setFormData({
      guestName: item.guestName || "",
      roomNumber: item.roomNumber || "",
      vehicleNumber: item.vehicleNumber || "",
      vehicleBrand: item.vehicleBrand || "",
      vehicleModel: item.vehicleModel || "",
      color: item.color || "",
      parkingSlot: item.parkingSlot || "",
      slipNumber: item.slipNumber || "",
      notes: item.notes || "",
    });

    setShow(true);
  };

  const handleDeleteValet = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this valet parking record?"
    );

    if (!confirmDelete) return;
    try {
      const response = await Admin_Delete_valet_parking(id);
      if (response?.
        data?.status == "200") {
        // alert("handleDeleteValet_response", response?.data?.message)
        getParkingList();
      }
    } catch (err) {
      console.log(err)
    }
  };

  // ---------------- Get valet list ----------------
  const getParkingList = async () => {
    setIsloading(true);
    try {
      const res = await Admin_Get_valet_parking();
      setIsloading(false);
      setParkingList(res.data.data || []);
    } catch (error) {
      setIsloading(false);
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    if (!parkingList || parkingList.length === 0) return;

    const doc = new jsPDF();

    doc.text("Valet Parking Report", 14, 10);

    const tableColumn = [
      "No",
      "Guest",
      "Room",
      "Vehicle",
      "Brand",
      "Slot",
      "Slip",
      "Status",
      "In Time",
    ];

    const tableRows = parkingList.map((item, index) => [
      index + 1,
      item.guestName,
      item.roomNumber,
      item.vehicleNumber,
      item.vehicleBrand,
      item.parkingSlot,
      item.slipNumber,
      item.status,
      new Date(item.inTime).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Valet_Parking_Report.pdf"); // ✅ DOWNLOAD
  };

  const handleExportExcel = () => {
    if (!parkingList || parkingList.length === 0) return;

    const data = parkingList.map((item, index) => ({
      No: index + 1,
      Guest: item.guestName,
      Room: item.roomNumber,
      Vehicle: item.vehicleNumber,
      Brand: item.vehicleBrand,
      Slot: item.parkingSlot,
      Slip: item.slipNumber,
      Status: item.status,
      "In Time": new Date(item.inTime).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Valet Parking");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, "Valet_Parking_Report.xlsx"); // ✅ DOWNLOAD
  };

  useEffect(() => {
    getParkingList();
  }, []);

  return (
    <AdminLayout>

      <div className="container mt-4">
        <ToastContainer position="top-right" autoClose={2000} />
        {/* + Valet Button */}
        <div className="d-flex justify-content-end mb-3">
          <div className="d-flex gap-2">
            <button
              className="primary-button btn-sm small-add-button"
              onClick={handleShow}
            >
              + Valet
            </button>
            <button
              className="green-button btn-sm small-add-button"
              onClick={handleExportExcel}
            >
              Export Excel
            </button>
            <button
              className="red-button btn-sm small-add-button"
              onClick={handleExportPDF}
            >
              Export PDF
            </button>

          </div>

        </div>

        {/* ---------------- Table ---------------- */}
        {isloading ? (
          <div className="text-center my-4">
            <Spinner animation="border" /> <p>Loading...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive className="table-smaller">
            <thead>
              <tr>
              <th>Guest List</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Vehicle No</th>
                <th>Brand</th>
                <th>Slot</th>
                <th>Slip</th>
                <th>Status</th>
                <th>In Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {parkingList.length > 0 ? (
                parkingList.map((item,index) => (
                  <tr key={item._id}>
                     <td>{index+1}</td>
                    <td>{item.guestName}</td>
                    <td>{item.roomNumber}</td>
                    <td>{item.vehicleNumber}</td>
                    <td>{item.vehicleBrand}</td>
                    <td>{item.parkingSlot}</td>
                    <td>{item.slipNumber}</td>
                    <td>{item.status}</td>
                    <td>{new Date(item.inTime).toLocaleString()}</td>
                    <td> <FaEdit
                      className="text-warning"
                      size={17}
                      role="button"
                      onClick={() => handleEdit(item)}
                    />
                      <FaTrash className="text-danger"
                        size={17}
                        role="button"
                        onClick={() => handleDeleteValet(item?._id)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
      {/* ---------------- Modal ---------------- */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">
            Add Valet Parking
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="small-form">
            <div className="row">
              {[
                ["guestName", "Guest Name"],
                ["roomNumber", "Room Number"],
                ["vehicleNumber", "Vehicle Number"],
                ["vehicleBrand", "Vehicle Brand"],
                ["vehicleModel", "Vehicle Model"],
                ["color", "Color"],
                ["parkingSlot", "Parking Slot"],
                ["slipNumber", "Slip Number"],
              ].map(([name, label]) => (
                <div className="col-md-6 mb-3" key={name}>
                  <Form.Label>{label}</Form.Label>
                  <Form.Control
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="col-md-12 mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button
              type="button"
              className="secondary-button btn-sm small-add-button"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="primary-button btn-sm small-add-button"
              type="submit"
            >
              Save
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Valet_parking;

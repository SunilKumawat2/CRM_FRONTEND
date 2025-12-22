import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Table, Spinner } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Admin_create_valet_parking, Admin_Get_valet_parking } from "../../../../api/admin/Admin";

const Admin_Valet_parking = () => {
  const [show, setShow] = useState(false);
  const [parkingList, setParkingList] = useState([]);
 const [isloading,setIsloading] = useState(false)
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

  // ---------------- Submit valet ----------------
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

    console.log("Submit Data:", payload);

    // API call
    await Admin_create_valet_parking(payload);

    // Reset form
    setFormData({
      guestName: '',
      roomNumber: '',
      vehicleNumber: '',
      vehicleBrand: '',
      vehicleModel: '',
      color: '',
      parkingSlot: '',
      slipNumber: '',
      notes: '',
    });

    handleClose();
    getParkingList(); // Refresh table
  } catch (error) {
    console.error("Valet create error:", error);
  }
};


  // ---------------- Get valet list ----------------
  const getParkingList = async () => {
    setIsloading(true)
    try {
      const res = await Admin_Get_valet_parking();
      setIsloading(false)
      setParkingList(res.data.data || []);
    } catch (error) {
      setIsloading(false)
      console.error(error);
    }
  };

  useEffect(() => {
    getParkingList();
  }, []);

  return (
    <AdminLayout>
      <div className="container mt-4">
        {/* + Valet Button */}
        <div className="d-flex justify-content-end mb-3">
          <button className="primary-button btn-sm small-add-button" onClick={handleShow}>
            + Valet
          </button>
        </div>

        {/* ---------------- Table ---------------- */}
        {
          isloading ? (
 <div className="text-center my-4">
                        <Spinner animation="border" /> <p>Loading...</p>
                    </div>
          ):(
<Table striped bordered hover responsive className="table-smaller">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Vehicle No</th>
              <th>Brand</th>
              <th>Slot</th>
              <th>Slip</th>
              <th>Status</th>
              <th>In Time</th>
            </tr>
          </thead>
          <tbody>
            {parkingList.length > 0 ? (
              parkingList.map((item) => (
                <tr key={item._id}>
                  <td>{item.guestName}</td>
                  <td>{item.roomNumber}</td>
                  <td>{item.vehicleNumber}</td>
                  <td>{item.vehicleBrand}</td>
                  <td>{item.parkingSlot}</td>
                  <td>{item.slipNumber}</td>
                  <td>{item.status}</td>
                  <td>{new Date(item.inTime).toLocaleString()}</td>
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
          )
        }
        
      </div>
      {/* ---------------- Modal ---------------- */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="small-form-title">Add Valet Parking</Modal.Title>
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
            <button   type="button" className="secondary-button btn-sm small-add-button" onClick={handleClose}>
              Cancel
            </button>
            <button className="primary-button btn-sm small-add-button" type="submit">
              Save
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Valet_parking;

import React, { useEffect, useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import {
  Admin_Get_WeeklyOff,
  Admin_Create_WeeklyOff,
  Admin_WeeklyOff_Delete,
  Admin_WeeklyOff_Update,
} from "../../../../api/admin/Admin";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import AdminLayout from "../admin_layout/Admin_Layout";

const Admin_WeeklyOff = () => {
  const [weeklyOff, setWeeklyOff] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({ days: [] });

  const daysList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // LOAD
  const loadWeeklyOff = async () => {
    setLoading(true);
    try {
      const res = await Admin_Get_WeeklyOff();
      setWeeklyOff(res.data.data);
    } catch {
      toast.error("Failed to load weekly off");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyOff();
  }, []);

  // SELECT DAY
  const handleDayChange = (day) => {
    if (formData.days.includes(day)) {
      setFormData({
        ...formData,
        days: formData.days.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        days: [...formData.days, day],
      });
    }
  };

  const openAdd = () => {
    setIsEdit(false);
    setFormData({ days: [] });
    setShowModal(true);
  };

  const openEdit = () => {
    setIsEdit(true);
    setFormData({ days: weeklyOff?.days || [] });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await Admin_WeeklyOff_Update(weeklyOff._id, formData);
        toast.success("Updated");
      } else {
        await Admin_Create_WeeklyOff(formData);
        toast.success("Created");
      }

      setShowModal(false);
      loadWeeklyOff();
    } catch (err) {
      toast.error(err?.data?.message || "Error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete weekly off?")) return;

    try {
      await Admin_WeeklyOff_Delete(weeklyOff._id);
      toast.success("Deleted");
      setWeeklyOff(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="container">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4>Weekly Off Settings</h4>

          {!weeklyOff ? (
            <button className="primary-button btn-sm small-add-button" onClick={openAdd}>
              <FiPlus /> Set Weekly Off
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button className="primary-button btn-sm small-add-button" onClick={openEdit}>
                <FiEdit /> Edit
              </button>
              <button className="secondary-button btn-sm small-add-button" onClick={handleDelete}>
                <FiTrash /> Delete
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <Spinner />
        ) : weeklyOff ? (
          <div className="card shadow-sm p-4 border-0">

            <h6 className="mb-3 text-muted">Selected Weekly Off Days</h6>

            <div className="d-flex flex-wrap gap-2">
              {weeklyOff?.days?.map((day, i) => (
                <div
                  key={i}
                 className="primary-button btn-sm small-add-button"
                  style={{ fontSize: "13px" }}
                >
                  {day}
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="text-center text-muted">
            No weekly off set
          </div>
        )}

        {/* MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">
              {isEdit ? "Edit Weekly Off" : "Set Weekly Off"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-view-modal">
            <h6>Select Days</h6>

            <div className="d-flex flex-wrap gap-2 mt-3">
              {daysList.map((day) => (
                <div
                  key={day}
                  onClick={() => handleDayChange(day)}
                  style={{
                    cursor: "pointer",
                    padding: "8px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    border: formData.days.includes(day)
                      ? "1px solid #f87951"
                      : "1px solid #ddd",
                    background: formData.days.includes(day)
                      ? "#f87951"
                      : "#fff",
                    color: formData.days.includes(day)
                      ? "#fff"
                      : "#000",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button
              className="secondary-button btn-sm small-add-button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>

            <button
             className="primary-button btn-sm small-add-button"
              onClick={handleSubmit}
            >
              {isEdit ? "Update" : "Save"}
            </button>
          </Modal.Footer>
        </Modal>

        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </AdminLayout>
  );
};

export default Admin_WeeklyOff;
import React, { useEffect, useState } from "react";
import { Table, Modal, Form } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Post_Home_Banner,
  Admin_Home_Banner_Delete,
  Admin_Get_Home_Banner,
  Admin_Home_Booking_Update,
} from "../../../../api/admin/Admin";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import { ToastContainer, toast } from "react-toastify";
import { IMG_BASE_URL } from "../../../../config/Config";

const Admin_Home_Banner = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    images: [],
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  // ✅ Fetch banners
  const fetchBanners = async () => {
    try {
      const res = await Admin_Get_Home_Banner(page, limit);
      setBanners(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error("Error fetching banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [page]);

  // ✅ Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle image
  const handleImageChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
  };

  // ✅ Create Banner
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.warning("Title required");
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);

      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }

      const res = await Admin_Post_Home_Banner(data);

      toast.success(res.data.message || "Banner created");
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      toast.error("Create failed");
    }
  };

  // ✅ Update Banner
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);

      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }

      const res = await Admin_Home_Booking_Update(
        selectedBanner._id,
        data
      );

      toast.success(res.data.message || "Updated successfully");
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // ✅ Delete Banner
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      const res = await Admin_Home_Banner_Delete(id);
      toast.success(res.data.message || "Deleted");
      fetchBanners();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({ title: "", subtitle: "", images: [] });
    setSelectedBanner(null);
  };

  // ✅ Open Edit
  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      images: [],
    });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h5>Home Banner</h5>
          <button
            className="primary-button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Add Banner
          </button>
        </div>

        <ToastContainer />

        {/* TABLE */}
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Images</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {banners.length > 0 ? (
              banners.map((b, i) => (
                <tr key={b._id}>
                  <td>{i + 1}</td>
                  <td>{b.title}</td>
                  <td>{b.subtitle}</td>

                  <td>
                    {b.images?.map((img, index) => (
                      <img
                        key={index}
                        src={`${IMG_BASE_URL}${img}`}
                        width="50"
                        style={{ marginRight: 5 }}
                        alt=""
                      />
                    ))}
                  </td>

                  <td className="d-flex gap-2">
                    <button
                      className="primary-button btn-sm"
                      onClick={() => handleEdit(b)}
                    >
                      Edit
                    </button>

                    <button
                      className="secondary-button btn-sm"
                      onClick={() => handleDelete(b._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No banners found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        <div className="d-flex justify-content-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <TbPlayerTrackPrevFilled />
          </button>

          <span className="mx-3">
            {page} / {totalPages || 1}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <TbPlayerTrackNextFilled />
          </button>
        </div>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedBanner ? "Update Banner" : "Create Banner"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form
            onSubmit={selectedBanner ? handleUpdate : handleCreate}
          >
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageChange}
              />
            </Form.Group>

            <div className="mt-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="primary-button" type="submit">
                {selectedBanner ? "Update" : "Create"}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Home_Banner;
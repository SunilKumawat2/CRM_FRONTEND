import React, { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Table, Modal, Button, Form, Spinner } from "react-bootstrap";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

import {
    Admin_Get_event_package,
    Admin_create_event_package,
    Admin_Update_event_package,
    Admin_delete_event_package,
} from "../../../../api/admin/Admin";
import {
    TbPlayerTrackNextFilled,
    TbPlayerTrackPrevFilled,
} from "react-icons/tb";

const Admin_Hotel_Event_Package = () => {
    const [packages, setPackages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(1);
    const [total, setTotal] = useState(0);
    const totalPages = Math.ceil(total / limit);
    const [isloading, setIsloading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pricePerPerson: "",
        itemsIncluded: "",
    });

    // Fetch Data
    const fetchPackages = async () => {
        setIsloading(true)
        try {
            const res = await Admin_Get_event_package(page, limit);
            setPackages(res?.data?.data || []);
            setTotal(res?.data?.total || 0);
            setIsloading(false)
        } catch (err) {
            setIsloading(false)
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [page]);

    // Handle Create / Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsloading(true)
        setShowForm(true)
        const payload = {
            ...formData,
            itemsIncluded: formData.itemsIncluded.split(","),
        };

        if (editId) {
            try {
                await Admin_Update_event_package(editId, payload);
                setIsloading(false)
                setShowForm(false)
            } catch (error) {
                setIsloading(false)
                setShowForm(false)
            }

        } else {
            try {
                await Admin_create_event_package(payload);
                setIsloading(false)
                setShowForm(false)
            } catch (err) {
                setIsloading(false)
                setShowForm(false)
            }

        }

        setShowForm(false);
        setFormData({ name: "", description: "", pricePerPerson: "", itemsIncluded: "" });
        setEditId(null);
        fetchPackages();
    };

    const handleEdit = (pkg) => {
        setEditId(pkg._id);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            pricePerPerson: pkg.pricePerPerson,
            itemsIncluded: pkg.itemsIncluded.join(","),
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        setIsloading(true)
        if (window.confirm("Are you sure you want to delete this package?")) {
            try {
                await Admin_delete_event_package(id);
                fetchPackages();
                setIsloading(false)
            } catch (err) {
                setIsloading(false)
            }

        }
    };

    return (
        <AdminLayout>

            {/* ---------- Header + Add Button ---------- */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Hotel Event Packages</h3>
                <button className="primary-button btn-sm small-add-button text-center" onClick={() => setShowForm(true)}>
                    <FiPlus /> Add Package
                </button>
            </div>

            {/* ---------- React-Bootstrap Table ---------- */}
            {
                isloading ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" /> <p>Loading...</p>
                    </div>
                ) : (
                    <Table striped bordered hover responsive className="table-smaller">
                        <thead className="text-center">
                            <tr>
                                <th>P.No</th>
                                <th>Package Name</th>
                                <th>Description</th>
                                <th>Price / Person</th>
                                <th>Items Included</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody className="text-center">
                            {packages && packages?.map((pkg, index) => (
                                <tr key={pkg._id}>
                                    <td>{index + 1}</td>
                                    <td>{pkg.name}</td>
                                    <td>{pkg.description}</td>
                                    <td>₹{pkg.pricePerPerson}</td>
                                    <td>{pkg.itemsIncluded.join(", ")}</td>
                                    <td>
                                        <FiEdit
                                            size={18}
                                            className="text-warning"
                                            role="button"
                                            onClick={() => handleEdit(pkg)}
                                        />
                                        <FiTrash2
                                            size={18}
                                            className="text-danger"
                                            role="button"
                                            onClick={() => handleDelete(pkg._id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )
            }


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


            {/* ---------- React-Bootstrap Modal Form ---------- */}

            <Modal show={showForm} onHide={() => setShowForm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="small-form-title">{editId ? "Update Event Package" : "Add New Event Package"}</Modal.Title>
                </Modal.Header>
                {
                    isloading ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" /> <p>Loading...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body className="small-form">

                                <Form.Group className="mb-3">
                                    <Form.Label>Package Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter package name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Enter description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Price Per Person</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter price"
                                        value={formData.pricePerPerson}
                                        onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Items Included</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Comma separated items (e.g. Stage, Buffet, Lighting)"
                                        value={formData.itemsIncluded}
                                        onChange={(e) => setFormData({ ...formData, itemsIncluded: e.target.value })}
                                    />
                                </Form.Group>

                            </Modal.Body>

                            <Modal.Footer>
                                <button className="secondary-button btn-sm small-add-button text-center" 
                                onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button className="primary-button btn-sm small-add-button text-center" type="submit">
                                    {editId ? "Update Package" : "Create Package"}
                                </button>
                            </Modal.Footer>
                        </Form>
                    )
                }

            </Modal>



        </AdminLayout>
    );
};

export default Admin_Hotel_Event_Package;

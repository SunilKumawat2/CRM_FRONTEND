import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import {
    Admin_create_catering,
    Admin_Get_catering,
    Admin_update_catering,
    Admin_delete_catering,
} from "../../../../api/admin/Admin"; // import your API functions
import AdminLayout from "../admin_layout/Admin_Layout";

const Admin_Catering = () => {
    const [caterings, setCaterings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        itemName: "",
        category: "",
        price: "",
        description: "",
    });

    // Fetch catering data
    const fetchCaterings = async () => {
        try {
            setLoading(true);
            const response = await Admin_Get_catering();
            setCaterings(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaterings();
    }, []);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle add or edit submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        setShowModal(true)
        try {
            if (editId) {
                // Update existing
                await Admin_update_catering(editId, formData);
                setLoading(false)
                setShowModal(false)
            } else {
                // Create new
                await Admin_create_catering(formData);
                setLoading(false)
                setShowModal(false)
            }
            setShowModal(false);
            setFormData({ itemName: "", category: "", price: "", description: "" });
            setEditId(null);
            fetchCaterings();
        } catch (error) {
            console.error(error);
        }
    };

    // Handle edit click
    const handleEdit = (catering) => {
        setEditId(catering._id);
        setFormData({
            itemName: catering.itemName,
            category: catering.category,
            price: catering.price,
            description: catering.description,
        });
        setShowModal(true);
    };

    // Handle delete click
    const handleDelete = async (_id) => {
        if (window.confirm("Are you sure you want to delete this package?")) {
            try {
                await Admin_delete_catering(_id);
                fetchCaterings();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Catering Packages</h3>
                <button className="primary-button btn-sm small-add-button text-center" onClick={() => setShowModal(true)}>
                    <FiPlus /> Add Catering
                </button>
            </div>
            {
                loading ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" /> <p>Loading...</p>
                    </div>
                ) : (
                    <Table striped bordered hover responsive className="table-smaller">
                        <thead>
                            <tr>
                                <th>C.No</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                caterings && caterings?.map((catering, index) => (
                                    <tr key={catering?._id}>
                                        <td>{index + 1}</td>
                                        <td>{catering?.itemName}</td>
                                        <td>{catering?.category}</td>
                                        <td>{catering?.price}</td>
                                        <td>{catering?.description}</td>
                                        <td>
                                            <FaEdit
                                                size={15}
                                                className="text-warning"
                                                role="button"
                                                onClick={() => handleEdit(catering)}
                                            />
                                            <FaTrash
                                                size={13}
                                                className="text-danger"
                                                role="button"
                                                onClick={() => handleDelete(catering._id)}
                                            />
                                        </td>

                                    </tr>
                                ))

                            }
                        </tbody>
                    </Table>
                )
            }


            {/* Modal for Add/Edit */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="small-form-title">
                        {editId ? "Edit Catering" : "Add Catering"}
                    </Modal.Title>
                </Modal.Header>
                {
                    loading ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" /> <p>Loading...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body className="small-form">
                                <Form.Group className="mb-3">
                                    <Form.Label>Item Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <button
                                    className="primary-button btn-sm small-add-button text-center"
                                    type="submit"  // <-- this now works
                                >
                                    {editId ? "Update" : "Add"} Catering
                                </button>
                                <button
                                    className="secondary-button btn-sm small-add-button text-center"
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </Modal.Footer>
                        </Form>
                    )
                }

            </Modal>

        </AdminLayout>
    );
};

export default Admin_Catering;

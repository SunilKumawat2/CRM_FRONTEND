import React, { useEffect, useState } from "react";
import AdminLayout from '../admin_layout/Admin_Layout'
import { TbPlayerTrackNextFilled, TbPlayerTrackPrevFilled } from 'react-icons/tb'
import { Admin_Get_User_List,Admin_Toggle_User_Block,Admin_User_Delete } from '../../../../api/admin/Admin'
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const Admin_User_List = () => {
    const [users, setusers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const totalPages = Math.ceil(total / limit);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch all users
    const fetchusers = async () => {
        try {
            setLoading(true);
            const res = await Admin_Get_User_List(page, limit);
            setusers(res.data.data || []);
            setTotal(res.data.total);
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error(err.response?.data?.message || "Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (user) => {
        try {
          const confirmMsg = user.isBlocked
            ? "Are you sure you want to UNBLOCK this user?"
            : "Are you sure you want to BLOCK this user?";
      
          if (!window.confirm(confirmMsg)) return;
      
          const res = await Admin_Toggle_User_Block(user._id);
      
          toast.success(res.data.message);
      
          // ✅ Refresh list after update
          fetchusers();
        } catch (err) {
          console.error("Block Error:", err);
          toast.error(err?.data?.message || "Failed to update user status");
        }
      };

      const handleDeleteUser = async (userId) => {
        try {
          const confirmDelete = window.confirm(
            "Are you sure you want to DELETE this user?"
          );
      
          if (!confirmDelete) return;
      
          const res = await Admin_User_Delete(userId);
      
          toast.success(res.data.message || "User deleted successfully");
      
          // ✅ Refresh list after delete
          fetchusers();
        } catch (err) {
          console.error("Delete Error:", err);
          toast.error(err?.data?.message || "Failed to delete user");
        }
      };

    useEffect(() => {
        fetchusers();
    }, [page]);

    return (
        <AdminLayout>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>User List</h5>
                    {/* <button
                        className="primary-button btn-sm small-add-button"
                        onClick={() => setShowModal(true)}
                    >
                        + Create Role
                    </button> */}
                </div>

                <ToastContainer position="top-right" autoClose={2000} />
                {
                    loading ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" /> <p>Loading...</p>
                        </div>
                    ) : (
                        <Table striped bordered hover responsive className="table-smaller custom-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User Name</th>
                                    <th>User Email</th>
                                    <th>Phone</th>
                                    <th>Alternative Number</th>
                                    <th>Pin Code</th>
                                    <th>Bio</th>
                                    <th>Is Verify</th>
                                    <th>Profile</th>
                                    <th>Create At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.length > 0 ? (
                                    users?.map((role, index) => (
                                        <tr key={role?._id}>
                                            <td>{index + 1}</td>
                                            <td>{role?.name}</td>
                                            <td>{role?.email || "-"}</td>
                                            <td>{role?.phone || "-"}</td>
                                            <td>{role?.alternative_number || "-"}</td>
                                            <td>{role?.pin_code || "-"}</td>
                                            <td>{role?.bio || "-"}</td>
                                            <td>{role?.isVerified || "-"}</td>
                                            <td><img style={{width:"40px",height:'40px',borderRadius:"50px"}} src={`${role?.profileImage}`} alt=""/></td>
                                            <td>{new Date(role?.createdAt).toLocaleString()}</td>
                                            <td className="d-flex p-3 gap-2">
                                                <button
                                                    className={`primary-button btn-sm small-add-button ${
                                                        role?.isBlocked ? "btn btn-danger" : "primary-button"
                                                      }`}
                                                    onClick={() => handleToggleBlock(role)}
                                                >
                                                  {role?.isBlocked ? "Unblock" : "Block"}
                                                </button>
                                                <button
                                                    className="secondary-button btn-sm small-add-button"
                                                    onClick={() => handleDeleteUser(role._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            {loading ? "Loading users..." : "No users found"}
                                        </td>
                                    </tr>
                                )}
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
            </div>
        </AdminLayout>
    )
}

export default Admin_User_List

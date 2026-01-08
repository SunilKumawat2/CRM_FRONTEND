import React, { useEffect, useState } from 'react'
import { Admin_Get_Notifications } from '../../../../api/admin/Admin';
import AdminLayout from '../admin_layout/Admin_Layout';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllNotifications = async () => {
        try {
            const res = await Admin_Get_Notifications();
            setNotifications(res.data.notifications);
        } catch (err) {
            console.error("Error fetching all notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllNotifications();
    }, []);

    if (loading) return <p className="text-center mt-4">Loading notifications...</p>;

    return (
        <>
            <AdminLayout>
                <div className="container mt-4 notifications-page">
                    <h4 className="mb-3">All Notifications</h4>

                    {notifications.length === 0 ? (
                        <p className="notifications-empty">No notifications found.</p>
                    ) : (
                        <div className="list-group notifications-list">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`list-group-item notification-item ${notif.read ? "" : "fw-bold"}`}
                                >
                                    <div>{notif.message}</div>
                                    <small className="notification-time">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </AdminLayout>
        </>
    )
}

export default AdminNotifications

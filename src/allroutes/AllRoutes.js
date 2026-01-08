import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Admin_Dashboard from "../components/pages/admin/admin_dashboard/Admin_Dashboard";
import Admin_Inquiry from "../components/pages/admin/admin_inquiry/Admin_Inquiry";
import Admin_Login from "../components/pages/admin/admin_login/Admin_Login";
import Admin_Profile from "../components/pages/admin/admin_profile/Admin_Profile";
import Admin_List from "../components/pages/admin/admin_list/Admin_List";
import Admin_Role_List from "../components/pages/admin/admin_role_list/Admin_Role_List";
import ProtectedRoute from "../components/protected_route/ProtectedRoute";
import Admin_Profit_List from "../components/pages/admin/admin_profit_list/Admin_Profit_List";
import Admin_Lead_List from "../components/pages/admin/admin_lead_list/Admin_Lead_LIst";
import Admin_Room_List from "../components/pages/admin/admin_room_list/Admin_Room_List";
import Admin_Room_Booking_List from "../components/pages/admin/admin_room_booking_list/Admin_Room_Booking_List";
import Admin_Guest_List from "../components/pages/admin/admin_guest_list/Admin_Guest_List";
import Admin_Housekeeping from "../components/pages/admin/admin_housekeeping/Admin_Housekeeping";
import Admin_Staff_Attendance from "../components/pages/admin/admin_staff_attendance/Admin_Staff_Attendance";
import Admin_Invoice from "../components/pages/admin/admin_invoice/Admin_Invoice";
import Admin_Valet_parking from "../components/pages/admin/admin_valet_parking/Admin_Valet_parking";
import Admin_Hotel_Event_Package from "../components/pages/admin/admin_hotel_event_package/Admin_Hotel_Event_Package";
import Admin_Catering from "../components/pages/admin/admin_catering/Admin_Catering";
import Admin_Guest_Feedback from "../components/pages/admin/admin_guest_request/Admin_Guest_Request";
import Admin_Guest_Request from "../components/pages/admin/admin_guest_request/Admin_Guest_Request";
import Admin_User_Feedback from "../components/pages/admin/admin_user_feedback/Admin_User_Feedback";
import AdminNotifications from "../components/pages/admin/admin_notification/AdminNotifications";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Admin_Login />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredPermission="dashboard_view">
            <Admin_Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-inquiry"
        element={
          <ProtectedRoute requiredPermission="inquiries_view">
            <Admin_Inquiry />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-role-list"
        element={
          <ProtectedRoute requiredPermission="roles_view">
            <Admin_Role_List />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-list"
        element={
          <ProtectedRoute requiredPermission="admins_view">
            <Admin_List />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-profit-list"
        element={
          <ProtectedRoute requiredPermission="admins_view">
            <Admin_Profit_List />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-profile"
        element={
          <ProtectedRoute requiredPermission="profile_view">
            <Admin_Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-lead-list"
        element={
          <ProtectedRoute requiredPermission="profile_view">
            <Admin_Lead_List />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-room-list"
        element={
          <ProtectedRoute requiredPermission="profile_view">
            <Admin_Room_List />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-room-booking-list"
        element={
          <ProtectedRoute requiredPermission="profile_view">
            <Admin_Room_Booking_List />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-guest-list"
        element={
          <ProtectedRoute requiredPermission="guest_view">
            <Admin_Guest_List />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-housekeeping-list"
        element={
          <ProtectedRoute requiredPermission="guest_view">
            <Admin_Housekeeping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-staff-attendance"
        element={
          <ProtectedRoute requiredPermission="guest_view">
            <Admin_Staff_Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-invoice"
        element={
          <ProtectedRoute requiredPermission="invoice_view">
            <Admin_Invoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-valet-parking"
        element={
          <ProtectedRoute requiredPermission="valet_view">
            <Admin_Valet_parking />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin-hotel-event-package"
        element={
          <ProtectedRoute requiredPermission="valet_view">
            <Admin_Hotel_Event_Package />
          </ProtectedRoute>
        }
      />
          <Route
        path="/admin-catering"
        element={
          <ProtectedRoute requiredPermission="valet_view">
            <Admin_Catering />
          </ProtectedRoute>
        }
      />
         <Route
        path="/admin-guest-request"
        element={
          <ProtectedRoute requiredPermission="guest_request_view">
            <Admin_Guest_Request />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin-user-feedback"
        element={
          <ProtectedRoute requiredPermission="guest_request_view">
            <Admin_User_Feedback />
          </ProtectedRoute>
        }
      />
       <Route
        path="/admin-notifications"
        element={
          <ProtectedRoute requiredPermission="notification_view">
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AllRoutes;

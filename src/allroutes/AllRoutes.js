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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AllRoutes;

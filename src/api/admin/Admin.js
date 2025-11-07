import axios from "axios";
import { API_BASE_URL } from "../../config/Config";

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem("admin_token");

// <----------------  Admin Status Form ----------------->
export const Admin_Status_Form = async (userData) => {
  try {
    const token = getToken();
    const response = await axios.post(
      `${API_BASE_URL}/create-status`,
      userData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Get Status ----------------->
export const Admin_Get_Status = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Add Inquiries ----------------->
export const Admin_Add_Inquries = async (data) => {
  try {
    const token = getToken();
    const response = await axios.post(
      `${API_BASE_URL}/create-inquiries`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Get Inquiries ----------------->
export const Admin_Get_Inquiries = async (page = 1, limit = 10) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-inquiries`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Get Inquiries By Status ----------------->
export const Admin_Get_Inquiries_By_Status = async (
  status,
  page = 1,
  limit = 10
) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${API_BASE_URL}/get-inquiries-by-status/${status}`,
      {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Login ----------------->
export const Admin_Login = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin-login`, data);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Register ----------------->
export const Admin_Register = async (data) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/admin-register`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Get Admin Profile ----------------->
export const Get_Admin_Profile = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/admin-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Profile Update ----------------->
export const Admin_Profile_Update = async (formData) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${API_BASE_URL}/admin-profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Get Admin List ----------------->
export const Admin_Get_List = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/admin-list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------------- Delete Particular Admin ----------------->
export const Admin_Delete = async (adminId) => {
  try {
    const token = getToken();
    const response = await axios.delete(
      `${API_BASE_URL}/admin-delete/${adminId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------------- Admin Create Role ----------------->
export const Admin_Create_Role = async (data) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/create-role`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Get Role List ----------------->
export const Admin_Get_Role_List = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------------- Admin Delete Role ----------------->
export const Admin_Role_Delete = async (roleId) => {
  try {
    const token = getToken();
    const response = await axios.delete(
      `${API_BASE_URL}/delete-role/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Update Role ----------------->
export const Admin_Role_Update = async (roleId, formData) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${API_BASE_URL}/update-role/${roleId}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// ----------------  Get Dashboard Summary  -----------------
export const Admin_Get_Dashboard_Summary = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/dashboard-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Dashboard summary response:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error.response || error;
  }
};

// ----------------  Get Loan Amount by Year -----------------
export const Admin_Get_Loan_Amount = async (year) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/chart/loan-amount`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { year }, // ✅ send year as query param
    });
    console.log("Loan amount response:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching loan amount:", error);
    throw error.response || error;
  }
};

// ----------------  Get Open/Close Account Data by Year  -----------------
export const Admin_Get_Open_Close_Account = async (year) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/chart/open-close`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { year }, // ✅ send year as query param
    });
    console.log("Open/close account response:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching open/close account:", error);
    throw error.response || error;
  }
};

// <----------------  Admin Get Lead ----------------->
export const Admin_Get_Leads = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------- admin Post Lead --------------->
export const Admin_Post_Lead = async (userData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/create-lead`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Get Categories ----------------->
export const Admin_Get_Categories = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <------------ Admin Create Categories ----------->
export const Admin_Post_Categories = async (userData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/create-category`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Get Room  ----------------->
export const Admin_Get_Rooms = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Admin Get Room Details  ----------------->
export const Admin_Get_Rooms_Details = async (_id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-rooms/:${_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <-------------- Admin Create Room ----------->
export const Admin_Post_Room = async (userData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/create-room`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------------- Admin Delete Room ----------------->
export const Admin_Room_Delete = async (roleId) => {
  try {
    const token = getToken();
    const response = await axios.delete(
      `${API_BASE_URL}/delete-room/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------------- Admin Update Room Details,----------------->
export const Admin_Room_Update = async (roleId, formData) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${API_BASE_URL}/update-room/${roleId}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------- get room booking list ------------>
export const Admin_Get_Rooms_Booking_list = async (status, page, limit) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${API_BASE_URL}/get-bookings?status=${status}&page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};


// <----------- get room booking Details ------------>
export const Admin_Get_Rooms_Booking_Details = async (bookingId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/get-booking/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------- Admin Create the Room Booking ------------>
export const Admin_Post_Room_Booking = async (userData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/create-booking`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------------- Admin Delete Room Booking  ----------------->
export const Admin_Room_Booking_Delete = async (roleId) => {
  try {
    const token = getToken();
    const response = await axios.delete(
      `${API_BASE_URL}/delete-room/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <----------------  Update Admin Room Booking ----------------->
export const Admin_Room_Booking_Update = async (bookingId, formData) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${API_BASE_URL}/update-booking/${bookingId}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <------------ CheckIn the room Booking -------------->
export const Admin_Room_Booking_CheckIn = async (bookingId) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/checkin/${bookingId}`,{}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <--------------- CheckOut the room booking ----------->
export const Admin_Room_Booking_Checkout = async (bookingId) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/checkout/${bookingId}`,{}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <------------ Room Booking Cancel ------------->
export const Admin_Room_Cancel_Booking = async (bookingId) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_BASE_URL}/cancel-booking/${bookingId}`,{}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// <---------- Get the Booking range and checkIn & checkOut ------------>
export const Admin_Get_Bookings_By_Range = async (startDate, endDate) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${API_BASE_URL}/bookings/calendar?start=${startDate}&end=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [permission, setUserPermission] = useState(null);
    const [loading, setLoading] = useState(false);

    // ========================= GET USER PROFILE API =========================
    const getUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("admin_token");
            const response = await axios.get(`${API_BASE_URL}/admin-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserPermission(response?.data?.data?.role?.permissions);
            return response?.data?.data;
        } catch (error) {
            console.log("Profile API Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider
            value={{
                permission,
                loading,

                // API Functions
                getUserProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
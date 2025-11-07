import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Image } from "react-bootstrap";
import { Get_Admin_Profile, Admin_Profile_Update } from "../../../../api/admin/Admin";
import { IMG_BASE_URL } from "../../../../config/Config"; // make sure to have this
import AdminLayout from "../admin_layout/Admin_Layout";

const Admin_Profile = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await Get_Admin_Profile();
      if (res.status === 200 && res.data.data) {
        setAdminProfile(res.data.data);
        setName(res.data.data.name || "");
      } else {
        setError("Unable to fetch admin profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (password) formData.append("password", password);
      if (profileImage) formData.append("profileImage", profileImage);

      const res = await Admin_Profile_Update(formData);

      if (res.status === 200) {
        setSuccess("Profile updated successfully!");
        setAdminProfile(res.data.data); // Refresh profile
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    }
  };

  return (
    <AdminLayout>
    <Container className="mt-5">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4 text-center">Admin Profile</h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {adminProfile ? (
          <>
            <div className="text-center mb-4">
              <img
                src={
                  adminProfile.profileImage
                    ? `${IMG_BASE_URL}${adminProfile.profileImage}`
                    : "/default-profile.png"
                }
                roundedCircle
                width="120"
                height="120"
                style={{ objectFit: "cover" }}
              />
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email (cannot change)</Form.Label>
                <Form.Control type="email" value={adminProfile.email} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100">
                Update Profile
              </Button>
            </Form>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </Card>
    </Container>

    </AdminLayout>
  );
};

export default Admin_Profile;

import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { Admin_Login as AdminLoginAPI } from "../../../../api/admin/Admin"; // ✅ import your global function
import { useNavigate } from "react-router-dom";
// adjust the import path as needed

const Admin_Login = () => {
  const nevigate = useNavigate("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await AdminLoginAPI({ email, password }); // ✅ call API
      // if (response.status === 200) {
      //   setSuccess("✅ Login successful!");
      //   setError("");
      //   localStorage.setItem("admin_token",response?.data?.data?.token)
      //   localStorage.setItem("login_role",response.data.data.admin.role)
      //   console.log("Admin login response:", response.data.data.admin.role);
      //   nevigate("/admin-dashboard");

      //   // Optionally save data/token
      //   localStorage.setItem("adminData", JSON.stringify(response.data.data));

      //   // Example: redirect to admin dashboard
      //   // navigate("/admin/dashboard");
      // }
   if (response.status === 200) {
  const adminData = response.data.data.admin;

  // Save token & role
  localStorage.setItem("admin_token", response.data.data.token);
  localStorage.setItem("login_role", adminData.isSuperAdmin ? "super_admin" : adminData.role?.name || "admin");

  // Save permissions array
  localStorage.setItem("permissions", JSON.stringify(adminData.permissions || []));

  // Save full admin data (optional)
  localStorage.setItem("adminData", JSON.stringify(response.data.data));

  // Navigate to dashboard
  nevigate("/admin-dashboard");
}


    } catch (err) {
      console.error("Login error:", err);
      setError(err?.data?.message || "Invalid email or password.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex justify-content-center align-items-center bg-light"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={10} sm={8} md={5} lg={4}>
          <Card className="shadow-lg p-4 rounded-4">
            <Card.Body>
              <h3 className="text-center mb-4 fw-bold">Admin Login</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-2 rounded-3"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin_Login;

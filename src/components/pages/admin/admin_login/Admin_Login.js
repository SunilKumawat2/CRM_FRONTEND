import React, { useState } from "react";
import { Form, Button, Card, Container, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { Admin_Login as AdminLoginAPI } from "../../../../api/admin/Admin";
import { useNavigate } from "react-router-dom";
import login_bg from "../../../../assets/images/login_bg.jpg";

// 👇 React Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Admin_Login = () => {
  const nevigate = useNavigate("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 new state
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
      const response = await AdminLoginAPI({ email, password });
      if (response.status === 200) {
        const adminData = response.data.data.admin;
        localStorage.setItem("admin_token", response.data.data.token);
        localStorage.setItem(
          "login_role",
          adminData.isSuperAdmin ? "super_admin" : adminData.role?.name || "admin"
        );
        localStorage.setItem("permissions", JSON.stringify(adminData.permissions || []));
        localStorage.setItem("adminData", JSON.stringify(response.data.data));
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
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `linear-gradient(
          rgba(0,0,0,0.35),
          rgba(0,0,0,0.35)
        ), url(${login_bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={10} sm={8} md={5} lg={4}>
          <Card className="glass-card p-4">
            <Card.Body>
              <h3 className="text-center mb-4 fw-bold text-white">
                Admin Login
              </h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">
                    Email address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="glass-input"
                  />
                </Form.Group>

                {/* Password with Show/Hide */}
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">
                    Password
                  </Form.Label>

                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="glass-input"
                    />

                    <InputGroup.Text
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Button type="submit" className="w-100 mt-2 rounded-3" disabled={loading}>
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

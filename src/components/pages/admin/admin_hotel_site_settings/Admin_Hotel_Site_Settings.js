import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Create_Hotel_Site_Settings,
  Admin_Get_Site_Settings,
} from "../../../../api/admin/Admin";
import { toast, ToastContainer } from "react-toastify";
import { IMG_BASE_URL } from "../../../../config/Config";

const Admin_Hotel_Site_Settings = () => {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  console.log("logoPreview", logoPreview)
  const [logo, setLogo] = useState(null);
  const [stamp, setStamp] = useState(null);
  const [signature, setSignature] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    hrName: "",
    hrDesignation: "",
  });


  // ================= GET COMPANY DETAILS =================

  const get_hotel_site_settings = async () => {
    try {
      setLoading(true);
      const response = await Admin_Get_Site_Settings();
      const data = response?.data?.data;
      setFormData({
        name: data?.name || "",
        phone: data?.phone || "",
        address: data?.address || "",
        email: data?.email || "",
        hrName: data?.hrName || "",
        hrDesignation: data?.hrDesignation || "",
      });
      setLogoPreview(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load company details");
    } finally {
      setLoading(false);

    }

  };

  useEffect(() => {
    get_hotel_site_settings();
  }, []);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE LOGO =================

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    setStamp(file);
    setSignature(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // ================= UPDATE COMPANY =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (logo) {
        data.append("logo", logo);
      }

      if (stamp) {
        data.append("stamp", stamp);
      }

      if (signature) {
        data.append("hrSignature", signature);
      }
      await Admin_Create_Hotel_Site_Settings(data);
      toast.success("Company details updated successfully");
      get_hotel_site_settings();
    } catch (err) {
      console.log(err);
      toast.error("Update failed");

    } finally {

      setLoading(false);

    }

  };

  return (
    <AdminLayout>

      <div className="container py-4">

        <ToastContainer />

        <Card className="border-0 shadow-sm rounded-4">

          <Card.Body className="p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>
                <h4 className="fw-bold mb-1">
                  Hotel Site Settings
                </h4>

                <p className="text-muted mb-0">
                  Manage company details & branding
                </p>
              </div>

            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner />
              </div>
            ) : (

              <Form onSubmit={handleSubmit} >

                <Row>

                  {/* LEFT SECTION */}
                  <Col md={4}>

                    <div className="border rounded-4 p-4 text-center h-100">

                      <div className="mb-4">

                        <img
                          src={`${IMG_BASE_URL}${logoPreview?.logo}`}
                          alt="logo"
                          className="img-fluid rounded-4 shadow-sm"
                          style={{
                            width: "180px",
                            height: "180px",
                            objectFit: "cover",
                          }}
                        />

                      </div>

                      <Form.Group>

                        <Form.Label className="fw-semibold">
                          Upload Logo
                        </Form.Label>

                        <Form.Control
                          type="file"
                          onChange={handleLogoChange}
                        />

                      </Form.Group>
                      <div className="mb-4 mt-3">

                        <img
                          src={`${IMG_BASE_URL}${logoPreview?.stamp}`}
                          alt="logo"
                          className="img-fluid rounded-4 shadow-sm"
                          style={{
                            width: "180px",
                            height: "180px",
                            objectFit: "cover",
                          }}
                        />

                      </div>
                      <Form.Group className="mb-3">
                        <Form.Label>Hotel Stamp</Form.Label>

                        <Form.Control
                          type="file"
                          onChange={(e) =>
                            setStamp(e.target.files[0])
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <div className="mb-4 mt-3">

                          <img
                            src={`${IMG_BASE_URL}${logoPreview?.
                              hrSignature
                              }`}
                            alt="logo"
                            className="img-fluid rounded-4 shadow-sm"
                            style={{
                              width: "180px",
                              height: "180px",
                              objectFit: "cover",
                            }}
                          />

                        </div>
                        <Form.Label>HR Signature</Form.Label>

                        <Form.Control
                          type="file"
                          onChange={(e) =>
                            setSignature(e.target.files[0])
                          }
                        />
                      </Form.Group>

                    </div>

                  </Col>

                  {/* RIGHT SECTION */}
                  <Col md={8}>

                    <div className="border rounded-4 p-4">

                      <Row>

                        <Col md={6}>
                          <Form.Group className="mb-3">

                            <Form.Label>
                              Company Name
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                            />

                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">

                            <Form.Label>
                              Phone
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                            />

                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">

                            <Form.Label>
                              Email
                            </Form.Label>

                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                            />

                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">

                            <Form.Label>
                              HR Name
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="hrName"
                              value={formData.hrName}
                              onChange={handleChange}
                            />

                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">

                            <Form.Label>
                              HR Designation
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="hrDesignation"
                              value={formData.hrDesignation}
                              onChange={handleChange}
                            />

                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          <Form.Group className="mb-3">

                            <Form.Label>
                              Address
                            </Form.Label>

                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                            />

                          </Form.Group>
                        </Col>

                      </Row>

                      <div className="text-end mt-3">

                        <Button
                          type="submit"
                          className="px-4 rounded-3"
                        >
                          Update Details
                        </Button>

                      </div>

                    </div>

                  </Col>

                </Row>

              </Form>

            )}

          </Card.Body>

        </Card>

      </div>

    </AdminLayout>
  );
};

export default Admin_Hotel_Site_Settings;
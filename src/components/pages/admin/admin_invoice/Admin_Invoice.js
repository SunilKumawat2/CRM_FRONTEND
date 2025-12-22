import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import {
  Admin_Get_invoice,
  Admin_Get_Rooms_Booking_list,
  Admin_Get_Rooms_Guest_list,
  Admin_Create_invoice,
  Admin_Get_invoice_Details,
  Admin_Invoice_create_Payment,
  Admin_create_expense,
} from "../../../../api/admin/Admin";
import AdminLayout from "../admin_layout/Admin_Layout";
import { FaEye } from "react-icons/fa";

const Admin_Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [show, setShow] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [guests, setGuests] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isloading, setIsloading] = useState(false)
  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  const openExpenseModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowExpenseModal(true);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedInvoice(null);
  };

  const [formData, setFormData] = useState({
    booking: "",
    guest: "",
    dueDate: "",
    items: [{ description: "", qty: 1, unitPrice: 0, tax: 0 }],
  });

  const openItemModal = (invoice) => {
    setSelectedItem(invoice);
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  const openInvoiceModal = async (invoiceId) => {
    try {
      setLoading(true);

      const res = await Admin_Get_invoice_Details(invoiceId);
      setInvoiceDetails(res.data.data);

      setShowInvoiceModal(true); // <-- FIXED NAME
    } catch (err) {
      console.error("Error loading invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false); // <-- FIXED NAME
    setInvoiceDetails(null);
  };

  // Fetch invoices
  const loadInvoices = async () => {
    setIsloading(true)
    try {
      const res = await Admin_Get_invoice(1, 20);
      setInvoices(res.data.data);
      setIsloading(false)

    } catch (error) {
      setIsloading(false)
    }
  };

  // Fetch bookings + guests for dropdowns
  const loadDependencies = async () => {
    const bookingRes = await Admin_Get_Rooms_Booking_list("", "", "");
    const guestRes = await Admin_Get_Rooms_Guest_list(1, 50);

    setBookings(bookingRes.data.data);
    setGuests(guestRes.data.data);
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    const formData = {
      invoiceId: selectedInvoice._id,
      amount: e.target.amount.value,
      method: e.target.method.value,
      transactionId: e.target.transactionId.value,
      status: "success", // or dynamic
    };

    try {
      const res = await Admin_Invoice_create_Payment(formData);
      alert("Payment Added Successfully");

      closePaymentModal();
      loadInvoices(); // refresh table
    } catch (error) {
      alert("Failed to add payment");
    }
  };

  useEffect(() => {
    loadInvoices();
    loadDependencies();
  }, []);

  // Add new item row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", qty: 1, unitPrice: 0, tax: 0 },
      ],
    });
  };

  // Update item field
  const updateItem = (index, key, value) => {
    const updated = [...formData.items];
    updated[index][key] = value;
    setFormData({ ...formData, items: updated });
  };

  // Submit invoice
  const handleSubmit = async () => {
    await Admin_Create_invoice(formData);
    setShow(false);
    loadInvoices();
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    const formData = {
      title: e.target.title.value,
      category: e.target.category.value,
      amount: e.target.amount.value,
      paidAt: e.target.paidAt.value,
      notes: e.target.notes.value,
    };

    try {
      const res = await Admin_create_expense(formData);
      alert("Expense Added Successfully");

      closeExpenseModal();
      loadInvoices(); // Refresh invoices if needed
    } catch (error) {
      alert("Failed to add expense");
      console.error(error);
    }
  };


  return (
    <AdminLayout>
      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between mb-3">
          <h3>Invoice List</h3>
          <button
            className="primary-button btn-sm small-add-button"
            onClick={() => setShow(true)}
          >
            + Invoice
          </button>
        </div>
        {
          isloading ? (
            <div className="text-center my-4">
              <Spinner animation="border" /> <p>Loading...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive className="table-smaller">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Guest</th>
                  <th>Booking</th>
                  <th>Subtotal</th>
                  <th>Taxes</th>
                  <th>Discounts</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Created At</th>
                  <th>Items</th>
                  <th>Action</th>
                  <th>Payment</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((inv) => (
                  <>
                    {/* MAIN ROW */}
                    <tr key={inv._id}>
                      <td>{inv.invoiceNumber}</td>

                      {/* Guest Name */}
                      <td>{inv.guest?.fullName || "N/A"}</td>

                      {/* Booking Number */}
                      <td>{inv.booking?.bookingNumber || "N/A"}</td>

                      <td>${inv.subtotal}</td>
                      <td>${inv.taxes}</td>
                      <td>${inv.discounts}</td>
                      <td>${inv.total}</td>
                      <td>${inv.paidAmount}</td>
                      <td>${inv.balance}</td>

                      <td
                        className={
                          inv.status === "paid" ? "text-success" : "text-danger"
                        }
                      >
                        {inv.status}
                      </td>

                      <td>{inv.dueDate?.split("T")[0]}</td>
                      <td>{inv.createdAt?.split("T")[0]}</td>
                      {/* ITEMS ROW */}
                      <td>
                        <FaEye
                          size={17}
                          className="text-success"
                          style={{ cursor: "pointer" }}
                          onClick={() => openItemModal(inv)}
                        />
                      </td>
                      <td>
                        <FaEye
                          size={17}
                          className="text-success"
                          style={{ cursor: "pointer" }}
                          onClick={() => openInvoiceModal(inv._id)}
                        />
                      </td>
                      <td>
                        <button
                          className="primary-button btn-sm small-add-button"
                          size="sm"
                          onClick={() => openPaymentModal(inv)}
                        >
                          + Payment
                        </button>
                        <button
                          className="secondary-button btn-sm mt-2 small-add-button"
                          size="sm"
                          onClick={() => openExpenseModal(inv)}
                        >
                          + Expense
                        </button>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Table>
          )
        }


        {/* Add Invoice Modal */}
        <Modal show={show} onHide={() => setShow(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">
              Create Invoice
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Booking</Form.Label>
                    <Form.Select
                      value={formData.booking}
                      onChange={(e) =>
                        setFormData({ ...formData, booking: e.target.value })
                      }
                    >
                      <option>Select booking</option>
                      {bookings.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.bookingNumber} - {b.status}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Guest</Form.Label>
                    <Form.Select
                      value={formData.guest}
                      onChange={(e) =>
                        setFormData({ ...formData, guest: e.target.value })
                      }
                    >
                      <option>Select guest</option>
                      {guests.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.fullName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Due Date */}
              <Form.Group className="mt-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </Form.Group>

              {/* Items Table */}
              <h5 className="mt-4 small-form-title">Invoice Items</h5>

              <Table
                striped
                bordered
                hover
                responsive
                className="table-smaller"
              >
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Tax</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <Form.Control
                          value={item.description}
                          onChange={(e) =>
                            updateItem(idx, "description", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(idx, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, "unitPrice", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={item.tax}
                          onChange={(e) =>
                            updateItem(idx, "tax", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <button
                className="secondary-button btn-sm small-add-button"
                onClick={addItem}
              >
                + Add Item
              </button>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <button
              className="secondary-button btn-sm small-add-button"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
            <button
              className="primary-button btn-sm small-add-button"
              onClick={handleSubmit}
            >
              Create Invoice
            </button>
          </Modal.Footer>
        </Modal>

        {/* ITEMS MODAL */}
        <Modal show={showItemModal} onHide={closeItemModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              Invoice Items — {selectedItem?.invoiceNumber}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedItem?.items?.length > 0 ? (
              <Table
                striped
                bordered
                hover
                responsive
                className="table-smaller"
              >
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Tax</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.items.map((item) => (
                    <tr key={item._id}>
                      <td>{item.description}</td>
                      <td>{item.qty}</td>
                      <td>${item.unitPrice}</td>
                      <td>${item.tax}</td>
                      <td>${item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No items available.</p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <button
              className="secondary-button btn-sm small-add-button"
              onClick={closeItemModal}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showInvoiceModal}
          onHide={closeInvoiceModal}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>Invoice — {invoiceDetails?.invoiceNumber}</Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-view-modal">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : invoiceDetails ? (
              <>
                {/* TOP SECTION */}
                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <h5 className="mb-3">Guest & Booking Info</h5>

                    <p className="mb-1">
                      <strong>Guest:</strong>{" "}
                      {invoiceDetails.guest?.fullName || "N/A"}
                    </p>

                    <p className="mb-1">
                      <strong>Email:</strong>{" "}
                      {invoiceDetails.guest?.email || "N/A"}
                    </p>

                    <p className="mb-1">
                      <strong>Booking No:</strong>{" "}
                      {invoiceDetails.booking?.bookingNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <h5 className="mb-3">Invoice Info</h5>

                    <p className="mb-1">
                      <strong>Status:</strong>
                      <span
                        className={
                          invoiceDetails.status === "paid"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {" "}
                        {invoiceDetails.status.toUpperCase()}
                      </span>
                    </p>

                    <p className="mb-1">
                      <strong>Due Date:</strong>{" "}
                      {invoiceDetails.dueDate?.split("T")[0]}
                    </p>

                    <p className="mb-1">
                      <strong>Created At:</strong>{" "}
                      {invoiceDetails.createdAt?.split("T")[0]}
                    </p>
                  </div>
                </div>

                <hr />

                {/* AMOUNT SUMMARY */}
                <h5 className="mb-3">Amount Summary</h5>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <p>
                      <strong>Subtotal:</strong> ${invoiceDetails.subtotal}
                    </p>
                    <p>
                      <strong>Taxes:</strong> ${invoiceDetails.taxes}
                    </p>
                    <p>
                      <strong>Discounts:</strong> ${invoiceDetails.discounts}
                    </p>
                  </div>

                  <div className="col-md-4">
                    <p>
                      <strong>Paid:</strong> ${invoiceDetails.paidAmount}
                    </p>
                    <p>
                      <strong>Balance:</strong> ${invoiceDetails.balance}
                    </p>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 text-white bg-success rounded shadow-sm">
                      <h5 className="mb-0 text-center">
                        Total: ${invoiceDetails.total}
                      </h5>
                    </div>
                  </div>
                </div>

                <hr />

                {/* ITEMS TABLE */}
                <h5 className="mb-3">Invoice Items</h5>

                <Table bordered hover responsive className="shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Tax</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoiceDetails?.items?.map((item) => (
                      <tr key={item._id}>
                        <td>{item.description}</td>
                        <td>{item.qty}</td>
                        <td>${item.unitPrice}</td>
                        <td>${item.tax}</td>
                        <td>${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            ) : (
              <p>No invoice details found.</p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <button
              className="secondary-button btn-sm small-add-button"
              variant="secondary"
              onClick={closeInvoiceModal}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>

        {/* <-----------Payment Modal -----------------> */}
        <Modal show={showPaymentModal} onHide={closePaymentModal} centered>
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">Add Payment</Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            {selectedInvoice && (
              <>
                <p style={{ fontSize: "12px" }}>
                  <strong  >Invoice:</strong> {selectedInvoice.invoiceNumber}
                </p>
                <p style={{ fontSize: "12px" }}>
                  <strong>Balance:</strong> ${selectedInvoice.balance}
                </p>

                <Form onSubmit={handleCreatePayment}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      required
                      placeholder="Enter amount"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Method</Form.Label>
                    <Form.Select name="method" required>
                      <option value="">Select Method</option>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Transaction ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="transactionId"
                      placeholder="Optional"
                    />
                  </Form.Group>

                  <button className="primary-button btn-sm small-add-button" type="submit">
                    Submit Payment
                  </button>
                </Form>
              </>
            )}
          </Modal.Body>
        </Modal>

        {/* <------------ Expense Modal ---------------> */}
        <Modal size="lg" show={showExpenseModal} onHide={closeExpenseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">Add Expense</Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            {selectedInvoice && (
              <>
                <p style={{ fontSize: "12px" }}>
                  <strong>Invoice:</strong> {selectedInvoice.invoiceNumber}
                </p>
                <p style={{ fontSize: "12px" }}>
                  <strong>Balance:</strong> ${selectedInvoice.balance}
                </p>

                <Form onSubmit={handleCreateExpense}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      required
                      placeholder="Enter expense title"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select name="category" required>
                      <option value="">Select Category</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      required
                      placeholder="Enter amount"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date Paid</Form.Label>
                    <Form.Control
                      type="date"
                      name="paidAt"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      placeholder="Optional notes"
                    />
                  </Form.Group>

                  <button className="primary-button btn-sm small-add-button" type="submit">
                    Submit Expense
                  </button>
                </Form>
              </>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Admin_Invoice;

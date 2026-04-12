import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import {Admin_Get_invoice,Admin_Get_Rooms_Booking_list,Admin_Get_Rooms_Guest_list,Admin_Create_invoice,Admin_Get_invoice_Details,Admin_Invoice_create_Payment,Admin_create_expense,
} from "../../../../api/admin/Admin";
import AdminLayout from "../admin_layout/Admin_Layout";
import { FaEye } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Admin_Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [guests, setGuests] = useState([]);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    booking: "",
    guest: "",
    dueDate: "",
    gstType: "intra", // 🔥 NEW
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

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false); // <-- FIXED NAME
    setInvoiceDetails(null);
  };

  // ---------------- LOAD DATA ----------------
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await Admin_Get_invoice(1, 20);
      setInvoices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [bookingRes, guestRes] = await Promise.all([
        Admin_Get_Rooms_Booking_list("", "", ""),
        Admin_Get_Rooms_Guest_list(1, 50),
      ]);

      setBookings(bookingRes.data.data);
      setGuests(guestRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadDependencies();
  }, []);

  // ---------------- CREATE INVOICE ----------------
  const handleCreateInvoice = async () => {
    try {
      await Admin_Create_invoice(formData);
      setShowCreateModal(false);
      loadInvoices();
    } catch (err) {
      alert("Error creating invoice");
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", qty: 1, unitPrice: 0, tax: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const updateItem = (index, key, value) => {
    const items = [...formData.items];
    items[index][key] = value;
    setFormData({ ...formData, items });
  };

  // ---------------- VIEW INVOICE ----------------
  const openInvoiceModal = async (id) => {
    try {
      setLoading(true);
      const res = await Admin_Get_invoice_Details(id);
      setInvoiceDetails(res.data.data);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PAYMENT ----------------
  const handlePayment = async (e) => {
    e.preventDefault();

    const data = {
      invoiceId: selectedInvoice._id,
      amount: e.target.amount.value,
      method: e.target.method.value,
      transactionId: e.target.transactionId.value,
      status: "success",
    };

    try {
      await Admin_Invoice_create_Payment(data);
      setShowPaymentModal(false);
      loadInvoices();
    } catch (err) {
      alert("Payment failed");
    }
  };

  // ---------------- EXPENSE ----------------
  const handleExpense = async (e) => {
    e.preventDefault();

    const data = {
      invoiceId: selectedInvoice._id,
      title: e.target.title.value,
      amount: e.target.amount.value,
      category: e.target.category.value,
      paidAt: e.target.paidAt.value,
      notes: e.target.notes.value,
    };

    try {
      await Admin_create_expense(data);
      setShowExpenseModal(false);
    } catch (err) {
      alert("Expense failed");
    }
  };

  // <--------- Export Invoice Excel ---------------->
  const exportInvoiceExcel = () => {
    const data = invoices.map((inv) => ({
      InvoiceNo: inv.invoiceNumber,
      Total: inv.total,
      GST:
        inv.gstType === "intra"
          ? `CGST ${inv.cgst} + SGST ${inv.sgst}`
          : `IGST ${inv.igst}`,
      Paid: inv.paidAmount,
      Balance: inv.balance,
      Status: inv.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Invoice_List.xlsx");
  };

  // <------------- Export Invoice PDF ---------------->
  const exportInvoicePDF = () => {
    const doc = new jsPDF();

    const columns = ["Invoice No", "Total", "GST", "Paid", "Balance", "Status"];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.total,
      inv.gstType === "intra"
        ? `CGST ${inv.cgst} + SGST ${inv.sgst}`
        : `IGST ${inv.igst}`,
      inv.paidAmount,
      inv.balance,
      inv.status,
    ]);

    doc.text("Invoice Report", 14, 15);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
    });

    doc.save("Invoice_List.pdf");
  };

  const downloadInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  // ===== HEADER =====
  doc.setFontSize(18);
  doc.text("HOTEL INVOICE", 14, 15);

  doc.setFontSize(11);

  // ===== INVOICE INFO =====
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 25);
  doc.text(`Status: ${invoice.status}`, 14, 32);
  doc.text(`Due Date: ${invoice.dueDate || "N/A"}`, 14, 39);

  // ===== GUEST INFO =====
  doc.text("Guest Details:", 14, 50);
  doc.text(`Name: ${invoice.guest?.fullName || "N/A"}`, 14, 57);
  doc.text(`Email: ${invoice.guest?.email || "N/A"}`, 14, 64);
  doc.text(
    `Booking No: ${invoice.booking?.bookingNumber || "N/A"}`,
    14,
    71
  );

  // ===== ITEMS TABLE =====
  const rows = invoice.items?.map((item) => [
    item.description,
    item.qty,
    item.unitPrice,
    item.tax,
    item.total,
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["Item", "Qty", "Unit Price", "Tax", "Total"]],
    body: rows || [],
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // ===== SUMMARY =====
  doc.text(`Subtotal: $${invoice.subtotal}`, 140, finalY);
  doc.text(`Taxes: $${invoice.taxes}`, 140, finalY + 6);
  doc.text(`Discount: $${invoice.discounts}`, 140, finalY + 12);

  doc.text(`CGST: $${invoice.cgst}`, 140, finalY + 18);
  doc.text(`SGST: $${invoice.sgst}`, 140, finalY + 24);
  doc.text(`IGST: $${invoice.igst}`, 140, finalY + 30);

  doc.setFontSize(13);
  doc.text(`TOTAL: $${invoice.total}`, 140, finalY + 40);

  doc.setFontSize(11);
  doc.text(`Paid: $${invoice.paidAmount}`, 140, finalY + 48);
  doc.text(`Balance: $${invoice.balance}`, 140, finalY + 54);

  // ===== SAVE =====
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h4>Invoices</h4>
          <div className="d-flex gap-2">
            <button
              className="primary-button btn-sm small-add-button"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Invoice
            </button>
            <button
              className="green-button btn-sm small-add-button"
              onClick={exportInvoiceExcel}
            >
              Export Excel
            </button>

            <button
              className="red-button btn-sm small-add-button"
              onClick={exportInvoicePDF}
            >
              Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <Table striped bordered hover responsive className="table-smaller">
            <thead>
              <tr>
                <th>No</th>
                <th>Total</th>
                <th>GST</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.total}</td>
                  <td>
                    {inv.gstType === "intra"
                      ? `CGST: ${inv.cgst} | SGST: ${inv.sgst}`
                      : `IGST: ${inv.igst}`}
                  </td>
                  <td>{inv.paidAmount}</td>
                  <td>{inv.balance}</td>
                  <td>{inv.status}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <div>
                        <FaEye
                          size={17}
                          className="text-success"
                          style={{ cursor: "pointer" }}
                          // onClick={() => openItemModal(inv)}
                          onClick={() => {
                            setSelectedInvoice(inv); // store clicked invoice
                            setShowInvoiceModal(true); // open modal
                          }}
                        />
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => downloadInvoicePDF(inv)}
                        >
                          Download PDF
                        </button>
                      </div>
                      <div>
                        <button
                          className="secondary-button btn-sm small-add-button"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowPaymentModal(true);
                          }}
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* CREATE INVOICE */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">
              Create Invoice
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-form">
            <Form>
              <Row>
                <Col>
                  <Form.Select
                    onChange={(e) =>
                      setFormData({ ...formData, booking: e.target.value })
                    }
                  >
                    <option>Select Booking</option>
                    {bookings.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bookingNumber}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Select
                    onChange={(e) =>
                      setFormData({ ...formData, guest: e.target.value })
                    }
                  >
                    <option>Select Guest</option>
                    {guests.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.fullName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* GST TYPE */}
              <Form.Group className="mt-3">
                <Form.Label>GST Type</Form.Label>
                <Form.Select
                  value={formData.gstType}
                  onChange={(e) =>
                    setFormData({ ...formData, gstType: e.target.value })
                  }
                >
                  <option value="intra">Intra State (CGST + SGST)</option>
                  <option value="inter">Inter State (IGST)</option>
                </Form.Select>
              </Form.Group>

              {formData.items.map((item, i) => (
                <Row key={i} className="mt-2 align-items-center">
                  <Col>
                    <Form.Label>Item Name</Form.Label>
                    <Form.Control
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(i, "description", e.target.value)
                      }
                    />
                  </Col>

                  <Col>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(i, "qty", e.target.value)}
                    />
                  </Col>

                  <Col>
                    <Form.Label>Unit Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(i, "unitPrice", e.target.value)
                      }
                    />
                  </Col>

                  <Col>
                    <Form.Label>Tax%</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Tax %"
                      value={item.tax}
                      onChange={(e) => updateItem(i, "tax", e.target.value)}
                    />
                  </Col>

                  <Col xs="auto">
                    <FaTimes
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => removeItem(i)}
                      title="Remove Item"
                    />
                  </Col>
                </Row>
              ))}
            </Form>
            <div className="d-flex gap-1 mt-4">
              <div>
                <button
                  className="secondary-button btn-sm small-add-button"
                  onClick={addItem}
                >
                  + Item
                </button>
              </div>
              <div>
                <button
                  className="primary-button btn-sm small-add-button"
                  onClick={handleCreateInvoice}
                >
                  Save
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        {/* PAYMENT */}
        <Modal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title className="small-form-title">
              Create Payment
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handlePayment}>
            <Modal.Body className="small-form">
              {/* Amount */}
              <Form.Group className="mt-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </Form.Group>

              {/* Payment Method */}
              <Form.Group className="mt-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, method: e.target.value })
                  }
                  required
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </Form.Select>
              </Form.Group>

              {/* Transaction ID */}
              <Form.Group className="mt-3">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control
                  type="text"
                  name="transactionId"
                  placeholder="Optional"
                  value={formData.transactionId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <button
                className="secondary-button btn-sm small-add-button"
                type="button"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="primary-button btn-sm small-add-button"
                type="submit"
              >
                Pay
              </button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/*  Invoives  */}
        <Modal
          show={showInvoiceModal}
          onHide={() => setShowInvoiceModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>
              Invoice — {selectedInvoice?.invoiceNumber || "N/A"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="small-view-modal">
            {selectedInvoice ? (
              <>
                {/* Guest & Booking */}
                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <h5>Guest & Booking Info</h5>
                    <p>
                      <strong>Guest:</strong>{" "}
                      {selectedInvoice.guest?.fullName || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedInvoice.guest?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Booking No:</strong>{" "}
                      {selectedInvoice.booking?.bookingNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <h5>Invoice Info</h5>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={
                          selectedInvoice.status === "paid"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {selectedInvoice.status?.toUpperCase() || "N/A"}
                      </span>
                    </p>
                    <p>
                      <strong>Due Date:</strong>{" "}
                      {selectedInvoice.dueDate || "N/A"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {selectedInvoice.createdAt?.split("T")[0] || "N/A"}
                    </p>
                  </div>
                </div>

                <hr />

                {/* Amount Summary */}
                <h5>Amount Summary</h5>
                <div className="d-flex justify-content-between mb-4">
                  <div className="col-md-4">
                    <p>
                      <strong>Subtotal:</strong> ${selectedInvoice.subtotal}
                    </p>
                    <p>
                      <strong>Taxes:</strong> ${selectedInvoice.taxes}
                    </p>
                    <p>
                      <strong>Discounts:</strong> ${selectedInvoice.discounts}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <p>
                      <strong>CGST:</strong> ${selectedInvoice.cgst}
                    </p>
                    <p>
                      <strong>SGST:</strong> ${selectedInvoice.sgst}
                    </p>
                    <p>
                      <strong>IGST:</strong> ${selectedInvoice.igst}
                    </p>
                    <p>
                      <strong>GST Type:</strong> ${selectedInvoice.gstType}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <p>
                      <strong>Paid:</strong> ${selectedInvoice.paidAmount}
                    </p>
                    <p>
                      <strong>Balance:</strong> ${selectedInvoice.balance}
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 text-white bg-success rounded shadow-sm">
                    <h5 className="mb-0 text-center">
                      Total: ${selectedInvoice.total}
                    </h5>
                  </div>
                </div>

                <hr />

                {/* Items Table */}
                <h5>Invoice Items</h5>
                <Table bordered hover responsive className="shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Tax</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item) => (
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
              onClick={() => setShowInvoiceModal(false)}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Admin_Invoice;

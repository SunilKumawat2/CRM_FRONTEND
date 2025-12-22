// import React, { useState, useEffect } from "react";
// import { Table, Badge, Button, Modal, Form, Nav, Tab } from "react-bootstrap";
// import AdminLayout from "../admin_layout/Admin_Layout";
// import {
//   Admin_Status_Form,
//   Admin_Get_Status,
//   Admin_Add_Inquries,
//   Admin_Get_Inquiries,
//   Admin_Get_Inquiries_By_Status,
// } from "../../../../api/admin/Admin";
// import * as XLSX from "xlsx";

// const Admin_Inquiry = () => {
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [showInquiryModal, setShowInquiryModal] = useState(false);
//   const [newStatus, setNewStatus] = useState("");
//   const [statuses, setStatuses] = useState([]);
//   const [inquiries, setInquiries] = useState([]);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [loadingStatus, setLoadingStatus] = useState(false);
//   const [loadingInquiry, setLoadingInquiry] = useState(false);
//   const [selectedTab, setSelectedTab] = useState("all");

//   const [inquiryForm, setInquiryForm] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     location: "",
//     status: "",
//   });

//   const fetchStatuses = async () => {
//     try {
//       const res = await Admin_Get_Status();
//       setStatuses(res.data.data || []);
//     } catch (error) {
//       console.error("Error fetching statuses:", error);
//     }
//   };

//   // ✅ Fetch inquiries (with or without status)
//   const fetchInquiries = async () => {
//     setLoadingInquiry(true)
//     try {
//       const res = statusFilter
//         ? await Admin_Get_Inquiries_By_Status(statusFilter, page, limit)
//         : await Admin_Get_Inquiries(page, limit);

//       setInquiries(res.data.data || []);
//       setTotalPages(res.data.pagination?.totalPages || 1);
//       setLoadingInquiry(false)
//     } catch (error) {
//       console.error("Error fetching inquiries:", error);
//     }
//   };

//   // ✅ Optional helper (if you want a separate call)
//   const fetchInquiriesByStatus = async (status) => {
//     setStatusFilter(status);
//     setPage(1); // reset to first page when filter changes
//   };

//   // Fetch when page, limit, or status changes
//   useEffect(() => {
//     fetchInquiries();
//     fetchStatuses()
//   }, [page, limit, statusFilter]);

//   const handleAddStatus = async () => {
//     if (!newStatus.trim()) return alert("Please enter a status");

//     try {
//       setLoadingStatus(true);
//       await Admin_Status_Form({ name: newStatus });
//       alert("Status added successfully!");
//       setNewStatus("");
//       setShowStatusModal(false);
//       fetchStatuses();
//     } catch (error) {
//       console.error("Error creating status:", error);
//       alert("Failed to add status");
//     } finally {
//       setLoadingStatus(false);
//     }
//   };

// const handleAddInquiry = async () => {
//   const { name, email, mobile, location, status, scheduledDate, scheduledTime } = inquiryForm;

//   if (!name || !email || !mobile || !location || !status) {
//     return alert("Please fill all fields");
//   }

//   // If Scheduled, check date & time
//   if (status.toLowerCase() == "schedule" && (!scheduledDate || !scheduledTime)) {
//     return alert("Please select date and time for the scheduled inquiry");
//   }

//   try {
//     setLoadingInquiry(true);
//     await Admin_Add_Inquries(inquiryForm);
//     alert("Inquiry added successfully!");
//     setShowInquiryModal(false);
//     setInquiryForm({
//       name: "",
//       email: "",
//       mobile: "",
//       location: "",
//       status: "",
//       scheduledDate: "",
//       scheduledTime: "",
//     });

//     if (selectedTab === "all") fetchInquiries();
//     else fetchInquiriesByStatus(selectedTab);
//   } catch (error) {
//     console.error("Error adding inquiry:", error);
//     alert("Failed to add inquiry");
//   } finally {
//     setLoadingInquiry(false);
//   }
// };

//   const handleTabSelect = (status) => {
//     setSelectedTab(status);
//     if (status === "all") {
//       fetchInquiries();
//     } else {
//       fetchInquiriesByStatus(status);
//     }
//   };

//   const handleExcelUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: "array" });

//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];

//       const excelData = XLSX.utils.sheet_to_json(worksheet);

//       const inquiriesFromExcel = excelData.map((row) => ({
//         name: row.Name || row.name,
//         email: row.Email || row.email,
//         mobile: row.Mobile || row.mobile,
//         location: row.Location || row.location,
//         status: row.Status || row.status,
//       }));

//       // Upload each inquiry individually
//       uploadInquiriesIndividually(inquiriesFromExcel);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const uploadInquiriesIndividually = async (data) => {
//     try {
//       setLoadingInquiry(true);

//       for (const inquiry of data) {
//         // Send each inquiry as a single object
//         await Admin_Add_Inquries(inquiry);
//       }

//       alert("Inquiries uploaded successfully!");
//       fetchInquiries();
//     } catch (error) {
//       console.error("Error uploading inquiries:", error);
//       alert("Failed to upload inquiries");
//     } finally {
//       setLoadingInquiry(false);
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="container mt-4">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h3>Admin Inquiry List</h3>
//           <div>
//             <Button
//               variant="success"
//               className="me-2"
//               onClick={() => setShowInquiryModal(true)}
//             >
//               + Add Inquiry
//             </Button>
//             <Button
//               variant="info"
//               className="me-2"
//               onClick={() => document.getElementById("excelUpload").click()}
//             >
//               + Upload Inquiry Excel
//             </Button>

//             <input
//               type="file"
//               id="excelUpload"
//               accept=".xlsx, .xls"
//               style={{ display: "none" }}
//               onChange={handleExcelUpload}
//             />

//             <Button variant="primary" onClick={() => setShowStatusModal(true)}>
//               + Add Status
//             </Button>
//           </div>
//         </div>

//         <Tab.Container activeKey={selectedTab} onSelect={handleTabSelect}>
//           <Nav
//             variant="tabs"
//             className="w-100 d-flex justify-content-between mb-4"
//           >
//             <Nav.Item className="flex-fill text-center">
//               <Nav.Link eventKey="all" className="py-2">
//                 All Queries
//               </Nav.Link>
//             </Nav.Item>

//             {statuses?.map((statusItem) => (
//               <Nav.Item key={statusItem._id} className="flex-fill text-center">
//                 <Nav.Link eventKey={statusItem.name} className="py-2">
//                   {statusItem.name}
//                 </Nav.Link>
//               </Nav.Item>
//             ))}
//           </Nav>
//         </Tab.Container>
// {
//   loadingInquiry ? <p>please wait </p> : <>
//   {/* Table */}
//         <Table striped bordered hover responsive className="shadow-sm mt-3">
//           <thead className="table-dark">
//             <tr>
//               <th>#</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Mobile</th>
//               <th>Location</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {inquiries.map((item, index) => (
//               <tr key={item._id}>
//                 <td>{index + 1}</td>
//                 <td>{item.name}</td>
//                 <td>{item.email}</td>
//                 <td>{item.mobile}</td>
//                 <td>{item.location}</td>
//                 {/* <td>
//                   <Badge bg={statusConfig[item?.status] || "warning"}>
//                     {item?.status}
//                   </Badge>
//                 </td> */}
//                 <td>
//                   <Badge>{item?.status}</Badge>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//   </>
// }
        

//         <div className="flex items-center justify-between mt-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center space-x-2">
//             <button
//               className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
//                 page <= 1
//                   ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700"
//               }`}
//               disabled={page <= 1}
//               onClick={() => setPage(page - 1)}
//             >
//               Prev
//             </button>

//             <span className="text-sm text-gray-700">
//               Page <strong>{page}</strong> of <strong>{totalPages}</strong>
//             </span>

//             <button
//               className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
//                 page >= totalPages
//                   ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700"
//               }`}
//               disabled={page >= totalPages}
//               onClick={() => setPage(page + 1)}
//             >
//               Next
//             </button>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Rows per page:</span>
//             <select
//               value={limit}
//               onChange={(e) => setLimit(Number(e.target.value))}
//               className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//               <option value={50}>50</option>
//             </select>
//           </div>
//         </div>

//         {/* Add Status Modal */}
//         <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
//           <Modal.Header closeButton>
//             <Modal.Title>Add New Status</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Form.Group controlId="formStatus">
//                 <Form.Label>Status Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter status"
//                   value={newStatus}
//                   onChange={(e) => setNewStatus(e.target.value)}
//                 />
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={() => setShowStatusModal(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="primary"
//               onClick={handleAddStatus}
//               disabled={loadingStatus}
//             >
//               {loadingStatus ? "Saving..." : "Save Status"}
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* Add Inquiry Modal */}
//         <Modal
//           show={showInquiryModal}
//           onHide={() => setShowInquiryModal(false)}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Add New Inquiry</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter name"
//                   value={inquiryForm.name}
//                   onChange={(e) =>
//                     setInquiryForm({ ...inquiryForm, name: e.target.value })
//                   }
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Email</Form.Label>
//                 <Form.Control
//                   type="email"
//                   placeholder="Enter email"
//                   value={inquiryForm.email}
//                   onChange={(e) =>
//                     setInquiryForm({ ...inquiryForm, email: e.target.value })
//                   }
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Mobile</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter mobile"
//                   value={inquiryForm.mobile}
//                   onChange={(e) =>
//                     setInquiryForm({ ...inquiryForm, mobile: e.target.value })
//                   }
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Location</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter location"
//                   value={inquiryForm.location}
//                   onChange={(e) =>
//                     setInquiryForm({ ...inquiryForm, location: e.target.value })
//                   }
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Status</Form.Label>
//                 <Form.Select
//                   value={inquiryForm.status}
//                   onChange={(e) =>
//                     setInquiryForm({ ...inquiryForm, status: e.target.value })
//                   }
//                 >
//                   <option value="">Select Status</option>
//                   {statuses.map((statusItem) => (
//                     <option key={statusItem._id} value={statusItem.name}>
//                       {statusItem.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={() => setShowInquiryModal(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="primary"
//               onClick={handleAddInquiry}
//               disabled={loadingInquiry}
//             >
//               {loadingInquiry ? "Saving..." : "Save Inquiry"}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     </AdminLayout>
//   );
// };

// export default Admin_Inquiry;


import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Modal, Form, Nav, Tab } from "react-bootstrap";
import AdminLayout from "../admin_layout/Admin_Layout";
import {
  Admin_Status_Form,
  Admin_Get_Status,
  Admin_Add_Inquries,
  Admin_Get_Inquiries,
  Admin_Get_Inquiries_By_Status,
} from "../../../../api/admin/Admin";
import * as XLSX from "xlsx";

const Admin_Inquiry = () => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingInquiry, setLoadingInquiry] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    status: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  const fetchStatuses = async () => {
    try {
      const res = await Admin_Get_Status();
      setStatuses(res.data.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiry(true);
    try {
      const res = statusFilter
        ? await Admin_Get_Inquiries_By_Status(statusFilter, page, limit)
        : await Admin_Get_Inquiries(page, limit);

      setInquiries(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoadingInquiry(false);
    }
  };

  const fetchInquiriesByStatus = async (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  useEffect(() => {
    fetchInquiries();
    fetchStatuses();
  }, [page, limit, statusFilter]);

  const handleAddStatus = async () => {
    if (!newStatus.trim()) return alert("Please enter a status");

    try {
      setLoadingStatus(true);
      await Admin_Status_Form({ name: newStatus });
      alert("Status added successfully!");
      setNewStatus("");
      setShowStatusModal(false);
      fetchStatuses();
    } catch (error) {
      console.error("Error creating status:", error);
      alert("Failed to add status");
    } finally {
      setLoadingStatus(false);
    }
  };

 const handleAddInquiry = async () => {
  const { name, email, mobile, location, status, scheduledDate, scheduledTime } = inquiryForm;

  if (!name || !email || !mobile || !location || !status) {
    return alert("Please fill all fields");
  }

  if (status.toLowerCase() === "schedule" && (!scheduledDate || !scheduledTime)) {
    return alert("Please select date and time for the scheduled inquiry");
  }

  // Append ":00" if missing
  const fixedTime = scheduledTime && !scheduledTime.includes(":") ? scheduledTime + ":00" : scheduledTime;
  const payload = { ...inquiryForm, scheduledTime: fixedTime };

  try {
    setLoadingInquiry(true);
    await Admin_Add_Inquries(payload);
    alert("Inquiry added successfully!");
    setShowInquiryModal(false);
    setInquiryForm({
      name: "",
      email: "",
      mobile: "",
      location: "",
      status: "",
      scheduledDate: "",
      scheduledTime: "",
    });

    if (selectedTab === "all") fetchInquiries();
    else fetchInquiriesByStatus(selectedTab);
  } catch (error) {
    console.error("Error adding inquiry:", error);
    alert("Failed to add inquiry");
  } finally {
    setLoadingInquiry(false);
  }
};


  const handleTabSelect = (status) => {
    setSelectedTab(status);
    if (status === "all") fetchInquiries();
    else fetchInquiriesByStatus(status);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet);
      const inquiriesFromExcel = excelData.map((row) => ({
        name: row.Name || row.name,
        email: row.Email || row.email,
        mobile: row.Mobile || row.mobile,
        location: row.Location || row.location,
        status: row.Status || row.status,
        scheduledDate: row.scheduledDate || row.scheduledDate,
        scheduledTime: row.scheduledTime || row.scheduledTime,
      }));
      uploadInquiriesIndividually(inquiriesFromExcel);
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadInquiriesIndividually = async (data) => {
    try {
      setLoadingInquiry(true);
      for (const inquiry of data) {
        await Admin_Add_Inquries(inquiry);
      }
      alert("Inquiries uploaded successfully!");
      fetchInquiries();
    } catch (error) {
      console.error("Error uploading inquiries:", error);
      alert("Failed to upload inquiries");
    } finally {
      setLoadingInquiry(false);
    }
  };

  const isScheduleSelected = inquiryForm.status?.toLowerCase() === "schedule";

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Admin Inquiry List</h3>
          <div>
            <Button variant="success" className="me-2" onClick={() => setShowInquiryModal(true)}>
              + Add Inquiry
            </Button>
            <Button variant="info" className="me-2" onClick={() => document.getElementById("excelUpload").click()}>
              + Upload Inquiry Excel
            </Button>
            <input
              type="file"
              id="excelUpload"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={handleExcelUpload}
            />
            <Button variant="primary" onClick={() => setShowStatusModal(true)}>
              + Add Status
            </Button>
          </div>
        </div>

        <Tab.Container activeKey={selectedTab} onSelect={handleTabSelect}>
          <Nav variant="tabs" className="w-100 d-flex justify-content-between mb-4">
            <Nav.Item className="flex-fill text-center">
              <Nav.Link eventKey="all" className="py-2">All Queries</Nav.Link>
            </Nav.Item>
            {statuses?.map((statusItem) => (
              <Nav.Item key={statusItem._id} className="flex-fill text-center">
                <Nav.Link eventKey={statusItem.name} className="py-2">{statusItem.name}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Tab.Container>

        {loadingInquiry ? <p>please wait...</p> : (
          <Table striped bordered hover responsive className="shadow-sm mt-3">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Location</th>
                <th>scheduled Date</th>
                <th>scheduled Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries?.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.mobile}</td>
                  <td>{item.location}</td>
                  
                  <td>{item.scheduledDate}</td>
                  <td>{item.scheduledTime}</td>
                  <td><Badge>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1.5 text-sm rounded-md border transition-all ${page <= 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
            <button
              className={`px-3 py-1.5 text-sm rounded-md border transition-all ${page >= totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Add Status Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formStatus">
                <Form.Label>Status Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddStatus} disabled={loadingStatus}>
              {loadingStatus ? "Saving..." : "Save Status"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Inquiry Modal */}
        <Modal show={showInquiryModal} onHide={() => setShowInquiryModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Inquiry</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Name */}
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                />
              </Form.Group>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                />
              </Form.Group>

              {/* Mobile */}
              <Form.Group className="mb-3">
                <Form.Label>Mobile</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter mobile"
                  value={inquiryForm.mobile}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, mobile: e.target.value })}
                />
              </Form.Group>

              {/* Location */}
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter location"
                  value={inquiryForm.location}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, location: e.target.value })}
                />
              </Form.Group>

              {/* Status */}
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={inquiryForm.status}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  {statuses.map((statusItem) => (
                    <option key={statusItem._id} value={statusItem.name}>
                      {statusItem.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* ✅ Show Date & Time if schedule selected */}
              {isScheduleSelected && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Schedule Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={inquiryForm.scheduledDate}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, scheduledDate: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Schedule Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={inquiryForm.scheduledTime}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, scheduledTime: e.target.value })}
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInquiryModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddInquiry} disabled={loadingInquiry}>
              {loadingInquiry ? "Saving..." : "Save Inquiry"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Admin_Inquiry;

import { useEffect, useState } from "react";
import AdminLayout from "../admin_layout/Admin_Layout";
import { Modal, Button, Form, Collapse } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import Select from "react-select";
import {
  Admin_Get_Categories,
  Admin_Get_Leads,
  Admin_Post_Lead,
} from "../../../../api/admin/Admin";
import dayjs from "dayjs";
import { FaEye } from "react-icons/fa";

const Admin_Lead_List = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Toggles for modal sections
  const [showDetails, setShowDetails] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [tags, setTags] = useState([]);
  const [lastContacted, setLastContacted] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contentType, setContentType] = useState("");
  const [country, setCountry] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsCard, setSelectedDetailsCard] = useState(null);
  const [categories, setCategories] = useState([]);

  const [leadTitle, setLeadTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [leadValue, setLeadValue] = useState("");
  const [assigned, setAssigned] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [brandName, setBrandName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [website, setWebsite] = useState("");
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);

  const tagOptions = [
    { value: "high", label: "high" },
    { value: "joomla", label: "joomla" },
    { value: "logo-design", label: "logo-design" },
    { value: "web-design", label: "web-design" },
    { value: "wordpress", label: "wordpress" },
  ];

  const handleOpenModal = () => {
    // setSelectedCard(card);
    setShowModal(true);
  };

  const handleResetForm = () => {
    setLeadTitle("");
    setFirstName("");
    setLastName("");
    setTelephone("");
    setEmail("");
    setLeadValue("");
    setAssigned("");
    setNotes("");
    setSource("");
    setCategory("");
    setTags([]);
    setLastContacted("");
    setTotalBudget("");
    setTargetDate("");
    setContentType("");
    setBrandName("");
    setCompanyName("");
    setStreet("");
    setCity("");
    setStateValue("");
    setZipCode("");
    setCountry("");
    setWebsite("");
    setShowDetails(false);
    setShowMoreInfo(false);
    setShowAddress(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
    setShowDetails(false);
    setShowMoreInfo(false);
    setShowAddress(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await Admin_Get_Leads();
      const data = response.data.data;

      setLeads(data); // store full lead objects

      // transform for cards display
      const cards = data.map((lead) => ({
        id: lead.id, // important to reference original lead
        title: lead.lead_name,
        sub_title: lead.category,
        author: `${lead.first_name} ${lead.last_name}`,
        price: `$${lead.lead_value ?? 0}`,
        created: dayjs(lead.createdAt).format("YYYY-MM-DD"),
        contact: lead.email,
        content_type: lead.content_type,
        target_date: dayjs(lead.target_date).format("YYYY-MM-DD"),
        merged: [],
      }));

      setDetailCards(cards);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchCategories(); // fetch categories
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await Admin_Get_Categories();
      const data = response.data.data; // adjust if your API returns differently
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleShowModal = (card) => {
    const lead = leads.find((l) => l.lead_name === card.title); // match by lead_name
    setSelectedDetailsCard(lead);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedDetailsCard(null);
    setShowDetailsModal(false);
  };

  const handleSaveLead = async () => {
    const payload = {
      lead_name: leadTitle,
      first_name: firstName,
      last_name: lastName,
      telephone,
      email,
      lead_value: leadValue,
      assigned,
      notes,
      source,
      category,
      tags: tags.map((t) => t.value),
      last_contacted_date: lastContacted,
      total_budget: totalBudget,
      target_date: targetDate,
      content_type: contentType,
      brand_name: brandName,
      company_name: companyName,
      street,
      city,
      state: stateValue,
      zip_code: zipCode,
      country,
      website,
    };

    try {
      await Admin_Post_Lead(payload);
      alert("Lead saved successfully!");
      handleCloseModal();
      fetchLeads();
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save lead");
    }
  };

  // Summary cards
  const summaryCards = [
    { amount: "$4,500.00", status: "New", count: 1 },
    { amount: "$4,500.00", status: "Disqualified", count: 1 },
    { amount: "$4,799.00", status: "Qualified", count: 2 },
    { amount: "$0.00", status: "Contacted", count: 1 },
    { amount: "$2,600.00", status: "Proposal Sent", count: 1 },
    { amount: "$670.00", status: "Converted", count: 4 },
  ];

  const [draggedIndex, setDraggedIndex] = useState(null); // existing
  const [draggedMergedInfo, setDraggedMergedInfo] = useState(null); // new

  const [detailCards, setDetailCards] = useState([]);

  const borderColors = ["red", "green", "yellow"];

  const handleDragStart = (index, mergedIndex = null, e) => {
    e.stopPropagation(); // 🔥 prevents parent card from starting drag

    if (mergedIndex !== null) {
      // Dragging a merged item
      setDraggedMergedInfo({ parentIndex: index, mergedIndex });
      setDraggedIndex(null);
    } else {
      // Dragging the whole card
      setDraggedIndex(index);
      setDraggedMergedInfo(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    setDetailCards((prev) => {
      const updated = [...prev];

      // Dragging merged items
      if (draggedMergedInfo) {
        const { parentIndex, mergedIndex } = draggedMergedInfo;
        const parentCard = updated[parentIndex];
        const draggedItem = parentCard.merged[mergedIndex];

        // Remove from old position
        parentCard.merged = parentCard.merged.filter(
          (_, idx) => idx !== mergedIndex
        );

        // Move all fields except lead_name to target card's merged array
        const targetCard = updated[targetIndex];
        const mergedItem = { ...draggedItem };
        delete mergedItem.title; // title corresponds to lead_name in card display
        targetCard.merged = [...(targetCard.merged || []), mergedItem];

        return updated;
      }

      // Dragging main cards
      if (draggedIndex === null || draggedIndex === targetIndex) return prev;

      const draggedCard = updated[draggedIndex];
      const targetCard = updated[targetIndex];

      // Prepare object without lead_name/title for merging
      const dataToMerge = { ...draggedCard };
      delete dataToMerge.title; // leave lead_name in original
      delete dataToMerge.merged; // remove merged array if any, we handle separately

      // Add to target's merged array
      targetCard.merged = [...(targetCard.merged || []), dataToMerge];

      // Reset dragged card to only have lead_name
      updated[draggedIndex] = {
        ...draggedCard,
        sub_title: "",
        author: draggedCard.author.split(" ")[0] || "", // keep first name only or empty
        price: "",
        created: "",
        contact: "",
        content_type: "",
        target_date: "",
        merged: [],
      };

      return updated;
    });

    setDraggedIndex(null);
    setDraggedMergedInfo(null);
  };

  return (
    <AdminLayout>
      <FaPlus
        size={30}
        onClick={() => handleOpenModal()}
        style={{
          position: "absolute",
          top: "100px",
          right: "30px",
          cursor: "pointer",
          color: "white",
          background: "red",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        {summaryCards.map((card, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              minWidth: "150px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0" }}>{card.amount}</h4>
            <p style={{ margin: 0 }}>
              {card.status} - {card.count}
            </p>
          </div>
        ))}
      </div>

      {/* Detail Cards */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {detailCards.map((card, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(index, null, e)} // pass event
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            style={{
              borderTop: `4px solid ${
                borderColors[index % borderColors.length]
              }`,
              borderRadius: "8px",
              padding: "15px",
              flex: "1 1 calc(33.33% - 20px)",
              boxSizing: "border-box",
              textAlign: "left",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              backgroundColor: draggedIndex === index ? "#e8f0fe" : "#f5f5f5",
              position: "relative",
              transition: "background-color 0.2s",
            }}
          >
            <FaPlus
              onClick={() => handleOpenModal(card)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                color: "#007bff",
              }}
            />

            {card.title ? (
              <>
                <h5 style={{ margin: "0 0 5px 0" }}>{card.title}</h5>
                <p
                  style={{
                    margin: "0 0 5px 0",
                    color: "#555",
                    fontSize: "0.85rem",
                  }}
                >
                  {card.sub_title}
                </p>
                <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                  <strong>Author:</strong> {card.author}
                </p>
                <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                  <strong>Price:</strong> {card.price}
                </p>
                <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                  <strong>Created:</strong> {card.created}
                </p>
                <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                  <strong>Contact:</strong> {card.contact}
                </p>
                <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                  <strong>Content Type:</strong> {card.content_type}
                </p>
                <p style={{ margin: 0, fontSize: "0.8rem" }}>
                  <strong>Target Date:</strong> {card.target_date}
                </p>

                {/* Show merged data below */}
                {card.merged && card.merged.length > 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      paddingTop: "10px",
                      borderTop: "1px dashed #aaa",
                      backgroundColor: "#eef5ff",
                      borderRadius: "6px",
                      padding: "8px",
                    }}
                  >
                    <h6 style={{ color: "#007bff", marginBottom: "6px" }}>
                      Merged Items:
                    </h6>

                    {card.merged.map((m, i) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={(e) => handleDragStart(index, i, e)} // pass event
                        onDragOver={handleDragOver}
                        style={{
                          marginBottom: "8px",
                          padding: "6px 8px",
                          cursor: "grab",
                          backgroundColor: "#fff",
                          borderRadius: "5px",
                          borderBottom:
                            i !== card.merged.length - 1
                              ? "1px dashed #ccc"
                              : "none",
                        }}
                      >
                        <h6 style={{ margin: "0 0 4px 0", fontSize: "0.9rem" }}>
                          {m.title || "(No Title)"}
                        </h6>
                        <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                          <strong>Sub Title:</strong> {m.sub_title || "-"}
                        </p>
                        <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                          <strong>Author:</strong> {m.author || "-"}
                        </p>
                        <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                          <strong>Price:</strong> {m.price || "-"}
                        </p>
                        <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                          <strong>Created:</strong> {m.created || "-"}
                        </p>
                        <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                          <strong>Contact:</strong> {m.contact || "-"}
                        </p>
                        <p style={{ margin: "0 0 3px 0", fontSize: "0.8rem" }}>
                          <strong>Content Type:</strong> {m.content_type || "-"}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.8rem" }}>
                          <strong>Target Date:</strong> {m.target_date || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: "10px", textAlign: "right" }}>
                  <FaEye
                    style={{ cursor: "pointer", color: "#007bff" }}
                    onClick={() => handleShowModal(card)}
                  />
                </div>
              </>
            ) : (
              <p style={{ color: "#aaa", textAlign: "center" }}>
                (Empty Card — Drop Here)
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal size="lg" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCard?.title || "Lead Form"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Basic Lead Info */}
            <Form.Group className="mb-3">
              <Form.Label>Lead Title*</Form.Label>
              <Form.Control
                type="text"
                placeholder="Lead Title"
                value={leadTitle}
                onChange={(e) => setLeadTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>First Name*</Form.Label>
              <Form.Control
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name*</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Telephone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lead Value ($)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Lead Value"
                value={leadValue}
                onChange={(e) => setLeadValue(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assigned</Form.Label>
              <Form.Select
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
              >
                <option value="">Select Assigned To</option>
                <option value="Faith Hamilton">Faith Hamilton</option>
                <option value="Steave Mallet">Steave Mallet</option>
                <option value="Annie Milton">Annie Milton</option>
                <option value="Edwin Cook">Edwin Cook</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Details Toggle */}
            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <Form.Label>Details</Form.Label>
              <Form.Check
                type="switch"
                id="details-switch"
                checked={showDetails}
                onChange={() => setShowDetails(!showDetails)}
              />
            </Form.Group>
            <Collapse in={showDetails}>
              <div>
                <Form.Group className="mb-3 mt-2">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Source</Form.Label>
                  <Form.Select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <option value="">Select Source</option>
                    <option value="Yellow Pages">Yellow Pages</option>
                    <option value="Yahoo">Yahoo</option>
                    <option value="Google Places">Google Places</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category*</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="Default">Default</option>
                    <option value="Application Development">
                      Application Development
                    </option>
                    <option value="Graphic Design">Graphic Design</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <Select
                    isMulti
                    options={tagOptions}
                    value={tags}
                    onChange={setTags}
                    placeholder="Select or type to search..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Contacted</Form.Label>
                  <Form.Control
                    type="date"
                    value={lastContacted}
                    onChange={(e) => setLastContacted(e.target.value)}
                  />
                </Form.Group>
              </div>
            </Collapse>

            {/* More Information Toggle */}
            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <Form.Label>More Information</Form.Label>
              <Form.Check
                type="switch"
                id="moreinfo-switch"
                checked={showMoreInfo}
                onChange={() => setShowMoreInfo(!showMoreInfo)}
              />
            </Form.Group>
            <Collapse in={showMoreInfo}>
              <div>
                <Form.Group className="mb-3 mt-2">
                  <Form.Label>Total Budget</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Total Budget"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Target Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content Type</Form.Label>
                  <Form.Select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                  >
                    <option value="">Select Content Type</option>
                    <option value="Article">Article</option>
                    <option value="Blog Post">Blog Post</option>
                    <option value="Research">Research</option>
                    <option value="Product Description">
                      Product Description
                    </option>
                    <option value="White paper">White paper</option>
                    <option value="Script">Script</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Brand Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Brand Name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </Form.Group>
              </div>
            </Collapse>

            {/* Address & Organisation Toggle */}
            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <Form.Label>Address & Organisation Details</Form.Label>
              <Form.Check
                type="switch"
                id="address-switch"
                checked={showAddress}
                onChange={() => setShowAddress(!showAddress)}
              />
            </Form.Group>
            <Collapse in={showAddress}>
              <div>
                <Form.Group className="mb-3 mt-2">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="State"
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Zip Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Zip Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Form.Group>
              </div>
            </Collapse>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleSaveLead()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDetailsCard?.lead_name || "(No Lead Name)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetailsCard ? (
            <div>
              <p>
                <strong>Lead Name:</strong>{" "}
                {selectedDetailsCard.lead_name || "-"}
              </p>
              <p>
                <strong>First Name:</strong>{" "}
                {selectedDetailsCard.first_name || "-"}
              </p>
              <p>
                <strong>Last Name:</strong>{" "}
                {selectedDetailsCard.last_name || "-"}
              </p>
              <p>
                <strong>Telephone:</strong>{" "}
                {selectedDetailsCard.telephone || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selectedDetailsCard.email || "-"}
              </p>
              <p>
                <strong>Lead Value:</strong>{" "}
                {selectedDetailsCard.lead_value ?? "-"}
              </p>
              <p>
                <strong>Assigned:</strong> {selectedDetailsCard.assigned || "-"}
              </p>
              <p>
                <strong>Notes:</strong> {selectedDetailsCard.notes || "-"}
              </p>
              <p>
                <strong>Source:</strong> {selectedDetailsCard.source || "-"}
              </p>
              <p>
                <strong>Category:</strong> {selectedDetailsCard.category || "-"}
              </p>
              <p>
                <strong>Tags:</strong>{" "}
                {selectedDetailsCard.tags?.length
                  ? selectedDetailsCard.tags.join(", ")
                  : "-"}
              </p>
              <p>
                <strong>Last Contacted:</strong>{" "}
                {selectedDetailsCard.last_contacted_date
                  ? dayjs(selectedDetailsCard.last_contacted_date).format(
                      "YYYY-MM-DD"
                    )
                  : "-"}
              </p>
              <p>
                <strong>Total Budget:</strong>{" "}
                {selectedDetailsCard.total_budget ?? "-"}
              </p>
              <p>
                <strong>Target Date:</strong>{" "}
                {selectedDetailsCard.target_date
                  ? dayjs(selectedDetailsCard.target_date).format("YYYY-MM-DD")
                  : "-"}
              </p>
              <p>
                <strong>Content Type:</strong>{" "}
                {selectedDetailsCard.content_type || "-"}
              </p>
              <p>
                <strong>Brand Name:</strong>{" "}
                {selectedDetailsCard.brand_name || "-"}
              </p>
              <p>
                <strong>Company Name:</strong>{" "}
                {selectedDetailsCard.company_name || "-"}
              </p>
              <p>
                <strong>Street:</strong> {selectedDetailsCard.street || "-"}
              </p>
              <p>
                <strong>City:</strong> {selectedDetailsCard.city || "-"}
              </p>
              <p>
                <strong>State:</strong> {selectedDetailsCard.state || "-"}
              </p>
              <p>
                <strong>Zip:</strong> {selectedDetailsCard.zip_code || "-"}
              </p>
              <p>
                <strong>Country:</strong> {selectedDetailsCard.country || "-"}
              </p>
              <p>
                <strong>Website:</strong> {selectedDetailsCard.website || "-"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {selectedDetailsCard.createdAt
                  ? dayjs(selectedDetailsCard.createdAt).format(
                      "YYYY-MM-DD HH:mm"
                    )
                  : "-"}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {selectedDetailsCard.updatedAt
                  ? dayjs(selectedDetailsCard.updatedAt).format(
                      "YYYY-MM-DD HH:mm"
                    )
                  : "-"}
              </p>
            </div>
          ) : (
            <p>No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Admin_Lead_List;

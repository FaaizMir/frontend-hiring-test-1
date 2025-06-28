import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCalls, archiveCall } from "../api/calls";
import { logoutUser } from "../api/auth";
import ttLogo from "../assets/TT Logo.png";
import CallDetailsModal from "./CallDetailsModal";
import NoteModal from "./NoteModal";
import { addNoteToCall } from "../api/calls";
import { initPusher } from "../utils/pusher";

const Dashboard = () => {
  // State variables for call data, pagination, filters, modals
  const [calls, setCalls] = useState([]);
  const [allCalls, setAllCalls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedCall, setSelectedCall] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteCallId, setNoteCallId] = useState(null);

  const navigate = useNavigate();

  // Fetch call data from the API
  const fetchCalls = async (page = 1) => {
    const offset = (page - 1) * resultsPerPage;
    try {
      const data = await getCalls(offset, resultsPerPage);
      setCalls(data.nodes);
      setAllCalls(data.nodes);
      setTotalResults(data.totalCount);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch calls");
    }
  };

  // Load first page on mount
  useEffect(() => {
    fetchCalls(1);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  // Utility to color-code call type text
  const getCallTypeColor = (type) => {
    const lower = type?.toLowerCase();
    if (lower === "missed") return "red";
    if (lower === "answered") return "green";
    if (lower === "voicemail" || lower === "voice mail") return "blue";
    return "black";
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const fromResult = (currentPage - 1) * resultsPerPage + 1;
  const toResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Apply filter whenever status or data changes
  useEffect(() => {
    if (!allCalls.length) return;

    if (filterStatus === "All") {
      setCalls(allCalls);
    } else if (filterStatus === "Archived") {
      setCalls(allCalls.filter((call) => call.is_archived));
    } else {
      setCalls(
        allCalls.filter(
          (call) => call.call_type.toLowerCase() === filterStatus.toLowerCase()
        )
      );
    }
  }, [filterStatus, allCalls]);

  // Archive/unarchive a call
  const changeStatus = async (id) => {
    try {
      await archiveCall(id);
      fetchCalls(currentPage); // Refresh current page
    } catch (err) {
      alert("Failed to update call status");
      console.error(err);
    }
  };

  // Modal handlers
  const openModal = (call) => {
    setSelectedCall(call);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCall(null);
    setShowModal(false);
  };

  const openNoteModal = (id) => {
    setNoteCallId(id);
    setNoteModalOpen(true);
  };

  // Add note to a call
  const handleNoteSave = async (id, content) => {
    try {
      await addNoteToCall(id, content);
      setNoteModalOpen(false);
    } catch (err) {
      alert("Failed to add note");
    }
  };

  // Set up Pusher for real-time updates
  useEffect(() => {
    const pusher = initPusher();
    const channel = pusher.subscribe("private-aircall");

    channel.bind("update-call", function (updatedCall) {
      setAllCalls((prev) =>
        prev.map((c) => (c.id === updatedCall.id ? updatedCall : c))
      );
    });

    // Clean up on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header */}
      <header
        className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom bg-white"
        style={{ height: "60px" }}
      >
        <img
          src={ttLogo}
          alt="Logo"
          style={{ width: "10rem", height: "4rem", objectFit: "contain" }}
        />
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#7869F6", border: "none" }}
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      {/* Main content area */}
      <div className="container mt-4">
        <h2 className="fw-semibold">Turing Technologies Frontend Test</h2>

        {/* Filter dropdown */}
        <div className="mb-3 d-flex align-items-center">
          <span className="me-2 fw-semibold">Filter by:</span>
          <select
            className="form-select form-select-sm w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>Archived</option>
            <option>Missed</option>
            <option>Answered</option>
          </select>
        </div>

        {/* Call table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>CALL TYPE</th>
                <th>DIRECTION</th>
                <th>DURATION</th>
                <th>FROM</th>
                <th>TO</th>
                <th>VIA</th>
                <th>CREATED AT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No calls found
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id}>
                    <td>
                      <span
                        style={{
                          color: getCallTypeColor(call.call_type),
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        title="Click to view call details"
                        onClick={() => openModal(call)}
                      >
                        {call.call_type}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: "#3f51b5",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        {call.direction}
                      </span>
                    </td>
                    <td>
                      {Math.floor(call.duration / 60)} minutes{" "}
                      {call.duration % 60} seconds <br />
                      <small className="text-muted">
                        ({call.duration} seconds)
                      </small>
                    </td>
                    <td>{call.from}</td>
                    <td>{call.to}</td>
                    <td>{call.via}</td>
                    <td>{new Date(call.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          call.is_archived
                            ? "btn-outline-success"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => changeStatus(call.id)}
                      >
                        {call.is_archived ? "Archived" : "Unarchive"}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openNoteModal(call.id)}
                      >
                        {call.notes?.length > 0 ? "Note Added" : "Add Note"}
                      </button>{" "}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => fetchCalls(currentPage - 1)}
              >
                &lt;
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                key={i}
              >
                <button className="page-link" onClick={() => fetchCalls(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => fetchCalls(currentPage + 1)}
              >
                &gt;
              </button>
            </li>
          </ul>
        </nav>

        {/* Display result count */}
        <small className="d-block text-center mt-2">
          {fromResult} – {toResult} of {totalResults} results
        </small>
      </div>

      {/* Show call details modal if selected */}
      {selectedCall && (
        <CallDetailsModal
          show={showModal}
          onClose={closeModal}
          call={selectedCall}
        />
      )}

      {/* Show note modal if triggered */}
      {noteModalOpen && noteCallId && (
        <NoteModal
          show={noteModalOpen}
          callId={noteCallId}
          onClose={() => setNoteModalOpen(false)}
          onSave={handleNoteSave}
        />
      )}
    </div>
  );
};

export default Dashboard;

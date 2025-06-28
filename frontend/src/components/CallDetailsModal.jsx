// CallDetailsModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

// Modal component to show details about a specific call
const CallDetailsModal = ({ show, onClose, call }) => {
  // If there's no call data, don't render anything
  if (!call) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      {/* Modal Header */}
      <Modal.Header closeButton>
        <Modal.Title>Call Details</Modal.Title>
      </Modal.Header>

      {/* Modal Body: displays the call details in a list */}
      <Modal.Body>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Call Type:</strong> {call.call_type}
          </li>
          <li className="list-group-item">
            <strong>Direction:</strong> {call.direction}
          </li>
          <li className="list-group-item">
            <strong>Duration:</strong> {call.duration} seconds
          </li>
          <li className="list-group-item">
            <strong>From:</strong> {call.from}
          </li>
          <li className="list-group-item">
            <strong>To:</strong> {call.to}
          </li>
          <li className="list-group-item">
            <strong>Via:</strong> {call.via}
          </li>
          <li className="list-group-item">
            <strong>Created At:</strong>{" "}
            {new Date(call.created_at).toLocaleString()}
          </li>
          <li className="list-group-item">
            <strong>Archived:</strong> {call.is_archived ? "Yes" : "No"}
          </li>
        </ul>
      </Modal.Body>

      {/* Modal Footer with a Close button */}
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CallDetailsModal;

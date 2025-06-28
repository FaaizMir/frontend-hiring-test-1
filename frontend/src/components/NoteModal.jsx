import React, { useState } from "react";

const NoteModal = ({ show, onClose, onSave, callId }) => {
  const [note, setNote] = useState("");

    // When the user clicks "Save", pass the note back and reset the input
  const handleSave = () => {
    onSave(callId, note);
    setNote(""); // clear the note field after saving
  };

  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Add Note</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <textarea
              className="form-control"
              rows="4"
              placeholder="Write your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;

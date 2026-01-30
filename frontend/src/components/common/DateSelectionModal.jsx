// src/components/common/DateSelectionModal.jsx
import React, { useState, useEffect } from 'react';

/**
 * DateSelectionModal - Modal dialog for selecting a date
 * 
 * Typically used when uploading files that need an associated date (e.g., photos with "date taken" metadata).
 * Resets the date input when opened and validates before submission.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback when user cancels/closes
 * @param {function} props.onConfirm - Callback(dateString) when user submits a valid date
 * @param {string} props.displayName - Name of the file/item being dated (shown in the modal)
 */
const DateSelectionModal = ({ isOpen, onClose, onConfirm, displayName }) => {
  const [date, setDate] = useState("");

  useEffect(() => {
    if (isOpen) setDate(""); // Reset on open
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date) onConfirm(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <h3 className="text-xl font-bold text-gray-900">When was this taken?</h3>
        <p className="mt-2 text-sm text-gray-500">
          Select the date for <span className="font-medium text-gray-900">{displayName}</span> to help organize the timeline.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="photo-date" className="block text-sm font-medium text-gray-700">
              Date Taken
            </label>
            <input
              id="photo-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Set Date & Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateSelectionModal;

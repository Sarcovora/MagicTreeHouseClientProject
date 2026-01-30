// src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast - Notification toast that automatically dismisses after a duration
 * 
 * Supports three types: success (green), error (red), and info (blue).
 * Used via the ToastContext/ToastProvider for global notifications.
 * 
 * @param {object} props
 * @param {string} props.message - Text content to display in the toast
 * @param {string} [props.type="info"] - Toast type: "success", "error", or "info"
 * @param {number} [props.duration=3000] - Auto-dismiss delay in milliseconds
 * @param {function} props.onClose - Callback when toast is dismissed (auto or manual)
 * 
 * @example
 * // Typically accessed via the useToast hook:
 * const { addToast } = useToast();
 * addToast("File uploaded!", "success");
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-center rounded-lg border p-4 shadow-lg ring-1 ring-black ring-opacity-5 transition-all animate-fade-in-up ${bgColors[type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className={`ml-3 flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </div>
      <div className="ml-auto pl-3">
        <button
          onClick={onClose}
          className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColors[type]} hover:bg-opacity-20 hover:bg-black`}
        >
          <span className="sr-only">Dismiss</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

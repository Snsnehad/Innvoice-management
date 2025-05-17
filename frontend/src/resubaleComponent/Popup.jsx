// components/Popup.js
import React from "react";

const Popup = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 text-xl hover:text-red-500"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;

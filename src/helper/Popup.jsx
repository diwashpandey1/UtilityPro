import React from "react";
import { X, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Popup = ({ isOpen, onClose, onConfirm, title, message, type = "info" }) => {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition shadow-sm ${
                  isDanger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Popup;
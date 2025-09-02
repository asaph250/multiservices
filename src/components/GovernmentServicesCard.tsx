import React from "react";

export default function GovernmentServicesCard({ onOpen }) {
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-2xl shadow-md overflow-hidden max-w-md mx-auto">
      {/* Header with Rwanda blue */}
      <div className="bg-blue-600 dark:bg-blue-700 p-4 flex items-center">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-2">🇷🇼</span> Government Services
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 text-gray-800 dark:text-gray-100">
        <p className="text-sm mb-4">
          Access and manage official service requests across Rwanda with transparency and efficiency.
        </p>
        <button
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-gray-900"
          onClick={onOpen}
        >
          Open Services
        </button>
      </div>

      {/* Footer with Rwanda green accent */}
      <div className="bg-green-600 dark:bg-green-700 h-2 w-full"></div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { FaPhone, FaRedoAlt, FaSquare, FaTimes } from "react-icons/fa";
import Logo from "../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  

  const handleWindowControl = (action) => {
    if (window?.electronAPI?.sendWindowAction) {
      window.electronAPI.sendWindowAction(action);
    } else {
      console.warn("electronAPI.sendWindowAction is not available");
    }
  };
  
  

  return (
    <nav className="flex justify-between items-center px-6 py-2 bg-[#14152A] text-white text-sm">
      {/* Left Side */}
      <div className="flex items-center space-x-4">
        <img src={Logo} alt="Logo" className="h-6" />

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-gray-700 px-3 py-1 rounded focus:outline-none"
          >
            Company
          </button>
          {isOpen && (
            <div
              className="absolute z-50 left-0 mt-1 w-48 bg-gray-800 text-white rounded shadow-lg"
              onMouseLeave={() => setIsOpen(false)}
            >
              <a href="#" className="block px-4 py-2 hover:bg-gray-700">Change Company</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-700">Rename Company Name</a>
            </div>
          )}
        </div>

        <span className="hover:text-white cursor-pointer">Help</span>
        <span className="hover:text-white cursor-pointer">Shortcuts</span>
        <span className="hover:text-white cursor-pointer" onClick={() => location.reload()}>⟳</span>
      </div>

      {/* Center */}
      <div className="flex items-center space-x-2 text-center">
        <span>Customer Support:</span>
        <FaPhone />
        <a href="tel:+91636444752" className="text-blue-400 hover:underline">(+91)-6364444752</a>
        <span className="text-gray-400">|</span>
        <a href="#" className="text-blue-400 hover:underline">Get Instant Online Support</a>
      </div>
      

      {/* Right Side */}
      <div className="flex items-center space-x-1">
        <button
          id="minimize"
          onClick={() => handleWindowControl("manimize")}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded"
        >
          &#8211;
        </button>
        <button
          id="maximize"
          onClick={() => handleWindowControl("maximize")}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded"
        >
          &#9633;
        </button>
        <button
          id="close"
          onClick={() => handleWindowControl("close")}
          className="w-8 h-8 flex items-center justify-center hover:bg-red-600 rounded"
        >
          &#10005;
        </button>
      </div>

    </nav>
  );
}

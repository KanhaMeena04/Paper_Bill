import React, { useState } from "react";
import { FaUser, FaPhoneAlt, FaLock, FaEnvelope, FaSpinner } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../Redux/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import axios from "axios";
import { serviceUrl } from "../Services/url";
import {COUNTRIES_DATA} from './countryData';
// Define VAT countries
const VAT_COUNTRIES = ["UAE", "OMAN", "BAHRAIN", "SAUDI ARABIA", "KUWAIT", "QATAR"];


const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    otp: "",
    role: "Customer",
    generatedOTP: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCountryData, setSelectedCountryData] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  // console.log(generateOTP)

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const { name, phone, email } = formData;

    if (!name.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    if (!phone.trim() || !/^\+?\d{10,}$/.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const generatedOTP = generateOTP();
      setFormData(prev =>({ ...prev, generatedOTP }));

      console.log("Generated OTP:", generatedOTP); // For development purposes


// Commented by manish 
      const response = await fetch(
        `https://2factor.in/API/V1/863e3f5d-dc99-11ef-8b17-0200cd936042/SMS/${phone}/${generatedOTP}/OTP1`
      );
      const data = await response.json();
      // change data.Status to sucess here 
      if (data.Status === "Success") {
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }


    } catch (error) {
      console.error("OTP send error:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      if (formData.generatedOTP === formData.otp) {
        await dispatch(
          signup({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            role: formData.role,
          })
        ).unwrap();

        setShowCountryModal(true);
      } 
      else {
        throw new Error("Invalid OTP");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Invalid OTP. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    const countryData = COUNTRIES_DATA.find(c => c.name === countryName);
    setSelectedCountry(countryName);
    setSelectedCountryData(countryData);
  };

  const handleCountrySelection = async () => {
    if (selectedCountryData) {
      try {
        const response = await axios.post(`${serviceUrl}/auth/addCountry`, {
          countryName: selectedCountryData.name,
          phone: formData.phone,
          currency: selectedCountryData.currency,
          currencyCode: selectedCountryData.code,
          currencySymbol: selectedCountryData.symbol,
          hasVAT: VAT_COUNTRIES.includes(selectedCountryData.name),
          taxType: selectedCountryData.tax.type,
          taxRate: selectedCountryData.tax.rate
        });
        
        if(response.data.updatedUser) {
          toast.success("Signup successful!");
          navigate("/");
          window.location.reload();
        }
      } catch (error) {
        toast.error("Failed to set country details. Please try again.");
      }
    } else {
      toast.error("Please select a country");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-gradient-to-r from-[#CD4735] to-[#F9AC40] text-white flex flex-col justify-center items-center text-center p-10">
        <h1 className="text-4xl font-semibold mb-6">Get started today!</h1>
        <p className="mb-6">
          Simplify your accounting, billing, and business growth today!
        </p>
        <Link to="/login">
          <button className="bg-gradient-to-r from-[#F8A83F] to-[#CA3F33] text-white py-3 px-8 rounded-lg cursor-pointer text-lg">
            Log In
          </button>
        </Link>
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center items-center p-10">
        <h1 className="text-4xl text-[#F15338] font-semibold mb-6">
          Create Your Account
        </h1>
        <p className="mb-6">Enter your details for verification</p>

        <div className="flex flex-col gap-4 w-full max-w-[300px] mb-6">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Business Name"
              className="p-3 pl-10 rounded-lg bg-gray-200 text-lg w-full"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={otpSent}
            />
          </div>

          <div className="relative">
            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              placeholder="Phone Number (+1234567890)"
              className="p-3 pl-10 rounded-lg bg-gray-200 text-lg w-full"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={otpSent}
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              className="p-3 pl-10 rounded-lg bg-gray-200 text-lg w-full"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="p-3 pl-10 rounded-lg bg-gray-200 text-lg w-full"
                maxLength={6}
                value={formData.otp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otp: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          )}

          <button
            className={`bg-gradient-to-r from-[#F8A83F] to-[#CA3F33] text-white py-3 px-8 rounded-lg cursor-pointer text-lg flex items-center justify-center ${
              isLoading ? "cursor-not-allowed opacity-70" : ""
            }`}
            onClick={otpSent ? handlePhoneSignup : handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : otpSent ? (
              "Verify & Sign Up"
            ) : (
              "Send OTP"
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showCountryModal}
        onRequestClose={() => setShowCountryModal(false)}
        className="bg-white shadow-md rounded-lg w-full max-w-md mx-auto p-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4">Select Your Country</h2>
        <div className="mb-4">
          <label htmlFor="country" className="text-gray-700 font-medium mb-2">
            Country
          </label>
          <select
            id="country"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            value={selectedCountry || ""}
            onChange={handleCountryChange}
          >
            <option value="">Select Country</option>
            {COUNTRIES_DATA.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name} ({country.currency} - {country.symbol})
              </option>
            ))}
          </select>
          {selectedCountryData && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Currency: {selectedCountryData.currency} ({selectedCountryData.symbol})
              </p>
              <p className="text-sm text-gray-600">
                Tax Type: {selectedCountryData.tax.type}
              </p>
              <p className="text-sm text-gray-600">
                Tax Rate: {selectedCountryData.tax.rate}%
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gradient-to-r from-[#F8A83F] to-[#CA3F33] text-white py-2 px-6 rounded-lg cursor-pointer"
            onClick={handleCountrySelection}
          >
            Proceed
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SignUp;
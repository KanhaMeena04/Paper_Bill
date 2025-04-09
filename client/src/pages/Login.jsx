import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaLock,
  FaSpinner,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../Redux/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
  });
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleCheckPhone = (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    
    // Use login API to verify phone number
    dispatch(login({ phone: formData.phone }))
      .unwrap()
      .then(async () => {
        // If login API succeeds, generate and send OTP
        try {
          const newOTP = generateOTP();
          setGeneratedOTP(newOTP);
          console.log("Generated OTP:", newOTP); // For development purposes

          const otpResponse = await fetch(
            `https://2factor.in/API/V1/863e3f5d-dc99-11ef-8b17-0200cd936042/SMS/${formData.phone}/${newOTP}/OTP1`
          );
          const otpData = await otpResponse.json();
          // change success to otpData.Status 
          if (otpData.Status === "Success") {
            setOtpSent(true);
            toast.success("OTP sent to your phone number");
          } else {
            toast.error("Failed to send OTP. Please try again.");
          }
        } catch (error) {
          toast.error("Failed to send OTP. Please try again.");
        }
      })
      .catch((error) => {
        toast.error(error.data?.message || "Phone number is not registered with us. Please sign up first.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    // Verify OTP locally
    if (formData.otp === generatedOTP) {
      navigate("/");
      window.location.reload();
      setIsLoading(false);
    } else {
      toast.error("Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="flex-1 bg-gradient-to-r from-[#CD4735] to-[#F9AC40] text-white flex flex-col justify-center items-center text-center p-10">
        <h1 className="text-4xl font-semibold mb-6">Welcome back!</h1>
        <p className="mb-6">Manage your finances with ease</p>
        <Link to="/signup">
          <button className="bg-gradient-to-r from-[#F8A83F] to-[#CA3F33] text-white py-3 px-8 rounded-lg cursor-pointer text-lg">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-10">
        <h1 className="text-4xl text-[#F15338] font-semibold mb-6">
          Sign In to Your Account
        </h1>
        
        <div className="flex flex-col gap-4 w-full max-w-[300px] mb-6">
          <div className="relative">
            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              placeholder="Phone Number"
              className="p-3 pl-10 rounded-lg bg-gray-200 text-lg w-full"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              />
            </div>
          )}

          <button
            className={`bg-gradient-to-r from-[#F8A83F] to-[#CA3F33] text-white py-3 px-8 rounded-lg cursor-pointer text-lg flex items-center justify-center ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
            onClick={otpSent ? handlePhoneLogin : handleCheckPhone}
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : otpSent ? (
              "Verify & Login"
            ) : (
              "Send OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
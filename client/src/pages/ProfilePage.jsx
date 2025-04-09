import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBusinessProfile, updateBusinessProfile } from "../Redux/userSlice";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.auth);
  
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    businessType: "",
    gstNumber: "",
    businessAddress: "",
    phone: "",
    email: "",
    websiteUrl: "",
    description: "",
    businessPlatform: "Select Business Platform"
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email);
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, []);

  // Fetch profile data on component mount
  useEffect(() => {
    if(email) {
      dispatch(getBusinessProfile(email));
    }
  }, [email, dispatch]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        businessType: profile.businessType || "",
        gstNumber: profile.gstNumber || "",
        businessAddress: profile.businessAddress || "",
        phone: profile.phone || "",
        email: profile.email || "",
        websiteUrl: profile.websiteUrl || "",
        description: profile.description || "",
        businessPlatform: profile.businessPlatform || "Select Business Platform"
      });
      if (profile.businessLogo) {
        setImagePreview(profile.businessLogo);
      }
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handlePlatformChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      businessPlatform: e.target.value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData object
    const submitFormData = new FormData();
    
    // Add all form fields to FormData
    Object.keys(formData).forEach(key => {
      submitFormData.append(key, formData[key]);
    });
    
    // Add image if exists
    if (imageFile) {
      submitFormData.append('businessImage', imageFile);
    }

    // Add email to FormData
    // if (email) {
    //   submitFormData.append('email', email);
    // }

    try {
      // Dispatch update profile action
      await dispatch(updateBusinessProfile(submitFormData)).unwrap();
      
      // Refresh profile data after update with email
      if (email) {
        await dispatch(getBusinessProfile(email));
      }
      
      // Reset image file state
      setImageFile(null);
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:p-6 lg:p-8 h-screen overflow-y-auto no-scrollbar">
      <h1 className="text-center text-2xl lg:text-3xl font-bold text-blue-600 mb-6">
        Register Your Business Now!
      </h1>
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-2 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="w-full lg:w-2/3 space-y-4">
          <p className="text-gray-600 mb-4">
            Create your business profile and get started with managing your
            operations effortlessly.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {/* Business Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Business Type */}
              <div>
                <label
                  htmlFor="businessType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Type
                </label>
                <input
                  type="text"
                  id="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  placeholder="Enter your business type"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* GST Number */}
              <div>
                <label
                  htmlFor="gstNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  GST Number
                </label>
                <input
                  type="text"
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your GST Number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Business Address */}
              <div>
                <label
                  htmlFor="businessAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Address
                </label>
                <input
                  type="text"
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your business address"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Number
                </label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your contact number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Website URL */}
              <div>
                <label
                  htmlFor="websiteUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="Enter your website URL"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description of Business
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your business"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows="4"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply Changes
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        {/* Right Section */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            {imagePreview ? (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Business Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            ) : (
              <p className="text-gray-500 mb-4">Upload or Drop Files</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
            >
              Upload
            </label>
          </div>
          {/* Business Integration */}
          <div className="bg-gray-100 rounded-lg p-6 shadow">
            <h3 className="text-lg font-medium mb-4">Business Integration</h3>
            <select 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.businessPlatform}
              onChange={handlePlatformChange}
            >
              <option>Select Business Platform</option>
              <option>Shopify</option>
              <option>Unicommerce</option>
              <option>Vin eRetail</option>
              <option>Zoho Inventory</option>
              <option>Vyapaar</option>
            </select>
            <button
              type="button"
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Your Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
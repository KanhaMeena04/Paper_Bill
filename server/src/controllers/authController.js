const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Settings = require('../models/settings');
const JWT_SECRET = "test#123456805";

cloudinary.config({
    cloud_name: 'dorvhzvsl', // Replace with your Cloudinary cloud name
    api_key: '261236719723876',       // Replace with your Cloudinary API key
    api_secret: 'ILlwvoTKs9DLhXV-RrbTO789dA4', // Replace with your Cloudinary API secret
});

module.exports.register = async (req, res) => {
    console.log("Register function called");
    const { name, email, phone, role } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !phone || !role) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields: name, email, phone, and role.",
        });
    }

    // Basic email and phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,}$/; // International format or 10+ digits

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format.",
        });
    }

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number format.",
        });
    }

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists.",
            });
        }

        // Create a new user in the database
        const user = await User.create({
            name,
            email,
            phone,
            role,
            isVerified: true, // Assuming user is verified for now
        });

        // Generate JWT token containing user details
        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            process.env.JWT_SECRET, // Make sure JWT_SECRET is defined in your environment variables
            { expiresIn: '1d' } // Token expiration time
        );

        // Respond with success, user details, and token
        res.status(201).json({
            success: true,
            message: "Registration successful.",
            token, // Send the token in the response
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};

module.exports.login = async (req, res) => {
    const { phone } = req.body;
    console.log("Phone number:", phone);

    try {
        const user = await User.findOne({ phone });
        console.log(user)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Phone number does not exist",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Phone number exists",
            token,
            user, // Send complete user data
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: error.message,
        });
    }
};


async function getOrCreateSettings(email) {
    let settings = await Settings.findOne({ email });
    if (!settings) {
        settings = new Settings({ email });
        await settings.save();
    }
    return settings;
}
module.exports.addCountry = async (req, res) => {
    const { countryName, phone, currency, currencyCode, currencySymbol, hasVAT } = req.body;

    try {
        let taxRates = [];

        // If country is India, add default GST rates
        if (countryName.toLowerCase() === 'india') {
            taxRates = [
                // 0% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 0
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 0
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 0
                },
                // 0.25% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 0.25
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 0.125
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 0.125
                },
                // 3% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 3
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 1.5
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 1.5
                },
                // 5% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 5
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 2.5
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 2.5
                },
                // 12% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 12
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 6
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 6
                },
                // 18% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 18
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 9
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 9
                },
                // 28% rates
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'IGST',
                    rate: 28
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'SGST',
                    rate: 14
                },
                {
                    id: Math.floor(Math.random() * 1000000),
                    name: 'CGST',
                    rate: 14
                }
            ];
        }

        // Find the user document
        const updatedUser = await User.findOneAndUpdate(
            { phone: phone },
            {
                $set: {
                    country: countryName,
                    currency: currency,
                    currencyCode: currencyCode,
                    currencySymbol: currencySymbol,
                    hasVAT: hasVAT,
                },
                $push: {
                    taxRates: {
                        $each: taxRates
                    }
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Now update the settings document
        const settingsDoc = await getOrCreateSettings(updatedUser.email);

        // Find existing GST settings index
        const gstSettingsIndex = settingsDoc.taxesGstSettings.findIndex(s => s.email === updatedUser.email);

        if (gstSettingsIndex !== -1) {
            // Update existing GST settings with the new tax rates
            settingsDoc.taxesGstSettings[gstSettingsIndex].taxRates.push(...taxRates);
        } else {
            // Add new GST settings
            settingsDoc.taxesGstSettings.push({
                email: updatedUser.email,
                taxRates: taxRates,
                taxGroups: []
            });
        }

        // Save the settings document
        await settingsDoc.save();

        res.status(200).json({
            message: "User details and tax rates updated successfully",
            updatedUser: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while updating user details and tax rates",
            error: error.message
        });
    }
};

module.exports.getCountry = async (req, res) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email: email });
        res.status(200).json({
            message: "Country retrieved successfully",
            country: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while retrieving country",
            error: error.message
        });
    }
}

module.exports.getBusinessProfile = async (req, res) => {
    const { email } = req.query;
    console.log(email)
    try {
        const user = await User.findOne({ email: email });
        res.status(200).json({
            message: "Business profile retrieved successfully",
            businessProfile: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while retrieving business profile",
            error: error.message
        });
    }
}

module.exports.updateBusinessProfile = async (req, res) => {
    try {
        // Since we're getting all details in formData, we can directly destructure from req.body
        const {
            name,
            businessType,
            gstNumber,
            businessAddress,
            phone,
            email,
            websiteUrl,
            description,
            businessPlatform,
        } = req.body;
        console.log(email)
        // Basic validation for required fields
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email and phone are required',
            });
        }

        // Find user by email and phone
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email and phone',
            });
        }

        // Create update object with all fields from formData
        const updateData = {
            name,
            businessType,
            gstNumber,
            businessAddress,
            phone,
            email,
            websiteUrl,
            description,
            businessPlatform,
        };
        console.log(updateData)
        // Remove undefined fields
        Object.keys(updateData).forEach(key =>
            updateData[key] === undefined && delete updateData[key]
        );

        // Handle file upload if present
        if (req.file) {
            const filePath = req.file.path;

            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(filePath, {
                folder: 'business_profiles',
                public_id: `${user._id}_logo`,
                overwrite: true,
            });

            // Add the Cloudinary URL to update data
            updateData.businessLogo = uploadResult.secure_url;
        }


        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Business profile updated successfully',
            user: updatedUser,
        });

    } catch (error) {
        console.error('Error updating business profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports.saveUserDetails = async (req, res) => {
    try {
        const { phone, country, currency, currencyCode, currencySymbol, hasVAT, taxRates } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required." });
        }

        const user = await User.findOneAndUpdate(
            { phone: phone },
            { 
                $set: { country, currency, currencyCode, currencySymbol, hasVAT, taxRates } 
            },
            { new: true, upsert: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User details updated successfully.", user });

    } catch (error) {
        console.error("Error updating user details:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.protect = async (req, res, next) => {
    const token = req.header('Authorization');
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'test#123456805'); // Replace 'your_jwt_secret_key' with your actual secret key
        req.email = decoded.email;
        req.id = decoded.id;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports.verifyOTPStatus = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User is already verified"
            });
        }

        if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports.verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                message: "Reset token is required"
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

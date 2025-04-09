const express = require('express');
const multer = require('multer'); // Add multer for file handling
const { 
    register, 
    login, 
    addCountry, 
    getCountry, 
    getBusinessProfile, 
    updateBusinessProfile,
    saveUserDetails
} = require('../controllers/authController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: 'uploads/', // Directory where files will be stored temporarily
    filename: function(req, file, cb) {
        // Create unique filename using timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/saveUserDetails', saveUserDetails);
router.post('/addCountry', addCountry);
router.get('/getCountry', getCountry);
router.get('/getBusinessProfile', getBusinessProfile);
// Add multer middleware to handle file upload
router.post('/updateBusinessProfile', upload.single('businessImage'), updateBusinessProfile);

module.exports = router;
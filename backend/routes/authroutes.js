
const express = require('express');
const router = express.Router();

const { registerUser, loginUser, updateUserPrice } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/updateprice', protect, updateUserPrice);

module.exports = router;
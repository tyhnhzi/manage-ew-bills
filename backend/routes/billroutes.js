
const express = require('express');
const router = express.Router();

const { createBill, getBills, deleteBill, updateBillToPaid } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');


router.route('/').post(protect, createBill).get(protect, getBills);


router.route('/:id').delete(protect, deleteBill);
router.route('/:id/pay').put(protect, updateBillToPaid);

module.exports = router;
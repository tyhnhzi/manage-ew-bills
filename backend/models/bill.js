const mongoose = require('mongoose');
const BillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  billType: { 
    type: String, 
    required: true, 
    enum: ['electricity', 'water'] 
  },
  billDate: { 
    type: Date, 
    required: true 
  },
  oldReading: { type: Number, required: true },
  newReading: { type: Number, required: true },
  totalUsage: { type: Number },
  totalAmount: { type: Number },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);  
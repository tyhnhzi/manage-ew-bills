
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const DEFAULT_PRICE_ELECTRICITY = 3500;
const DEFAULT_PRICE_WATER = 25000;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  

  priceElectricity: {
    type: Number,
    default: DEFAULT_PRICE_ELECTRICITY,
  },
  priceWater: {
    type: Number,
    default: DEFAULT_PRICE_WATER, 
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
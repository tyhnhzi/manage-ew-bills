const Bill = require('../models/Bill');

exports.createBill = async (req, res) => {
  
  const { billType, billDate, oldReading, newReading } = req.body;

  if (!billType || !billDate || oldReading === undefined || newReading === undefined) {
    return res.status(400).json({ message: 'Vui lòng điền đủ thông tin' });
  }

  if (Number(newReading) < Number(oldReading)) {
    return res.status(400).json({ message: 'Chỉ số mới không được nhỏ hơn chỉ số cũ' });
  }

  const totalUsage = Number(newReading) - Number(oldReading);
  let totalAmount = 0;

  if (billType === 'electricity') {
    totalAmount = Math.round(totalUsage * req.user.priceElectricity);
  } else if (billType === 'water') {
    totalAmount = Math.round(totalUsage * req.user.priceWater);
  } else {
    return res.status(400).json({ message: 'Loại hóa đơn không hợp lệ' });
  }

  const bill = new Bill({
    user: req.user._id,
    billType,
    billDate,
    oldReading,
    newReading,
    totalUsage: totalUsage,
    totalAmount: totalAmount,
    isPaid: false, 
  });

  try {
    const createdBill = await bill.save();
    res.status(201).json(createdBill);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo hóa đơn', error: error.message });
  }
};

exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ billDate: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    if (bill.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Không được phép' });
    }
    await bill.deleteOne();
    res.json({ message: 'Hóa đơn đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateBillToPaid = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    if (bill.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Không được phép' });
    }
    bill.isPaid = !bill.isPaid;
    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

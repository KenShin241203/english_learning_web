const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    verificationCode: String,
    verificationCodeExpires: Date, // Thời gian hết hạn của mã xác nhận
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);

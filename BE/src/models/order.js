const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const orderSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
        amount: { type: Number, required: true }, // Giá tiền
        status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }, // Trạng thái
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

orderSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Order = mongoose.model('order', orderSchema);
module.exports = Order;
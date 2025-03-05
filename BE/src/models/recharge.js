const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const rechargeSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        tokenPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'tokenPackage', required: true },
        amount: { type: Number, required: true }, // Giá tiền
        status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }, // Trạng thái
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

rechargeSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Recharge = mongoose.model('recharge', rechargeSchema);
module.exports = Recharge;
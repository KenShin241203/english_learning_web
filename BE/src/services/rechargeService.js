const Recharge = require('../models/recharge');
const User = require('../models/user');
const TokenPack = require('../models/tokenPackage');
const processPendingRecharge = async (orderId) => {
    try {
        const recharge = await Recharge.findOne({ orderId });
        if (!recharge) {
            throw new Error('Recharge not found');
        }
        if (recharge.status === 'success') {
            const tokenPackage = await TokenPack.findById(recharge.tokenPackageId);
            const user = await User.findById(recharge.userId);
            user.tokens += tokenPackage.token;
            await user.save();
            return { message: 'Recharge processed successfully', result: user };
        } else {
            throw new Error('Recharge is in pending status');
        }
    } catch (error) {
        throw new Error(error.message);
    }
}
module.exports = { processPendingRecharge };
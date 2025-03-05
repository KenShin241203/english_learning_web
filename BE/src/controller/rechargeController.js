const { processPendingRecharge } = require('../services/rechargeService');

const processPendingRechargeApi = async (req, res) => {
    try {
        const result = await processPendingRecharge(req.params.orderId);
        res.status(200).json({
            data: result
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = { processPendingRechargeApi };
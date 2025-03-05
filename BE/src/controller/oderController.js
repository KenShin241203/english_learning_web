const { processPendingOrder, getAllOrderService } = require('../services/orderService')
const Order = require('../models/order')

const processPendingOrderApi = async (req, res) => {
    try {

        const result = await processPendingOrder(req.params.orderId)
        res.status(200).json({
            data: result
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const getAllOrderApi = async (req, res) => {
    const totalDocuments = await Order.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllOrderService(req.query);
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: {
                meta: {
                    currentPage: current,
                    pageSize: limit,
                    totalPages: totalPages,
                    totalEntity: totalDocuments
                },
                result
            }
        })
    }

}

module.exports = { processPendingOrderApi, getAllOrderApi }
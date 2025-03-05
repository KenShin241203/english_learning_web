const Order = require('../models/order')
const { addUserToCourse } = require('../services/user_courseSevice')
const { default: aqp } = require('api-query-params');
const processPendingOrder = async (orderId) => {
    try {
        // Tìm order theo orderId
        const order = await Order.findOne({ orderId });

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra trạng thái của order
        if (order.status === 'success') {
            // Gọi service addUserToCourse
            const result = await addUserToCourse(order.userId, order.courseId);

            return { message: 'Order processed successfully', result };
        } else {
            throw new Error('Order is in pending status');
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllOrderService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Order.find(filter)
        .populate({
            path: "userId",
            select: "email"
        }
        )
        .populate({
            path: "courseId",
            select: "name"
        })
        .skip(offset)
        .limit(limit).exec()
    const formattedOrder = result.map(order => ({
        _id: order._id,
        orderId: order.orderId,
        email: order.userId.email,
        courseName: order.courseId.name,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
    }));
    return formattedOrder
}


const deleteOrderService = async (orderId) => {
    try {
        const order = await
            Order.findOneAndDelete({ orderId });
        if (!order) {
            throw new Error('Order not found');
        }
        return { message: 'Delete order successfully' };
    }
    catch (error) {
        throw new Error(error.message);
    }
}
module.exports = { processPendingOrder, getAllOrderService, deleteOrderService };
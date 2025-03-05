const Order = require('../models/order')

const getRevenueOrderStats = async (startDate, endDate) => {
    try {
        // Lọc các order có status = 'success'
        const matchCondition = { status: 'success' };
        if (startDate && endDate) {
            matchCondition.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        const successfulOrders = await Order.aggregate([
            { $match: matchCondition }, // Chỉ lấy các order thành công
            {
                $group: {
                    _id: "$courseId", // Nhóm theo courseId
                    totalRevenue: { $sum: "$amount" }, // Tính tổng doanh thu
                    totalOrders: { $sum: 1 } // Đếm số lượng order
                }
            },
            {
                $lookup: {
                    from: "courses", // Join với collection courses
                    localField: "_id",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            },
            {
                $unwind: "$courseDetails" // Giải nén mảng courseDetails
            },
            {
                $project: {
                    courseId: "$_id",
                    courseName: "$courseDetails.name",
                    totalRevenue: 1,
                    totalOrders: 1,
                    _id: 0
                }
            }
        ]);

        return successfulOrders;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { getRevenueOrderStats };

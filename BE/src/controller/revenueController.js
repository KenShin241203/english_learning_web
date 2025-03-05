const { getRevenueOrderStats } = require('../services/revenueService');

const getRevenueOrderStatsApi = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Lấy các tham số từ query string
        const stats = await getRevenueOrderStats(startDate, endDate); // Gọi hàm từ service
        res.status(200).json(stats); // Trả về dữ liệu
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRevenueOrderStatsApi };

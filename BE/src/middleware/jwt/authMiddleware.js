const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const verifyToken = async (req, res, next) => {
    // Kiểm tra và lấy token từ Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password'); // Tìm người dùng dựa vào userId
        if (!user) throw new Error('User not found');
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
}

module.exports = verifyToken
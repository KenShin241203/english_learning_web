
const Course = require('../models/course')
const User = require('../models/user')
const searchingCourseApi = async (req, res) => {
    try {
        const { query, userId } = req.query;
        const courses = await Course.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },

            ]
        });

        if (!userId) {
            return res.json(courses);
        }

        // Kiểm tra xem người dùng đã tham gia khóa học chưa
        const user = await User.findById(userId).populate('courseInfo');
        const enrolledCourses = new Set(user.courseInfo.map(course => course._id.toString()));

        const results = courses.map(course => ({
            ...course.toObject(),
            isEnrolled: enrolledCourses.has(course._id.toString()),
        }));

        res.json(results); // Trả về mảng khóa học (có thể rỗng nếu không tìm thấy)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tìm kiếm khóa học', error });
    }
}

module.exports = { searchingCourseApi }
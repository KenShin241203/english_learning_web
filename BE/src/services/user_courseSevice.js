const User = require('../models/user');
const Course = require('../models/course');

// Service để thêm khóa học cho user và cập nhật user cho khóa học
const addUserToCourse = async (userId, courseId) => {
    try {
        // Tìm user và course theo ID
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user || !course) {
            throw new Error('User or Course not found');
        }

        // Thêm khóa học vào danh sách courses của user nếu chưa có
        if (!user.courseInfo.includes(courseId)) {
            user.courseInfo.push(courseId);
        }

        // Thêm user vào danh sách users của course nếu chưa có
        if (!course.userInfo.includes(userId)) {
            course.userInfo.push(userId);
        }

        // Lưu cả user và course
        await user.save();
        await course.save();

        return { message: 'User and Course updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { addUserToCourse };
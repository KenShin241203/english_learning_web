const express = require('express');
const User = require('../models/user');
const routerApi = express.Router();




//File controller
const { postUploadSingleFileApi } = require('../controller/fileController');

const { addUserToCourse } = require('../services/user_courseSevice');

//auth middleware 
const authorizeRoles = require('../middleware/jwt/roleMiddleware')
const verifyToken = require('../middleware/jwt/authMiddleware');


//Searching
const { searchingCourseApi } = require('../controller/searchingController');



//Revenue oder
const { getRevenueOrderStatsApi } = require('../controller/revenueController');



//Revenue Api
routerApi.get('/revenue-stats', verifyToken, authorizeRoles("admin"), getRevenueOrderStatsApi)

//File Api 
routerApi.post('/single-file', postUploadSingleFileApi);
// Route để add user vào course
routerApi.post('/add-user-to-course', async (req, res) => {
    const { userId, courseId } = req.body;

    try {
        const result = await addUserToCourse(userId, courseId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


//api check xem course da co trong user chua
routerApi.get('/users_courses/:courseId/:userId/status', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.params.userId;
        const user = await User.findById(userId);
        const enrolled = user.courseInfo.includes(courseId); // Kiểm tra xem courseId có trong danh sách courses của user không

        res.json({ enrolled });
    } catch (error) {
        console.error("Error checking course enrollment status:", error);
        res.status(500).json({ message: 'Server error' });
    }
});




routerApi.get('/search', searchingCourseApi);


module.exports = routerApi;
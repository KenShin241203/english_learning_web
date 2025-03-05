const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');
//Progress 
const { markLessonCompleteApi, getCompletionPercentageApi, getProgressApi, getTotalLessonCompletedApi } = require('../../controller/progressController');

//Progress Api
routerApi.post('/progress/markLessonComplete', verifyToken, markLessonCompleteApi)
routerApi.get('/progress/completionPercentage/:userId/:courseId', verifyToken, getCompletionPercentageApi)
routerApi.get('/progress/totalLessonCompleted/:userId/:courseId', verifyToken, getTotalLessonCompletedApi)
routerApi.get('/progress/:userId/:courseId', verifyToken, getProgressApi)

module.exports = routerApi;
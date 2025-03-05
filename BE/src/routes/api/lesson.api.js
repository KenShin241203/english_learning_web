const express = require('express');
const routerApi = express.Router();

//Lesson controller
const { getLessonsApi, postCreateLessonApi, updateLessonApi, deleteLessonApi,
    deleteManyLessonApi, postCreateManyLessonApi, updateManyLessonApi,
    getLessonById } = require('../../controller/lessonController');

//Validate Lesson
const lessonValidate = require('../../middleware/validate/validateLesson');

//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Lesson Api
routerApi.get('/lesson', getLessonsApi);
routerApi.get('/lesson/:id', getLessonById)
routerApi.post('/lesson', lessonValidate, verifyToken, authorizeRoles("admin"), postCreateLessonApi);
routerApi.put('/lesson', verifyToken, authorizeRoles("admin"), updateLessonApi);
routerApi.delete('/lesson/:id', verifyToken, authorizeRoles("admin"), deleteLessonApi);
routerApi.post('/many_lesson', verifyToken, authorizeRoles("admin"), postCreateManyLessonApi);
routerApi.put('/many_lesson', verifyToken, authorizeRoles("admin"), updateManyLessonApi);
routerApi.delete('/many_lesson', verifyToken, authorizeRoles("admin"), deleteManyLessonApi);

module.exports = routerApi;
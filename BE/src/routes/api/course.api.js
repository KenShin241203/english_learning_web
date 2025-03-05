const express = require('express');
const routerApi = express.Router();
//Course controller
const { getCourseApi, postCreateCourseApi, postCreateManyCourseApi, updateCourseApi,
    deleteCourseApi, deleteManyCourseApi, getCourseWithChapters, getCourseByIdApi } = require('../../controller/courseController');
//Validate Course
const validateCourse = require('../../middleware/validate/validateCourse');
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Course Api
routerApi.get('/course', getCourseApi);
routerApi.get('/course/:id', getCourseByIdApi);
routerApi.post('/course', validateCourse, verifyToken, authorizeRoles("admin"), postCreateCourseApi);
routerApi.put('/course', verifyToken, authorizeRoles("admin"), updateCourseApi);
routerApi.delete('/course/:id', verifyToken, authorizeRoles("admin"), deleteCourseApi);
routerApi.post('/many_course', verifyToken, authorizeRoles("admin"), postCreateManyCourseApi);
routerApi.delete('/many_course', verifyToken, authorizeRoles("admin"), deleteManyCourseApi);
routerApi.get('/course_chapters/:id', verifyToken, authorizeRoles("admin", "user"), getCourseWithChapters);

module.exports = routerApi;
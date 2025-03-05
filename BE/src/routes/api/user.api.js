
const express = require('express');
const routerApi = express.Router();
//User controller
const { getUsersApi, postCreateUserApi, postCreateManyUserApi,
    updateUserApi, deleteUserApi, deleteManyUserApi, getUserCourseApi } = require('../../controller/userController');


//Validate User
const validateUser = require('../../middleware/validate/validateUser');
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');
//User Api
routerApi.get('/users', verifyToken, authorizeRoles("admin"), getUsersApi);
routerApi.get('/users_courses/:id', verifyToken, getUserCourseApi)
routerApi.post('/users', verifyToken, authorizeRoles("admin"), validateUser, postCreateUserApi);
routerApi.put('/users', verifyToken, authorizeRoles("admin"), updateUserApi);
routerApi.delete('/users/:id', verifyToken, authorizeRoles("admin"), deleteUserApi);
routerApi.post('/many_user', verifyToken, authorizeRoles("admin"), postCreateManyUserApi);
routerApi.delete('/many_user', verifyToken, authorizeRoles("admin"), deleteManyUserApi);

module.exports = routerApi;
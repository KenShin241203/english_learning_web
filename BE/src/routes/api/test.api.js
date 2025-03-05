const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Test controller
const { getTestsApi, postCreateTestApi, updateTestApi, deleteTestApi, deleteManyTestApi,
    postCreateManyTestApi, updateManyTestApi, getTestById } = require('../../controller/testController');

//Validate Test
const validateTest = require('../../middleware/validate/validateTest');
//Test Api
routerApi.get('/test', getTestsApi);
routerApi.get('/test/:id', getTestById)
routerApi.post('/test', validateTest, verifyToken, authorizeRoles("admin"), postCreateTestApi);
routerApi.put('/test', verifyToken, authorizeRoles("admin"), updateTestApi);
routerApi.delete('/test/:id', verifyToken, authorizeRoles("admin"), deleteTestApi);
routerApi.delete('/many_test', verifyToken, authorizeRoles("admin"), deleteManyTestApi);
routerApi.post('/many_test', verifyToken, authorizeRoles("admin"), postCreateManyTestApi);
routerApi.put('/many_test', verifyToken, authorizeRoles("admin"), updateManyTestApi);

module.exports = routerApi;
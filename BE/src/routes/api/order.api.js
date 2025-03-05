const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Process Order
const { processPendingOrderApi, getAllOrderApi } = require('../../controller/oderController');

//Order Api
routerApi.get('/process/order/:orderId', verifyToken, processPendingOrderApi)
routerApi.get('/get-all-order', verifyToken, authorizeRoles("admin"), getAllOrderApi)

module.exports = routerApi;
const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Process Recharge
const { processPendingRechargeApi } = require('../../controller/rechargeController');

//Order Api
routerApi.get('/process/recharge/:orderId', verifyToken, processPendingRechargeApi)


module.exports = routerApi;
const express = require('express');
const router = express.Router();

// Import controllers
const { createPayment, handleCallback, checkStatusTrans } = require('../payment/momo.payment');
const { createRechargePayment, handleCallbackRecharge } = require('../payment/momo.recharge');

// 1. Tạo thanh toán MoMo
router.post('/create-payment', createPayment);

// 2. Xử lý callback từ MoMo
router.post('/callback', handleCallback);

// 3. Kiểm tra trạng thái giao dịch
router.post('/check-status', checkStatusTrans);

router.post('/create-recharge-payment', createRechargePayment);

router.post('/callback/recharge', handleCallbackRecharge);
module.exports = router;

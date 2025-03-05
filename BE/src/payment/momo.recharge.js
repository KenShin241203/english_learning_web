const axios = require('axios');
const config = require('./recharge.config');
const Recharge = require('../models/recharge');
const crypto = require('crypto');



const createRechargePayment = async (req, res) => {
    const { userId, tokenPackageId, amount } = req.body;

    if (!userId || !tokenPackageId || !amount) {
        return res.status(400).json({ message: 'Thông tin không đầy đủ!' });
    }

    const orderId = config.partnerCode + new Date().getTime(); // Tạo mã orderId duy nhất

    // Lưu giao dịch vào DB
    const newRecharge = new Recharge({
        orderId,
        userId,
        tokenPackageId,
        amount,
    });

    try {
        await newRecharge.save();
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi lưu giao dịch!', error });
    }

    // Tạo thanh toán MoMo
    const rawSignature =
        'accessKey=' +
        config.accessKey +
        '&amount=' +
        amount +
        '&extraData=' +
        config.extraData +
        '&ipnUrl=' +
        config.ipnUrl +
        '&orderId=' +
        orderId +
        '&orderInfo=' +
        config.orderInfo +
        '&partnerCode=' +
        config.partnerCode +
        '&redirectUrl=' +
        config.redirectUrl +
        '&requestId=' +
        orderId +
        '&requestType=' +
        config.requestType;

    const signature = crypto
        .createHmac('sha256', config.secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode: config.partnerCode,
        partnerName: 'Test',
        storeId: 'MomoTestStore',
        requestId: orderId,
        amount,
        orderId,
        orderInfo: config.orderInfo,
        redirectUrl: config.redirectUrl,
        ipnUrl: config.ipnUrl,
        lang: config.lang,
        requestType: config.requestType,
        extraData: config.extraData,
        signature,
    };

    try {
        const momoResponse = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);

        if (momoResponse.data && momoResponse.data.payUrl) {
            // Trả về link thanh toán
            return res.status(200).json({
                message: 'Tạo thanh toán thành công!',
                payUrl: momoResponse.data.payUrl,
                orderId,
            });
        } else {
            return res.status(500).json({ message: 'Không thể tạo thanh toán MoMo!' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi kết nối MoMo!', error: error.message });
    }
};

const handleCallbackRecharge = async (req, res) => {
    const { orderId, resultCode } = req.body;
    if (!orderId || resultCode === undefined) {
        return res.status(400).json({ message: 'Thiếu dữ liệu từ MoMo!' });
    }

    try {
        // Tìm giao dịch
        const recharge = await Recharge.findOne({ orderId });
        if (!recharge) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch!' });
        }

        // Cập nhật trạng thái
        if (resultCode === 0) {
            recharge.status = 'success'; // Thanh toán thành công
        } else {
            recharge.status = 'failed'; // Thanh toán thất bại
        }

        await recharge.save();

        return res.status(200).json({ message: 'Cập nhật trạng thái giao dịch thành công!' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi cập nhật giao dịch!', error });
    }
};


module.exports = { createRechargePayment, handleCallbackRecharge };
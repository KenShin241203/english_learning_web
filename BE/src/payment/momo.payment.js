//demo payment momo by "collection link"
const axios = require('axios');
const config = require('./payment.config');
const Order = require('../models/order');
const crypto = require('crypto');



const createPayment = async (req, res) => {
    const { userId, courseId, amount } = req.body;

    if (!userId || !courseId || !amount) {
        return res.status(400).json({ message: 'Thông tin không đầy đủ!' });
    }

    const orderId = config.partnerCode + new Date().getTime(); // Tạo mã orderId duy nhất

    // Lưu giao dịch vào DB
    const newOrder = new Order({
        orderId,
        userId,
        courseId,
        amount,
    });

    try {
        await newOrder.save();
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

const handleCallback = async (req, res) => {
    const { orderId, resultCode } = req.body;

    if (!orderId || resultCode === undefined) {
        return res.status(400).json({ message: 'Thiếu dữ liệu từ MoMo!' });
    }

    try {
        // Tìm giao dịch
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch!' });
        }

        // Cập nhật trạng thái
        if (resultCode === 0) {
            order.status = 'success'; // Thanh toán thành công
        } else {
            order.status = 'failed'; // Thanh toán thất bại
        }

        await order.save();

        return res.status(200).json({ message: 'Cập nhật trạng thái giao dịch thành công!' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi cập nhật giao dịch!', error });
    }
};



const checkStatusTrans = async (req, res) => {
    const { orderId } = req.body;

    // const signature = accessKey=$accessKey&orderId=$orderId&partnerCode=$partnerCode
    // &requestId=$requestId
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var accessKey = 'F8BBA842ECF85';
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: 'MOMO',
        requestId: orderId,
        orderId: orderId,
        signature: signature,
        lang: 'vi',
    });

    // options for axios
    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/query',
        headers: {
            'Content-Type': 'application/json',
        },
        data: requestBody,
    };

    const result = await axios(options);

    return res.status(200).json(result.data);
};

module.exports = { createPayment, handleCallback, checkStatusTrans }

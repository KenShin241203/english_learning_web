import React, { useEffect, useState, useContext } from 'react';
import { Button, Result, Spin, message } from 'antd';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { updateAfterRechargeSuccess } from '../../../services/api.recharge.service';

const SuccessfulRecharge = () => {
    const [loading, setLoading] = useState(true);
    const [transactionValid, setTransactionValid] = useState();
    const location = useLocation(); // Để lấy orderId từ URL hoặc state
    const navigate = useNavigate();

    useEffect(() => {
        const checkTransaction = async () => {
            const searchParams = new URLSearchParams(location.search);
            console.log(searchParams)
            const orderId = searchParams.get('orderId'); // Lấy orderId từ query params
            if (!orderId) {
                message.error("Order ID is missing.");
                navigate('/'); // Chuyển về trang chủ nếu không có orderId
                return;
            }

            try {
                const response = await updateAfterRechargeSuccess(orderId);

                if (response.data) {
                    setTransactionValid(true); // Giao dịch thành công
                } else {
                    setTransactionValid(false)
                }
            } catch (error) {
                console.error("Error checking transaction:", error);
                message.error("Failed to verify transaction.");
                navigate('/'); // Quay lại trang chủ nếu có lỗi
            } finally {
                setLoading(false); // Kết thúc loading
            }
        };

        checkTransaction();
    }, [location.search, navigate]);


    // Nếu giao dịch thành công
    if (transactionValid) {
        return (
            <Result
                style={{ paddingTop: '250px' }}
                status="success"
                title="Successfully Recharged Token"
                extra={[
                    <Button type="primary" key="console">
                        <Link to="/">
                            <span>Back to homepage</span>
                        </Link>
                    </Button>,
                ]}
            />
        );
    }

    // Nếu giao dịch thất bại
    return (
        <Result
            style={{ paddingTop: '250px' }}
            status="error"
            title="Submission Failed"
            subTitle="Please check and modify the following information before resubmitting."
            extra={[
                <Button type="primary" key="console">
                    <Link to="/">
                        <span>Back to homepage</span>
                    </Link>
                </Button>,
                <Button key="buy">Buy Again</Button>,
            ]}
        >
        </Result>
    );
}

export default SuccessfulRecharge
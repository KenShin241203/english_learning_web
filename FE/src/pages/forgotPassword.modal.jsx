import { Modal, Button, Form, Input, Steps, message } from 'antd';
import { useState } from 'react';
import { forgotPasswordApi, resetPasswordApi } from '../services/api.resetPassword.service';
import { CheckCircleOutlined } from '@ant-design/icons';
const { Step } = Steps;

const ForgotPasswordModal = ({ visible, onClose }) => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const next = () => setCurrent(current + 1);
    const prev = () => setCurrent(current - 1);

    const handleEmailSubmit = async () => {
        const values = await form.validateFields(['email']);
        console.log(values);
        setLoading(true);
        const res = await forgotPasswordApi(values.email);
        setLoading(false);
        if (res.status === 200) {
            message.success('Verification code sent to email');
            setEmail(values.email);
            next();
        } else {
            message.error(res.message);
        }
    };

    const handleCodeSubmit = async () => {
        const values = await form.validateFields(['verificationCode']);
        next();
    };

    const handlePasswordSubmit = async () => {
        const values = await form.validateFields(['newPassword', 'verificationCode', 'confirmPassword']);
        console.log(values);
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }
        setLoading(true);
        const res = await resetPasswordApi(email, values.verificationCode, values.newPassword);
        setLoading(false);
        if (res.status === 200) {
            message.success('Password reset successfully');
            next();
        } else {
            message.error(res.message);
        }
    };

    const steps = [
        {
            title: 'Email',
            content: (
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            ),
        },
        {
            title: 'Verification Code',
            content: (
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Verification Code"
                        name="verificationCode"
                        rules={[{ required: true, message: 'Please input the verification code!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            ),
        },
        {
            title: 'New Password',
            content: (
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[{ required: true, message: 'Please input your new password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item

                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Please confirm your new password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            ),
        },
        {
            title: 'Done',
            content: <div style={{ textAlign: 'center' }}><CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} /><p>Password reset successfully</p></div>,
        },
    ];

    return (
        <Modal visible={visible} onCancel={onClose} footer={null}>
            <Steps current={current}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div className="steps-content" style={{ fontSize: '10px' }}>{steps[current].content}</div>
            <div className="steps-action">
                {current < steps.length - 2 && (
                    <Button type="primary" onClick={current === 0 ? handleEmailSubmit : handleCodeSubmit} loading={loading}>
                        Next
                    </Button>
                )}
                {current === steps.length - 2 && (
                    <Button type="primary" onClick={handlePasswordSubmit} loading={loading}>
                        Submit
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" onClick={onClose}>
                        Done
                    </Button>
                )}
                {current > 0 && <Button onClick={() => prev()}>Previous</Button>}
            </div>
        </Modal>
    );
};

export default ForgotPasswordModal;
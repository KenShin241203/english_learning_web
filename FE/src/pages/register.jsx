import { Form, Button, Input, notification, Row, Col, Divider, Modal } from "antd";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUserAPI, verifyCode } from "../services/api.user.service"


const RegisterPage = () => {
    const [form] = Form.useForm();
    const [verificationForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState(""); // Lưu email sau khi đăng ký


    const navigate = useNavigate()
    const onFinish = async (values) => {
        try {
            const { name, email, password, repeat_password, phone } = values;
            setEmail(email); // Lưu email để sử dụng trong verify

            // Gọi API đăng ký và gửi mã xác nhận
            const res = await registerUserAPI(name, email, password, repeat_password, phone);
            if (res && res.data) {
                notification.success({
                    message: "Register user",
                    description: "Verification code has been sent to your email!",
                });
                setIsModalOpen(true); // Mở modal nhập mã xác nhận
            } else {
                notification.error({
                    message: "Register user error",
                    description: JSON.stringify(res.message),
                });
            }
        } catch (error) {
            console.error(error);
            notification.error({
                message: "Error",
                description: "Something went wrong during registration.",
            });
        }
    };

    const handleVerifyCode = async (values) => {
        try {
            const { verificationCode } = values;

            // Gọi API xác nhận mã
            const res = await verifyCode(email, verificationCode);
            if (res && res.data) {
                notification.success({
                    message: "Verification Success",
                    description: "Your account has been successfully created!",
                });
                setIsModalOpen(false); // Đóng modal
                navigate("/login"); // Chuyển đến trang đăng nhập
            } else {
                notification.error({
                    message: "Verification Error",
                    description: res.message || "Invalid verification code!",
                });
            }
        } catch (error) {
            console.error(error);
            notification.error({
                message: "Error",
                description: "Something went wrong during verification.",
            });
        }
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ margin: "100px", display: "block" }}
            >
                <Row justify={"center"}>
                    <Col xs={20} md={12}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your fullName!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"center"}>
                    <Col xs={20} md={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your email!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                </Row>
                <Row justify={"center "} >
                    <Col xs={20} md={6} >

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    </Col>
                    <Col xs={20} md={6}>
                        <Form.Item
                            label="Confirm Password"
                            name="repeat_password"
                            dependencies={["password"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match!"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    </Col>
                </Row>
                <Row justify={"center"}>
                    <Col xs={20} md={12}>
                        <Form.Item
                            label="Phone number"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    pattern: new RegExp(/\d+/g),
                                    message: "Wrong format!"
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                </Row>

                <Row justify={"center"}>
                    <Col xs={20} md={12}>
                        <div>
                            <Button
                                onClick={() => form.submit()}
                                type="primary">Register</Button>
                        </div>
                        <Divider />
                        <div>Đã có tài khoản? <Link to={"/login"}>Đăng nhập tại đây</Link></div>

                    </Col>
                </Row>



            </Form>
            {/* Modal nhập mã xác nhận */}
            <Modal
                title="Verify Email"
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={verificationForm}
                    layout="vertical"
                    onFinish={handleVerifyCode}
                >
                    <Form.Item
                        label="Verification Code"
                        name="verificationCode"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the verification code sent to your email!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form>
            </Modal>
        </>

    )
}

export default RegisterPage
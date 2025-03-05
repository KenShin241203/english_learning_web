import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Divider, Checkbox, message, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api.user.service";
import { useState, useContext } from "react";
import { AuthContext } from "../components/context/auth.context";
import Footer from "../components/user/layout/footer";
import ForgotPasswordModal from "./forgotPassword.modal";
const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const { setUser } = useContext(AuthContext)


    const onFinish = async (values) => {
        setLoading(true)
        const res = await loginAPI(values.email, values.password)
        if (res.data) {
            message.success("Login Sucessfully")
            localStorage.setItem("access_token", res.accessToken);
            setLoading(false)
            setUser(res.data)
            navigate("/")
            return
        }
        else {
            notification.error({
                message: "Login failed",
                description: JSON.stringify(res.message)
            })
            setLoading(false)
        }
        setLoading(false)
    }
    const onKeyEnter = (event) => {
        if (event.key === "Enter")
            form.submit()
    }

    return (
        <>
            <Row justify={"center"} style={{ marginTop: "100px" }}>
                <Col xs={24} md={16} lg={8}>
                    <fieldset style={{
                        padding: "15px",
                        margin: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}>
                        <legend>Login</legend>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Email không được để trống!',
                                    },
                                    {
                                        type: "email",
                                        message: 'Email không đúng định dạng!',
                                    },
                                ]}
                            >
                                <Input onKeyDown={(event) => onKeyEnter(event)} />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Password không được để trống!',
                                    },
                                ]}
                            >
                                <Input.Password onKeyDown={(event) => onKeyEnter(event)} />
                            </Form.Item >
                            <Form.Item
                                name="checked"
                            >
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>

                            <Form.Item >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <Button loading={loading}
                                        type="primary" onClick={() => form.submit()}>
                                        Login
                                    </Button>
                                    <a onClick={() => setForgotPasswordVisible(true)}>Forgot password?</a>
                                </div>


                                <br />
                                <Link to="/"><ArrowLeftOutlined /> Go to homepage</Link>

                            </Form.Item>
                        </Form>
                        <Divider />
                        <div style={{ textAlign: "center" }}>
                            Chưa có tài khoản? <Link to={"/register"}>Đăng ký tại đây</Link>
                        </div>
                    </fieldset>
                </Col>
            </Row>
            <ForgotPasswordModal visible={forgotPasswordVisible} onClose={() => setForgotPasswordVisible(false)} />
        </>
    )
}

export default LoginPage;

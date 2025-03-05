import { useContext, useEffect, useState, useRef } from 'react';
import { CameraOutlined } from '@ant-design/icons';
import { notification, Form, Input, Button, Typography, message, Space, Avatar, Image, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { LogoutApi, getAccount, handleUploadFile, updateUserApi, uploadAvatarUserApi } from '../../services/api.user.service';
import { AuthContext } from '../../components/context/auth.context';
import Footer from '../../components/user/layout/footer';
import './editProfile.page.css';
import Header from '../../components/user/layout/header';
import { forgotPasswordApi, resetPasswordApi } from '../../services/api.resetPassword.service';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { Title } = Typography;

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isViewAccountInfo, setIsViewAccountInfo] = useState(true);
    const [isPasswordChange, setIsPasswordChange] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        loadAccountData();
        return () => clearInterval(timerRef.current);
    }, [user]);

    const loadAccountData = async () => {
        setLoading(true);
        try {
            const accountData = await getAccount();
            setAvatarUrl(accountData.data.avatar);
            form.setFieldsValue(accountData.data);
        } catch (error) {
            message.error("Không thể tải thông tin người dùng");
        }
        setLoading(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const resUpload = await handleUploadFile(selectedFile, "avatar");
            const { _id, name, email, phone, newPassword, confirmPassword, role } = values;
            if (resUpload.data) {
                const newAvatar = resUpload.data.path;
                const resUpdateAvatar = await uploadAvatarUserApi(newAvatar, _id, name, phone);
                if (resUpdateAvatar.data.modifiedCount === 1) {
                    setPreview(null);
                    await loadAccountData();
                }
            }
            const res = await updateUserApi(_id, name, email, phone, newPassword, confirmPassword, role);
            if (res.data.modifiedCount === 1) {
                message.success('Cập nhật hồ sơ thành công');
                await loadAccountData();
            }
        } catch (error) {
            message.error(error);
        }
        setLoading(false);
    };

    const handleOnChangeFile = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            setSelectedFile(null);
            setPreview(null);
            return;
        }
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const values = await form.validateFields(['newPassword', 'verificationCode', 'confirmPassword']);
        console.log(user.email);
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }
        setLoading(true);
        const res = await resetPasswordApi(user.email, values.verificationCode, values.newPassword);
        setLoading(false);
        if (res.status === 200) {
            message.success('Password reset successfully');
            const res1 = await LogoutApi()
            console.log(res1)
            if (res1.data) {
                localStorage.removeItem("access_token")
                setUser({
                    "_id": "",
                    "name": "",
                    "email": "",
                    "password": "",
                    "phone": "",
                    "avatar": "",
                    "role": "",
                    "courseInfo": [],
                    "reviewInfo": [],
                })
                navigate("/login")
                return
            }
        } else {
            message.error(res.message);
        }
    };


    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
    };

    const toggleViewAccountInfo = () => {
        setIsViewAccountInfo(true);
        setIsPasswordChange(false);
    };

    const togglePasswordChange = () => {
        setIsViewAccountInfo(false);
        setIsPasswordChange(true);
    };

    const startCountdown = async () => {
        setCountdown(60);
        timerRef.current = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        console.log(user.email);
        const res = await forgotPasswordApi(user.email);
        setLoading(false);
        if (res.status === 200) {
            message.success('Verification code sent to email');
        } else {
            message.error(res.message);
        }
    };

    return (
        <>
            <Header />
            <div className="edit-profile-page">
                <div className="content-profile">
                    <div className="left-container">
                        <div className="avatar-upload">
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Image
                                    width={140}
                                    height={140}
                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${avatarUrl}`}
                                    preview={{
                                        maskClassName: 'ant-image-preview-mask',
                                    }}
                                    style={{
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    }}
                                    fallback="/images/default-avatar.png"
                                />
                                <label htmlFor="fileUpload" className="upload-icon" >
                                    <CameraOutlined />
                                </label>
                                <input
                                    type="file"
                                    id="fileUpload"
                                    hidden
                                    onChange={handleOnChangeFile}
                                />
                                {preview && (
                                    <div className="preview-container">
                                        <Image
                                            width={150}
                                            src={preview}
                                            style={{ borderRadius: '50%' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div onClick={toggleViewAccountInfo} className="menu-div">
                                Thông tin tài khoản
                            </div>
                            <div onClick={togglePasswordChange} className="menu-div">
                                Đổi mật khẩu
                            </div>
                        </div>
                    </div>
                    <div className="right-container">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="edit-profile-form"
                        >
                            <Title level={2}>Chỉnh sửa hồ sơ</Title>
                            {isViewAccountInfo && (
                                <>
                                    <Form.Item
                                        label="ID"
                                        name="_id"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        label="Tên người dùng"
                                        name="name"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Space>
                                        <Button onClick={handleCancel} style={{ width: '100px' }}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100px' }}>
                                            Lưu
                                        </Button>
                                    </Space>
                                </>
                            )}
                            {isPasswordChange && (
                                <>
                                    <Form.Item
                                        style={{ width: '50%' }}
                                        label="Mật khẩu mới"
                                        name="newPassword"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                    <Form.Item
                                        style={{ width: '50%' }}
                                        label="Nhập lại mật khẩu mới"
                                        name="confirmPassword"
                                        rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu mới' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                    <Form.Item
                                        style={{ width: '300px' }}
                                        label="Mã code"
                                        name="verificationCode"
                                        rules={[{ required: true, message: 'Vui lòng nhập mã code' }]}
                                    >
                                        <div className="code-button-container">
                                            <Input style={{ flex: 1 }} />
                                            <Button
                                                type="primary"
                                                onClick={startCountdown}
                                                disabled={countdown > 0}
                                                className={countdown > 0 ? "ant-btn-countdown" : ""}
                                                style={{ marginLeft: '10px', width: '120px' }}
                                            >
                                                {countdown > 0 ? `${countdown}s` : 'Gửi mã'
                                                }
                                            </Button>
                                        </div>
                                    </Form.Item>
                                    <Space>
                                        <Button onClick={handleCancel} style={{ width: '100px' }}>
                                            Hủy
                                        </Button>
                                        <Button onClick={handleSubmit} type="primary" htmlType="submit" loading={loading} style={{ width: '100px' }}>
                                            Lưu
                                        </Button>
                                    </Space>
                                </>
                            )}

                        </Form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProfilePage;
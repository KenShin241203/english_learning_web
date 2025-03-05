import {
    Menu, message, theme, Layout, Drawer, Button, Avatar, Input, Modal, Radio, Space,
    Row, Col
} from "antd";
import { useState, useContext, useEffect } from "react";
import {
    HomeOutlined, AppstoreOutlined, UserOutlined, LoginOutlined, CrownOutlined, LogoutOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { FaCoins } from 'react-icons/fa';
import { AuthContext } from "../../context/auth.context";
import { LogoutApi } from "../../../services/api.user.service";
import './css/homePage.css'
import './css/header.css'
import SearchComponent from "../searching/searching.course";
import { fetchTokenPackWithoutPagination, fetchTokenPackageByIdApi } from "../../../services/api.tokenPackage.service";
import MomoIcon from '../../../../public/MoMo_Logo.png';
import ZaloPayIcon from '../../../../public/zalopay-logo.png';
import { createRechargePayment } from "../../../services/api.recharge.service";
const Header = () => {
    const { Header } = Layout;
    const [current, setCurrent] = useState('');
    const [visible, setVisible] = useState(false); // Drawer visibility state
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
    const [tokenPackages, setTokenPackages] = useState([]); // State for token packages
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const { user, setUser } = useContext(AuthContext);
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const navigate = useNavigate()

    const onClick = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await LogoutApi()
        if (res.data) {
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
            message.success("Logout successfully")
            navigate("/login")
        }
    }


    // Reset current menu selection when clicking outside
    useEffect(() => {
        document.addEventListener("click", handleClickOutside);

        // Cleanup event listener
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handlePlusClick = async () => {
        const res = await fetchTokenPackWithoutPagination();

        if (res.data) {
            setTokenPackages(res.data);
        }
        setIsModalVisible(true); // Show modal on plus sign click
    };

    const handlePurchaseClick = async () => {
        if (!selectedPackage) {
            message.error("Please select a package");
            return;
        }
        if (!paymentMethod) {
            message.error("Please select a payment method");
            return;
        }
        handlePurchase();
    }

    const handlePurchase = async () => {
        const tokenPackageId = selectedPackage;

        const pricePack = await fetchTokenPackageByIdApi(selectedPackage);
        try {
            const response = await createRechargePayment(user._id, tokenPackageId, pricePack.data.price);
            if (response.data.payUrl) {
                window.location.href = response.data.payUrl;
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
        }
    }
    const handleCancel = () => {
        setIsModalVisible(false); // Hide modal
    };

    const handleClickOutside = (event) => {
        const menuElement = document.querySelector(".ant-menu");
        if (menuElement && !menuElement.contains(event.target)) {
            setCurrent('');
        }
    };




    const items = [
        // {
        //     label: <Link to={"/"}><img src={ESIcon} alt="ES Icon" className="es-icon" /></Link>,// Add ES icon
        //     key: 'es-icon',
        // },
        {
            label: <SearchComponent />,
            key: 'search',
        },
        {
            className: "title-direct",
            label: <Link to={"/"}>Trang chủ</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            className: "title-direct",
            label: <Link to='/mycourse'>Khoá học của bạn</Link>,
            key: 'app',
            icon: <AppstoreOutlined />,
        },
        ...(user._id ? [{
            label:
                <div className="token-points"><FaCoins />
                    Token Points: {user.tokens}
                    <PlusOutlined onClick={handlePlusClick} style={{ marginLeft: '10px', cursor: 'pointer' }} />
                </div>,
            key: 'tokenPoints'
        }] : []),
        ...(!user._id ? [{
            className: "title-direct",
            label: <Link to={"/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),

        ...(user._id ? [{
            // label: `Welcome ${user.name}`,
            key: 'setting',
            icon: <Avatar size={35} style={{ marginTop: '17px', position: 'cover' }}
                src={<img src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`} alt="avatar" />} />,
            children: [
                ...(user.role === 'admin' ? [{
                    label: <Link to={"/admin"}>Admin</Link>,
                    icon: <CrownOutlined />,
                }] : []),
                {
                    label: <Link to={"/editProfile"}>Hồ sơ cá nhân</Link>,
                    icon: <UserOutlined />,
                    key: 'profile',
                },
                {
                    label: <span onClick={() => handleLogout()}>Đăng xuất</span>,
                    icon: <LogoutOutlined />,
                    key: 'logout'
                }
            ],
        }] : [])
    ];

    // Toggle drawer visibility
    const showDrawer = () => setVisible(true);
    const closeDrawer = () => setVisible(false);
    return (<Header className="header-fixed">


        {/* Mobile view: Drawer Button */}
        <Button className="menu-mobile-button" onClick={showDrawer} icon={<AppstoreOutlined />} />

        {/* Desktop view: Menu */}
        <Menu
            onClick={onClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
            style={{ display: 'flex', alignItems: 'center', justifyContent: "right", gap: "30px", padding: "0 20px" }}
        />

        {/* Drawer for mobile */}
        <Drawer
            title="Menu"
            placement="right"
            closable={true}
            onClose={closeDrawer}
            visible={visible}
            width={250}
        >
            <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="inline"
                items={items}
            />
        </Drawer>

        <Modal
            title="Purchase Tokens"
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handlePurchaseClick} >
                    Thanh toán
                </Button>,
            ]}
        >
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                {tokenPackages.map((pkg) => (
                    <Col span={12} key={pkg._id}>
                        <div
                            className={`package-div ${selectedPackage === pkg._id ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedPackage(pkg._id)
                            }}
                        >
                            <FaCoins />
                            <h3>{pkg.name}</h3>
                            <p>{pkg.price.toLocaleString()} VND</p>
                        </div>
                    </Col>
                ))}
            </Row>
            <h3>Chọn phương thức thanh toán</h3>
            <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ marginTop: '16px' }}>
                <Space direction="vertical">

                    <Radio value="momo" >
                        <img src={MomoIcon} alt="Momo" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                        Momo
                    </Radio>
                    <Radio value="zaloPay">
                        <img src={ZaloPayIcon} alt="Momo" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                        Zalo Pay
                    </Radio>
                </Space>
            </Radio.Group>
        </Modal>
    </Header>)
}

export default Header
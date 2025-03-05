
import { Link, useNavigate } from 'react-router-dom';
import { Menu, message, theme, Layout, Avatar } from 'antd';
import { UsergroupAddOutlined, HomeOutlined, BookOutlined, SettingOutlined, LoginOutlined, AliwangwangOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/auth.context';
import { LogoutApi } from '../../../services/api.user.service';

const Header = () => {
    const { Header } = Layout;
    const [current, setCurrent] = useState('');
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
    const items = [...(!user._id ? [{
        label: <Link to={"/login"}>Login</Link>,
        key: 'login',
        icon: <LoginOutlined />,
    }] : []),

    ...(user._id ? [{
        key: 'setting',
        icon: <Avatar size={35} style={{ marginTop: '17px', position: 'cover' }}
            src={<img src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`} alt="avatar" />} />,
        children: [
            {
                label: <span onClick={() => handleLogout()}>Logout</span>,
                key: 'logout',
            },
        ],
    }] : [])
    ];
    return <Header style={{
        padding: 0,
        background: colorBgContainer,
    }} >
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items}
            style={{ justifyContent: "right", gap: "20px", padding: "0 20px" }} />
    </Header>
}

export default Header
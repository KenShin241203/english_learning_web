import { useState, useContext } from "react";
import { AuthContext } from '../../context/auth.context';
import { Layout, Menu } from "antd";
import {
    UsergroupAddOutlined, HomeOutlined,
    BookOutlined, ProductOutlined,
    ReadOutlined, HddOutlined,
    ArrowLeftOutlined, BarChartOutlined, BankOutlined,
    EyeOutlined, DollarOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const Sider = (props) => {
    const { Sider } = Layout;
    const { collapsed, setCollapsed } = props;
    const { user, setUser } = useContext(AuthContext);
    const [current, setCurrent] = useState('');
    function getItem(label, key, icon, children) {
        return {
            key,
            icon,
            children,
            label,
        };
    }
    const navigate = useNavigate()
    const onClick = (e) => {
        setCurrent(e.key);
    };



    const items = [
        {
            label: <Link to={"/"}>Home Page</Link>,
            key: 'exit',
            icon: <ArrowLeftOutlined />,
        },
        {
            label: <Link to={"/admin"}>Dashboard</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: "Menu",
            key: 'course',
            icon: <ProductOutlined />,
            children: [
                {
                    label: <Link to={"/admin/courses"}>Courses</Link>,
                    key: 'course',
                    icon: <ReadOutlined />,
                },
                {
                    label: <Link to={"/admin/chapters"}>Chapters</Link>,
                    key: 'chapter',
                    icon: <HddOutlined />,
                },
                {
                    label: <Link to={"/admin/lessons"}>Lessons</Link>,
                    key: 'lesson',
                    icon: <BookOutlined />,
                },
                {
                    label: <Link to={"/admin/exams"}>Tests</Link>,
                    key: 'exam',
                    icon: <BookOutlined />,
                },
                {
                    label: <Link to={"/admin/reviews"}>Reviews</Link>,
                    key: 'review',
                    icon: <EyeOutlined />,
                },
                {
                    label: <Link to={"/admin/orders"}>Orders</Link>,
                    key: 'order',
                    icon: <BankOutlined />,
                },
                {
                    label: <Link to={"/admin/token_packages"}>Token Packages</Link>,
                    key: 'tokenPack',
                    icon: <DollarOutlined />,
                },
            ]
        },
        {
            label: <Link to={"/admin/users"}>Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
        },
        {
            label: <Link to={"/admin/revenue-chart"}>Revenue Orders</Link>,
            key: 'revenue',
            icon: <BarChartOutlined />,
        },
    ];
    return (
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="demo-logo-vertical" />
            <Menu onClick={onClick} theme="dark" defaultSelectedKeys={[current]} mode="inline" items={items} />
        </Sider>
    )
}

export default Sider
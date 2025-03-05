import { Layout, Breadcrumb, theme } from "antd"
import { Outlet } from 'react-router-dom';
const Content = () => {
    const { Content } = Layout
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Content
            style={{
                margin: ' 50px 0',
                height: '100%',

            }}
        >

            <div
                style={{
                    padding: 24,
                    minHeight: 700,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                }}
            >
                <Outlet />
            </div>
        </Content>
    )
}

export default Content
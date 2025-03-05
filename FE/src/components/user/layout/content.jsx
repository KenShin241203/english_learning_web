import { Layout, Card } from 'antd';
import { Outlet } from 'react-router-dom';
import './css/homePage.css'
import './css/content.css'
const Content = () => {
    const { Content } = Layout
    return (
        <div className='content-container'>
            <Content className='layout-content'>
                <Outlet />

            </Content>
        </div>)
}

export default Content
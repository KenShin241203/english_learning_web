import { Layout, Spin } from 'antd';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth.context';
import { getAccount } from '../../services/api.user.service';
import Sider from './layouts/sider';
import Header from './layouts/header';
import Footer from './layouts/footer';
import Content from './layouts/content';
const AdminPage = () => {
    const [collapsed, setCollapsed] = useState(false);

    const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext)
    useEffect(() => {
        fetchUserInfo()
    }, [])

    const fetchUserInfo = async () => {
        const res = await getAccount()
        if (res.data) {
            setUser(res.data)
        }
        setIsAppLoading(false)
    }
    return (
        <>
            {isAppLoading === true ?
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Spin />
                </div>
                :
                <Layout style={{
                    minHeight: '100vh',
                }}>
                    <Sider
                        setCollapsed={setCollapsed}
                        collapsed={collapsed} />

                    <Layout>
                        <Header />
                        <Content />
                        <Footer />
                    </Layout>
                </Layout>
            }
        </>

    )
}

export default AdminPage
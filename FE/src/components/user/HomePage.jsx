import { Layout, Spin } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth.context';
import { getAccount } from '../../services/api.user.service';
import Header from './layout/header';
import Content from './layout/content';
import Footer from './layout/footer';
import './layout/css/homePage.css';

const HomePage = () => {
    const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);
    const [token, setToken] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
        fetchUserInfo();
    }, [token]);

    const fetchUserInfo = async () => {
        const res = await getAccount();
        if (res.data) {
            setUser(res.data);
        }
        setIsAppLoading(false);
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const newToken = localStorage.getItem('access_token');
            if (newToken !== token) {
                setToken(newToken);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [token]);

    return (
        <>
            {isAppLoading ? (
                <div className='spinner-container'>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Layout>
                        <Content />
                        {/* <Footer /> */}
                    </Layout>
                </>
            )}
        </>
    );
};

export default HomePage;
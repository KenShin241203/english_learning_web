import { Layout } from 'antd'

const Footer = () => {
    const { Footer } = Layout
    return (
        <Footer
            style={{
                textAlign: 'center',
                minHeight: '10px'
            }}
        >
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
    )
}

export default Footer
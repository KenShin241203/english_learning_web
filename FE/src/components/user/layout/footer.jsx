
import './css/footer.css'

import { Layout } from "antd"
const Footer = () => {
    const { Footer } = Layout
    return (
        <Footer className='footer'>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
    )
}

export default Footer
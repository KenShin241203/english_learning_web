import { useContext } from "react";
import { AuthContext } from "../../components/context/auth.context";
import { Link } from "react-router-dom";
import { Button, Result } from "antd";
import Footer from "../../components/user/layout/footer";


const PrivateUserRoute = (props) => {
    const { user } = useContext(AuthContext);

    if (user && user._id) {
        return (
            <>
                {props.children}
            </>)
    } else {
        return (
            <>
                <Result style={{ marginTop: '80px' }}
                    status="403"
                    title="Unauthorize!"
                    subTitle={"Need to log in to access."}
                    extra={<Button type="primary">
                        <Link to="/login">
                            <span>Go to Login</span>
                        </Link>
                    </Button>}
                />
                <Footer />
            </>
        )

    }
}

export default PrivateUserRoute
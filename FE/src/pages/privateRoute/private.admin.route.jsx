import { useContext } from "react";
import { AuthContext } from "../../components/context/auth.context";
import { Link, Navigate } from "react-router-dom";
import { Button, Result } from "antd";

const PrivateAdminRoute = (props) => {
    const { user } = useContext(AuthContext);

    if (user && user._id && user.role === "admin") {
        return (
            <>
                {props.children}
            </>)
    }
    return (
        <Result
            status="403"
            title="Unauthorize!"
            subTitle={"Access is denied."}
            extra={<Button type="primary">
                <Link to="/">
                    <span>Go to homepage</span>
                </Link>
            </Button>}
        />
    )

}

export default PrivateAdminRoute;

import { useEffect, useState } from "react"
import { fecthAllUserApi } from "../../services/api.user.service";
import UserTable from "../../components/admin/users/user.table";
import UserForm from "../../components/admin/users/user.form";


const UserPage = () => {

    const [dataUser, setDataUser] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadUser();
    }, [current, pageSize]);

    const loadUser = async () => {
        const res = await fecthAllUserApi(current, pageSize);
        if (res.data) {
            setDataUser(res.data.result)
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)
        }

    }

    return (
        <div style={{ padding: "20px" }}>
            <UserForm
                loadUser={loadUser} />
            <UserTable
                dataUser={dataUser}
                loadUser={loadUser}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default UserPage
import { useState, useEffect } from "react";
import { fetchAllTokenPackageApi } from "../../services/api.tokenPackage.service";
import TokenPackTable from "../../components/admin/tokenPack/tokenPack.table";
import TokenPackageForm from "../../components/admin/tokenPack/tokenPack.form";
const TokenPackagePage = () => {

    const [dataTokenPack, setDataTokenPack] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadTokenPack();
    }, [current, pageSize]);

    const loadTokenPack = async () => {
        const res = await fetchAllTokenPackageApi(current, pageSize)
        if (res.data) {
            setDataTokenPack(res.data.result)
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <TokenPackageForm loadTokenPack={loadTokenPack} />
            <TokenPackTable
                dataTokenPack={dataTokenPack}
                loadTokenPack={loadTokenPack}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default TokenPackagePage

import TestTable from '../../components/admin/exam/test.table';
import { fetchAllTestApi } from '../../services/api.test.service';
import { useEffect, useState } from 'react';
const ExamPage = () => {

    const [dataTest, setDataTest] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadTest();
    }, [current, pageSize]);

    const loadTest = async () => {
        const res = await fetchAllTestApi(current, pageSize)
        if (res.data) {
            setDataTest(res.data.result)
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <TestTable
                dataTest={dataTest}
                loadTest={loadTest}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default ExamPage
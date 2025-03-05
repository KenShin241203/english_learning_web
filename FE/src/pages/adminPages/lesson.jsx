import LessonForm from "../../components/admin/lesson/lesson.form"
import LessonTable from "../../components/admin/lesson/lesson.table"
import { fetchAllLessonApi } from '../../services/api.lesson.service';
import { useEffect, useState } from 'react';
const LessonPage = () => {

    const [dataLesson, setDataLesson] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadLesson();
    }, [current, pageSize]);

    const loadLesson = async () => {
        const res = await fetchAllLessonApi(current, pageSize)
        if (res.data) {
            setDataLesson(res.data.result)
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <LessonForm loadLesson={loadLesson} />
            <LessonTable
                dataLesson={dataLesson}
                loadLesson={loadLesson}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default LessonPage
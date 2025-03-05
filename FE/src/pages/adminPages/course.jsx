import { useState, useEffect } from "react";
import { fetchAllCourseApi } from "../../services/api.course.service";
import CourseTable from '../../components/admin/courses/course.table'
import CourseForm from "../../components/admin/courses/course.form";
const CoursePage = () => {

    const [dataCourse, setDataCourse] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadCourse();
    }, [current, pageSize]);

    const loadCourse = async () => {
        const res = await fetchAllCourseApi(current, pageSize)
        if (res.data) {
            setDataCourse(res.data.result)
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <CourseForm loadCourse={loadCourse} />
            <CourseTable
                dataCourse={dataCourse}
                loadCourse={loadCourse}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default CoursePage
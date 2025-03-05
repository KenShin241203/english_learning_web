import { useState, useEffect } from "react";
import { fetchAllChaptersWithCourseApi } from "../../services/api.chapter.service";
import { notification } from "antd";
import ChapterTable from "../../components/admin/chapters/chapter.table";
const ChapterPage = () => {

    const [dataChapter, setDataChapter] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadChapter();
    }, [current, pageSize]);

    const loadChapter = async () => {
        const res = await fetchAllChaptersWithCourseApi(current, pageSize);
        if (res.data) {
            setDataChapter(res.data.result);
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)

        } else {
            notification.error({
                message: "Error Loading Chapters",
                description: res.message,
            });
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <ChapterTable
                dataChapter={dataChapter}
                loadChapter={loadChapter}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />
        </div>
    )
}

export default ChapterPage
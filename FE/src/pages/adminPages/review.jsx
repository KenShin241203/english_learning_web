
import { useEffect, useState } from 'react';
import { fetchAllReviewApi } from '../../services/api.review.service';
import ReviewTable from '../../components/admin/review/review.table';
const ReviewPage = () => {

    const [dataReview, setDataReview] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadReview();
    }, [current, pageSize]);

    const loadReview = async () => {
        const res = await fetchAllReviewApi(current, pageSize)
        if (res.data) {
            setDataReview(res.data.result)
            setCurrent(res.data.meta.currentPage)
            setPageSize(res.data.meta.pageSize)
            setTotal(res.data.meta.totalEntity)
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <ReviewTable
                dataReview={dataReview}
                loadReview={loadReview}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default ReviewPage
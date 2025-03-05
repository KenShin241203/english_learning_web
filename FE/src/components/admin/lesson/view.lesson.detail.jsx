import { Drawer } from "antd";

const DetailLesson = (props) => {
    const { isDataDetailOpen, setIsDataDetailOpen, dataDetail, setDetailData } = props;


    return (
        <Drawer title="Detail Lesson"
            open={isDataDetailOpen}
            onClose={() => {
                setDetailData(null)
                setIsDataDetailOpen(false)
            }}>
            {dataDetail ? <>
                <p>Id: {dataDetail._id}</p>
                <br />
                <p>Lesson name: {dataDetail.name}</p>
                <br />
                <p>Total question: {dataDetail.total_Question}</p>
                <br />
                <p>Chapter id: {dataDetail.chapterId}</p>
            </>
                :
                <>
                    <p>Không có dữ liệu</p>
                </>
            }

        </Drawer>

    )
}
export default DetailLesson
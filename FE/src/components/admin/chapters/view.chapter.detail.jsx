import { Drawer } from "antd";

const DetailChapter = (props) => {
    const { isDataDetailOpen, setIsDataDetailOpen, dataDetail, setDetailData } = props;
    return (
        <Drawer title="Detail Course"
            open={isDataDetailOpen}
            onClose={() => {
                setDetailData(null)
                setIsDataDetailOpen(false)
            }}>
            {dataDetail ? <>
                <p>Id: {dataDetail._id}</p>
                <br />
                <p>Chapter name: {dataDetail.name}</p>
                <br />
                <p>Belong to the course: {dataDetail.courseName}</p>


            </>
                :
                <>
                    <p>Không có dữ liệu</p>
                </>
            }

        </Drawer>

    )
}

export default DetailChapter
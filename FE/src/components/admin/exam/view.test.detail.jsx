import { Drawer } from "antd";

const DetailTest = (props) => {
    const { isDataDetailOpen, setIsDataDetailOpen, dataDetail, setDetailData } = props;


    return (
        <Drawer title="Detail Test"
            open={isDataDetailOpen}
            onClose={() => {
                setDetailData(null)
                setIsDataDetailOpen(false)
            }}>
            {dataDetail ? <>
                <p>Id: {dataDetail._id}</p>
                <br />
                <p>Test name: {dataDetail.name}</p>
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
export default DetailTest
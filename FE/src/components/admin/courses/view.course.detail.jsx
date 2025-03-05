import { Drawer, Button, notification, Image } from "antd";
import { useState } from "react";
import { handleUploadFile } from "../../../services/api.user.service";
import { uploadAvatarCourse } from "../../../services/api.course.service";

const DetailCourse = (props) => {
    const { isDataDetailOpen, setIsDataDetailOpen, dataDetail, setDetailData, loadCourse } = props;
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    }

    const handleOnChangeFile = (event) => {
        if (!event.target.files || event.target.files.lenght === 0) {
            setSelectedFile(null)
            setPreview(null)
            return
        }
        const file = event.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleUpdateCourseAvatar = async () => {
        const resUpload = await handleUploadFile(selectedFile, "avatar");
        if (resUpload.data) {
            //success
            const newAvatar = resUpload.data.path;
            //step 2: update user
            const resUpdateAvatar = await uploadAvatarCourse(
                dataDetail._id, newAvatar
            );

            if (resUpdateAvatar.data) {
                setIsDataDetailOpen(false);
                setSelectedFile(null);
                setPreview(null)
                await loadCourse();

                notification.success({
                    message: "Update course avatar",
                    description: "Cập nhật avatar thành công"
                })

            } else {
                notification.error({
                    message: "Error update avatar",
                    description: JSON.stringify(resUpdateAvatar.message)
                })
            }
        } else {
            //failed
            notification.error({
                message: "Error upload file",
                description: JSON.stringify(resUpload.message)
            })
        }

    }
    return (
        <Drawer title="Detail Course"
            open={isDataDetailOpen}
            onClose={() => {
                setDetailData(null)
                setIsDataDetailOpen(false)
                setSelectedFile(null)
                setPreview(null)
            }}>
            {dataDetail ? <>
                <p>Id: {dataDetail._id}</p>
                <br />
                <p>Course name: {dataDetail.name}</p>
                <br />
                <p>Total Time: {dataDetail.totalTime}</p>
                <br />
                <p>Total Time: {formatCurrency(dataDetail.price)}</p>
                <br />
                <p>Total chapter: {dataDetail.totalChapter}</p>
                <br />
                <div>
                    <Image width={150}
                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail.avatar}`} />
                </div>
                <div>
                    <label htmlFor='btnUpload' style={{
                        display: "block",
                        width: "fit-content",
                        marginTop: "15px",
                        padding: "5px 10px",
                        background: "orange",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}>
                        Upload Avatar
                    </label>
                    <input type='file' hidden id='btnUpload'
                        onChange={(event) => handleOnChangeFile(event)} />
                </div>
                <div >
                    <Image width={150}
                        src={preview} />
                </div>
                <Button type='primary'
                    onClick={() => handleUpdateCourseAvatar()}
                >Save</Button>

            </>
                :
                <>
                    <p>Không có dữ liệu</p>
                </>
            }

        </Drawer>

    )
}

export default DetailCourse
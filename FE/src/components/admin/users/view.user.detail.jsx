import { Drawer, Button, notification, Image } from "antd";
import { useState } from "react";
import { uploadAvatarUserApi, handleUploadFile } from "../../../services/api.user.service";
const DetailUser = (props) => {
    const { isDataDetailOpen, setIsDataDetailOpen, dataDetail, setDetailData, loadUser } = props;
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)

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

    const handleUpdateUserAvatar = async () => {
        const resUpload = await handleUploadFile(selectedFile, "avatar");
        if (resUpload.data) {
            //success
            const newAvatar = resUpload.data.path;
            //step 2: update user
            const resUpdateAvatar = await uploadAvatarUserApi(
                newAvatar, dataDetail._id, dataDetail.name, dataDetail.phone
            );

            if (resUpdateAvatar.data) {
                setIsDataDetailOpen(false);
                setSelectedFile(null);
                setPreview(null)
                await loadUser();

                notification.success({
                    message: "Update user avatar",
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
        <Drawer width={"40vw"}
            title="Detail User"
            open={isDataDetailOpen}
            onClose={() => {
                setDetailData(null)
                setIsDataDetailOpen(false)
                setSelectedFile(null)
                setPreview(null)
            }}>
            {dataDetail ? <>
                <p>UserId: {dataDetail._id}</p>
                <br />
                <p>Username: {dataDetail.name}</p>
                <br />
                <p>Email: {dataDetail.email}</p>
                <br />
                <p>Phone: {dataDetail.phone}</p>
                <br />
                <p>Avatar:</p>
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
                    onClick={() => handleUpdateUserAvatar()}
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
export default DetailUser

import { useState } from "react";
import { useEffect } from "react";
import { notification, Modal, Input, Select } from "antd";
import { updateUserApi } from "../../../services/api.user.service";
const { Option } = Select
const UpdateUserModal = (props) => {

    const [userId, setUserId] = useState("")
    const [username, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [role, setRole] = useState("")
    const { isModalUpdateOpen, setIsModalUpdateOpen, dataUpdate, setDataUpdate, loadUser } = props;

    useEffect(() => {
        if (dataUpdate) {
            setUserId(dataUpdate._id)
            setUserName(dataUpdate.name)
            setEmail(dataUpdate.email)
            setPhone(dataUpdate.phone)
            setRole(dataUpdate.role)
        }
    }, [dataUpdate])

    const handleSubmitBtn = async () => {
        const res = await updateUserApi(userId, username, email, phone, role)
        if (res.data) {
            notification.success({
                message: "Update User",
                description: "Update user sucessfully"
            })
            resetAndCloseModal()
            await loadUser()
        }
        else {
            notification.error({
                message: "Error update user",
                description: JSON.stringify(res.message)
            })
        }
    }
    const resetAndCloseModal = () => {
        setIsModalUpdateOpen(false)
        setUserId("")
        setUserName("")
        setEmail("")
        setPhone("")
        setRole("")
        setDataUpdate(null)
    }
    return (
        <Modal title="Update User"
            open={isModalUpdateOpen}
            onOk={() => handleSubmitBtn()}
            onCancel={() => { resetAndCloseModal() }}
            maskClosable={false}
            okText={"SAVE"}>
            <div className="user-form">
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>User Id</span>
                        <Input value={userId}
                            disabled />
                    </div>
                    <div>
                        <span>Username</span>
                        <Input value={username}
                            onChange={(event) => setUserName(event.target.value)} />
                    </div>
                    <div>
                        <span>Email</span>
                        <Input value={email}
                            onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div>
                        <span>Phone</span>
                        <Input value={phone}
                            onChange={(event) => setPhone(event.target.value)} />
                    </div>
                    <div>
                        <span style={{ paddingRight: '5px' }}>Role: </span>
                        <Select
                            value={role}
                            onChange={(value) => setRole(value)}
                        >
                            <Option value="user">User</Option>
                            <Option value="admin">Admin</Option>
                        </Select>
                    </div>
                </div>
            </div>
        </Modal>

    )
}


export default UpdateUserModal
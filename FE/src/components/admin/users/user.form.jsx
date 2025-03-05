import { useState } from "react"
import { createNewUserApi } from "../../../services/api.user.service"
import { Button, Modal, Input, notification } from "antd"

const UserForm = (props) => {
    const [username, setUserName] = useState([])
    const [email, setEmail] = useState([])
    const [password, setPassword] = useState([])
    const [repeat_password, setRepeatPassword] = useState([])
    const [phone, setPhone] = useState([])

    const { loadUser } = props

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleSubmitBtn = async () => {
        const res = await createNewUserApi(username, email, password, repeat_password, phone)
        if (res.data) {
            notification.success({
                message: "Create User",
                description: "New user just created"
            })

            resetAndCloseModal()
            await loadUser();
        }
        else {
            notification.error({
                message: "Error Create User",
                description: JSON.stringify(res.message)
            })
        }
    }
    const resetAndCloseModal = () => {
        setIsModalOpen(false)
        setUserName("")
        setEmail("")
        setPassword("")
        setRepeatPassword("")
        setPhone("")
    }
    return (
        <div className="user-form" style={{ margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Table User</h3>
                <Button type="primary" onClick={() => setIsModalOpen(true)}> Create User </Button>
            </div>
            <Modal title="Create User"
                open={isModalOpen}
                onOk={() => handleSubmitBtn()}
                onCancel={() => { resetAndCloseModal() }}
                maskClosable={false}
                okText={"CREATE"}>
                <div className="user-form">
                    <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                        <div>
                            <span>User name</span>
                            <Input value={username}
                                onChange={(event) => setUserName(event.target.value)} />
                        </div>
                        <div>
                            <span>Email</span>
                            <Input value={email}
                                onChange={(event) => setEmail(event.target.value)} />
                        </div>
                        <div>
                            <span>Password</span>
                            <Input.Password value={password}
                                onChange={(event) => setPassword(event.target.value)} />
                        </div>
                        <div>
                            <span>Repeat Password</span>
                            <Input.Password value={repeat_password}
                                onChange={(event) => setRepeatPassword(event.target.value)} />
                        </div>
                        <div>
                            <span>Phone</span>
                            <Input value={phone}
                                onChange={(event) => setPhone(event.target.value)} />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>

    )

}

export default UserForm
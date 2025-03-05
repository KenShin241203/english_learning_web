import { useState } from "react"
import { postTokenPackageApi } from "../../../services/api.tokenPackage.service";
import { Button, Input, notification, Modal } from "antd";

const TokenPackageForm = (props) => {
    const [name, setName] = useState("")
    const [token, setToken] = useState("")
    const [price, setPrice] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { loadTokenPack } = props
    const handleSubmitBtn = async () => {
        const data = { name, price, token }
        const res = await postTokenPackageApi(data)
        if (res.data) {
            notification.success({
                message: "Create Token Package",
                description: "Create Token Package sucessfully"
            })
            resetAndCloseModal()
            await loadTokenPack();
        }
        else {
            notification.error({
                message: "Error Create Token Package",
                description: JSON.stringify(res.message)
            })
        }
    }
    const resetAndCloseModal = () => {
        setIsModalOpen(false)
        setName("")
        setToken("")
        setPrice("")
    }

    return (
        <div className="token-package-form" style={{ margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "end" }}>

                <Button type="primary" onClick={() => setIsModalOpen(true)}> Create Token Package </Button>
            </div>
            <Modal title="Create Token Package"
                open={isModalOpen}
                onOk={() => handleSubmitBtn()}
                onCancel={() => { resetAndCloseModal() }}
                maskClosable={false}
                okText={"CREATE"}>
                <div className="token-package-form">
                    <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                        <div>
                            <span>Token Package Name</span>
                            <Input value={name}
                                onChange={(event) => setName(event.target.value)} />
                        </div>
                        <div>
                            <span>Price</span>
                            <Input value={price}
                                onChange={(event) => setPrice(event.target.value)} />
                        </div>
                        <div>
                            <span>Number of tokens</span>
                            <Input value={token}
                                onChange={(event) => setToken(event.target.value)} />
                        </div>
                    </div>
                </div>

            </Modal>
        </div>

    )
}
export default TokenPackageForm
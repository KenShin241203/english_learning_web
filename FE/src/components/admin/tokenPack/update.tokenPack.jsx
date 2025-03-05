import { useRef, useEffect, useState } from "react";
import { updateTokenPackageApi, fetchTokenPackageByIdApi } from "../../../services/api.tokenPackage.service";
import { Button, Input, notification, Modal, Form, Space, Popconfirm } from "antd";
const UpdateTokenPackModal = (props) => {
    const { isModalUpdateOpen, setIsModalUpdateOpen, dataUpdate, setDataUpdate, loadTokenPack } = props
    const formRef = useRef(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate && formRef.current) {
            loadTokenPackage(dataUpdate._id)
        }
    }, [dataUpdate]);
    //function xử lý load data token package vào các field update
    const loadTokenPackage = async (tokenPackId) => {
        console.log(tokenPackId)
        const res = await fetchTokenPackageByIdApi(tokenPackId);
        if (res.success) {
            form.setFieldsValue({
                id: res.data._id,
                ...res.data
            });
        } else {
            notification.error({
                message: "Error loading token package",
                description: res.message,
            });
        }
    };

    const handleSubmitBtn = async () => {
        const formValues = formRef.current.getFieldsValue();
        const { id, name, token, price } = formValues;
        const res = await updateTokenPackageApi(id, name, token, price);
        if (res.data) {
            notification.success({
                message: "Update Token Package",
                description: "Token Package updated successfully"
            });
            resetAndCloseModal();
            await loadTokenPack();
        } else {
            notification.error({
                message: "Error Updating Token Package",
                description: JSON.stringify(res.message)
            });
        }
    }

    const resetAndCloseModal = () => {
        setIsModalUpdateOpen(false)
        setDataUpdate(null)
        if (formRef.current) {
            formRef.current.resetFields();
        }
    }

    return (
        <Modal
            title="Update Token Package"
            open={isModalUpdateOpen}
            onOk={handleSubmitBtn}
            onCancel={resetAndCloseModal}
            maskClosable={false}
            okText="Save Course Info"
            footer={[
                <Button key="cancel" onClick={resetAndCloseModal}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmitBtn}>
                    Save
                </Button>,
            ]}
        >
            <Form
                ref={formRef}
                form={form}
                name="update_tokenpPack_form"
                initialValues={{ chapters: [] }}
                style={{ maxWidth: 600 }}
                autoComplete="on"
            >
                {/* Course Information */}
                <Form.Item label="Token Pack Id" name="id">
                    <Input disabled />
                </Form.Item>
                <Form.Item label="Token Package Name" name="name" rules={[{ required: true, message: "Please enter token package name" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Total tokens" name="token" rules={[{ required: true, message: "Please enter number of tokens" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter price" }]}>
                    <Input />
                </Form.Item>


            </Form>
        </Modal>
    );
}

export default UpdateTokenPackModal;
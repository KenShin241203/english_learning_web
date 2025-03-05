import { useRef, useEffect, useState } from "react";
import { getCourseWithChapters, updateCourseApi } from "../../../services/api.course.service";
import { createManyChapterApi, deleteChapterByIdApi, updateManyChapterApi } from "../../../services/api.chapter.service";
import { Button, Input, notification, Modal, Form, Space, Popconfirm } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const UpdateCourseModal = (props) => {
    const { isModalUpdateOpen, setIsModalUpdateOpen, dataUpdate, setDataUpdate, loadCourse } = props;
    const formRef = useRef(null);
    const [form] = Form.useForm();
    const [chapters, setChapters] = useState([]);

    useEffect(() => {
        if (dataUpdate && formRef.current) {
            loadCourseWithChapters(dataUpdate._id)
        }
    }, [dataUpdate]);
    //function xử lý load data course vào các field update
    const loadCourseWithChapters = async (courseId) => {
        const res = await getCourseWithChapters(courseId);
        if (res.success) {
            form.setFieldsValue({
                courseId: res.data._id,
                courseName: res.data.name,
                totalTime: res.data.totalTime,
                price: res.data.price,
                chapters: res.data.chapterInfo.map((chapter) => ({
                    name: chapter.name,
                    courseId: chapter.courseId,
                    id: chapter._id
                })),
            });
        } else {
            notification.error({
                message: "Error Loading Chapters",
                description: res.message,
            });
        }
    };
    //function xử lý 2 sự kiện update course và chapter
    const handleSubmitBtn = async () => {
        const formValues = formRef.current.getFieldsValue();
        const { courseId, courseName, totalTime, price, chapters } = formValues;
        const updatedChapters = chapters.map((chapter) => ({
            id: chapter.chapterId, // Thêm ID vào payload
            name: chapter.name,
            courseId: formValues.courseId,
        }));
        const res = await updateCourseApi(courseId, courseName, totalTime, price);
        const res2 = await updateManyChapterApi(updatedChapters)
        if (res.data || res2.data) {
            notification.success({
                message: "Update Course",
                description: "Course updated successfully"
            });
            resetAndCloseModal();
            await loadCourse();
        } else {
            notification.error({
                message: "Error Updating Course",
                description: JSON.stringify(res.message)
            });
        }
    };
    //function xử lý add chapter
    const handleAddChapters = async () => {
        const formValues = formRef.current.getFieldsValue();
        const { chapters } = formValues;

        if (chapters.length === 0) {
            notification.error({
                message: "Error Adding Chapters",
                description: "Please add at least one chapter."
            });
            return;
        }

        const formattedChapters = chapters.map((chapter) => ({
            name: chapter.name,
            courseId: formValues.courseId
        }));

        const res = await createManyChapterApi(formattedChapters);
        if (res.data != "") {
            notification.success({
                message: "Add Chapters",
                description: "Chapters added successfully"
            });
            resetAndCloseModal();
            await loadCourse();
        } else {
            notification.error({
                message: "Error Adding Chapters",
                description: JSON.stringify(res.message)
            });
        }
    };
    //function xử lý xoá chapter
    const handleDeleteChapter = async (chapterId, removeField) => {
        const res = await deleteChapterByIdApi(chapterId);
        if (res.data) {
            notification.success({
                message: "Delete Chapter",
                description: "Chapter deleted successfully",
            });
            removeField(); // Xóa chapter khỏi giao diện
            await loadCourse();
        } else {
            notification.error({
                message: "Error Deleting Chapter",
                description: res.message,
            });
        }
    };
    //Reset lại form và đóng modal
    const resetAndCloseModal = () => {
        setIsModalUpdateOpen(false);
        setDataUpdate(null);
        setChapters([]);
        if (formRef.current) {
            formRef.current.resetFields();
        }
    };

    return (
        <Modal
            title="Update Course"
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
                    Save Course Info
                </Button>,
                <Button key="addChapters" type="dashed" onClick={handleAddChapters}>
                    Add Chapters
                </Button>,
            ]}
        >
            <Form
                ref={formRef}
                form={form}
                name="update_course_form"
                initialValues={{ chapters: [] }}
                style={{ maxWidth: 600 }}
                autoComplete="on"
            >
                {/* Course Information */}
                <Form.Item label="Course Id" name="courseId">
                    <Input disabled />
                </Form.Item>
                <Form.Item label="Course Name" name="courseName" rules={[{ required: true, message: "Please enter course name" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Total Time" name="totalTime" rules={[{ required: true, message: "Please enter total time" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Price" name="price" rules={[{ required: true, message: "Please enter price" }]}>
                    <Input />
                </Form.Item>

                {/* Dynamic Fields for Chapters */}
                <Form.List name="chapters">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Space key={field.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...field}
                                        name={[field.name, "name"]}
                                        rules={[{ required: true, message: "Missing chapter name" }]}
                                    >
                                        <Input placeholder="Chapter Name" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, "courseId"]}
                                        initialValue={dataUpdate?._id}
                                        hidden // Không hiển thị nhưng cần thiết cho backend
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Popconfirm
                                        title="Are you sure to delete this chapter?"
                                        onConfirm={() => handleDeleteChapter(form.getFieldValue(['chapters', field.name, 'id']), () => remove(field.name))}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <MinusCircleOutlined style={{ color: "red" }} />
                                    </Popconfirm>
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Chapter
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default UpdateCourseModal;

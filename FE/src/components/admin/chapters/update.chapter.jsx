import { Drawer, Button, Col, Form, Input, Row, Space, notification, Popconfirm, InputNumber } from "antd"
import { useRef, useEffect } from "react";
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { fetchChapterWithLessAndTest, updateChapterApi } from "../../../services/api.chapter.service";
import { createManyLessonApi, deleteLessonApi, updateManyLessonApi } from "../../../services/api.lesson.service";
import { createManyTestApi, deleteTestApi, updateManyTestApi } from "../../../services/api.test.service";
const UpdateChapterModal = (props) => {
    const { isDrawerUpdateOpen, setIsDrawerUpdateOpen, dataUpdate, setDataUpdate, loadChapter } = props;
    const formRef = useRef(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate && formRef.current) {
            loadChapterWithLessonAndTest(dataUpdate._id)
        }
    }, [dataUpdate]);
    //function load data của chapter vào các fields
    const loadChapterWithLessonAndTest = async (chapterId) => {
        const res = await fetchChapterWithLessAndTest(chapterId);
        console.log(res.data)
        if (res.success) {
            form.setFieldsValue({
                chapterId: chapterId,
                chapterName: res.data.name,
                numOrder: res.data.numOrder,
                courseId: res.data.courseId._id,
                courseName: res.data.courseId.name,
                lessons: res.data.lessonInfo.map((lesson) => ({
                    name: lesson.name,
                    chapterId: lesson.chapterId,
                    id: lesson._id
                })),
                testArr: res.data.testInfo.map((test) => ({
                    name: test.name,
                    chapterId: test.chapterId,
                    id: test._id
                })),
            });
        } else {
            notification.error({
                message: "Error Loading Chapters",
                description: res.message,
            });
        }
    };
    //function add lesson và test vào chapter
    const handleAddLessonAndTest = async () => {
        const formValues = formRef.current.getFieldsValue();
        const { lessons, testArr } = formValues

        const formattedLessons = lessons.map((lesson) => ({
            name: lesson.name,
            chapterId: formValues.chapterId
        }));
        const formattedTest = testArr.map((ts) => ({
            name: ts.name,
            chapterId: formValues.chapterId
        }));
        const res2 = await createManyTestApi(formattedTest)
        const res = await createManyLessonApi(formattedLessons);
        if (res.data != "" || res2 != "") {
            notification.success({
                message: "Add successfully",
                description: "Add successfully"
            });
            await loadChapter();
        } else {
            notification.error({
                message: "Error Adding",
                description: JSON.stringify(res.message)
            });
        }
    }
    //function update data cho chapter, lesson va test
    const handleSubmitBtn = async () => {
        const formValues = formRef.current.getFieldsValue()
        const { chapterId, chapterName, numOrder, courseId, lessons, testArr } = formValues
        const updatedLessons = lessons.map((lesson) => ({
            id: lesson.id, // Thêm ID vào payload
            name: lesson.name,
            chapterId: formValues.chapterId,
        }));
        const updatedTestArr = testArr.map((test) => ({
            id: test.id, // Thêm ID vào payload
            name: test.name,
            chapterId: formValues.chapterId,
        }));
        const res = await updateChapterApi(chapterId, chapterName, numOrder, courseId)
        console.log(res)
        const res2 = await updateManyLessonApi(updatedLessons)
        const res3 = await updateManyTestApi(updatedTestArr)
        if (res.data || res2.data || res3.data) {
            notification.success({
                message: "Update Chapter",
                description: "Chapter updated successfully"
            });
            resetAndCloseModal();
            await loadChapter();
        } else {
            notification.error({
                message: "Error Updating Chapter",
                description: JSON.stringify(res.message)
            });
        }

    }

    const handleDeleteLesson = async (lessonId, removeField) => {
        const res = await deleteLessonApi(lessonId);
        if (res.data) {
            notification.success({
                message: "Delete Lesson",
                description: "Lesson deleted successfully",
            });
            removeField(); // Xóa field lesson khỏi giao diện
            await loadChapter();
        } else {
            notification.error({
                message: "Error Deleting Lesson",
                description: res.message,
            });
        }
    }

    const handleDeleteTest = async (testId, removeField) => {
        const res = await deleteTestApi(testId);
        if (res.data) {
            notification.success({
                message: "Delete Test",
                description: "Test deleted successfully",
            });
            removeField(); // Xóa field lesson khỏi giao diện
            await loadChapter();
        } else {
            notification.error({
                message: "Error Deleting Test",
                description: res.message,
            });
        }
    }
    //Reset lại form và đóng modal
    const resetAndCloseModal = () => {
        setIsDrawerUpdateOpen(false);
        setDataUpdate(null);
        // setChapters([]);
        if (formRef.current) {
            formRef.current.resetFields();
        }
    };
    return (
        <Drawer
            title="Update chapter"
            width={720}
            open={isDrawerUpdateOpen}
            onClose={() => {
                setDataUpdate(null)
                setIsDrawerUpdateOpen(false)
            }}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                <Space>
                    <Button onClick={() => {
                        setIsDrawerUpdateOpen(false)
                    }}>Cancel</Button>
                    <Button onClick={handleSubmitBtn} type="primary">
                        Submit
                    </Button>
                    <Button key="addLessAndTest" type="dashed" onClick={handleAddLessonAndTest}>
                        Add Lesson & Test
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" ref={formRef}
                form={form}
                name="update_chapter_form"
                requiredMark>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="chapterId"
                            label="Chapter Id"

                            hidden
                        >
                        </Form.Item>
                        <Form.Item
                            name="chapterName"
                            label="Chapter Name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Chapter name can be empty',
                                },
                            ]}

                        >
                            <Input placeholder="Please enter chapter name" />
                        </Form.Item>

                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="courseId"
                            label="Course Id"

                            hidden
                        >
                        </Form.Item>
                        <Form.Item
                            name="courseName"
                            label="Course Name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Course name can be empty',
                                },
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="numOrder"
                            label="Numberic Order"
                            rules={[
                                {
                                    required: true,
                                    message: 'Numberic order can be empty',
                                },
                            ]}

                        >
                            <InputNumber placeholder="Please enter numberic order" />
                        </Form.Item>
                    </Col>

                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.List name="lessons" style={{ with: '50%' }}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Space key={field.key} style={{
                                            display: 'flex',
                                            marginBottom: 8,
                                        }}
                                            align="baseline">
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'name']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Missing lesson name',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Lesson Name" />
                                            </Form.Item>
                                            <Popconfirm
                                                title="Are you sure to delete this lesson?"
                                                onConfirm={() => handleDeleteLesson(form.getFieldValue(['lessons', field.name, 'id']), () => remove(field.name))}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <MinusCircleOutlined style={{ color: "red" }} />
                                            </Popconfirm>
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{ with: '100px' }}
                                            icon={<PlusOutlined />}
                                        >
                                            Add Lesson
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Col>
                    <Col span={12}>
                        <Form.List name="testArr" style={{ with: '50%', display: 'flex' }}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Space
                                            key={field.key}
                                            style={{
                                                display: 'flex',
                                                marginBottom: 8,
                                            }}
                                            align="baseline"
                                        >
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'name']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Missing test name',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Test Name" />
                                            </Form.Item>
                                            <Popconfirm
                                                title="Are you sure to delete this test?"
                                                onConfirm={() => handleDeleteTest(form.getFieldValue(['testArr', field.name, 'id']), () => remove(field.name))}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <MinusCircleOutlined style={{ color: "red" }} />
                                            </Popconfirm>
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{ with: '100px' }}
                                            icon={<PlusOutlined />}
                                        >
                                            Add Test
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )

}

export default UpdateChapterModal
import {
    Button, Input, notification, Modal,
    Form, Card, Typography, Space, Drawer, Col, Row,
    message, Popconfirm, Select
} from "antd";
import { CloseOutlined } from '@ant-design/icons';
import { useEffect, useRef } from "react";
import { deleteQuestionApi, fetchQuestionWithAnswer, createManyQuestionForTest, updateManyQuestionOnTest } from "../../../services/api.question.service"
import { createManyAnswerApi, deleteAnswerApi, updateManyAnswerApi } from "../../../services/api.answer.service"
import { fetchTestWithQuestion, updateTestApi } from "../../../services/api.test.service";
const UpdateTestModal = (props) => {

    const [form] = Form.useForm();
    const formRef = useRef(null)
    const { isDrawerUpdateOpen, setIsDrawerUpdateOpen, dataUpdate, setDataUpdate, loadTest } = props;

    useEffect(() => {
        if (dataUpdate && formRef) {
            loadTestWithQuestion(dataUpdate._id)

        }
    }, [dataUpdate])

    //load data test cần update
    const loadTestWithQuestion = async (testId) => {
        const res = await fetchTestWithQuestion(testId);
        if (res.success) {
            const questionData = await Promise.all(
                res.data.questionInfo.map(async (qs) => {
                    const answerRes = await fetchQuestionWithAnswer(qs._id);
                    const answerArr = answerRes.success
                        ? answerRes.data.answerInfo.map((as) => ({
                            id: as._id,
                            name: as.name,
                            description: as.description,
                            correct: as.correct
                        }))
                        : [];
                    return {
                        name: qs.name,
                        description: qs.description,
                        testId: qs.testId,
                        id: qs._id,
                        answerArr
                    };
                })
            );
            form.setFieldsValue({
                testId: testId,
                testName: res.data.name,
                chapterId: res.data.chapterId._id,
                chapterName: res.data.chapterId.name,
                questionArr: questionData
            });
        } else {
            notification.error({
                message: "Error Loading Test",
                description: res.message,
            });
        }

    };

    //function xử lý add question
    const handleAddQuestion = async () => {
        const formValues = formRef.current.getFieldsValue()
        const { questionArr, testId } = formValues

        const formattedQuest = questionArr.map((qs) => ({
            name: qs.name,
            description: qs.description,
            testId
        }))
        const res = await createManyQuestionForTest(formattedQuest)
        if (res.data) {
            notification.success({
                message: "Add question successfully",
                description: "Add question successfully"
            })
            await loadTestWithQuestion(dataUpdate._id)
            await loadTest();
        } else {
            notification.error({
                message: "Error Adding Question",
                description: JSON.stringify(res.message)
            })
        }
    }

    //fucntion xử lý add answer cho mỗi question trong test
    const handleAddAnswer = async (questionId, answers) => {
        const formattedAnswers = answers.map((answer) => ({
            name: answer.name,
            description: answer.description,
            correct: answer.correct,
            questionId: questionId,  // Đảm bảo liên kết câu trả lời với ID câu hỏi
        }));

        // Gọi API để thêm câu trả lời
        const res = await createManyAnswerApi(formattedAnswers);
        if (res.data) {
            notification.success({
                message: "Add Answers Successfully",
                description: "Answers added successfully",
            });
            await loadTest()
        } else {
            notification.error({
                message: "Error Adding Answers",
                description: res.message,
            });
        }
    }
    const handleDeleteAnswer = async (answerId, removeAnswerField) => {
        const res = await deleteAnswerApi(answerId);
        if (res.data) {
            notification.success({
                message: "Delete Answer",
                description: "Answer deleted successfully",
            });
            removeAnswerField(); // Xóa câu trả lời khỏi giao diện
        } else {
            notification.error({
                message: "Error Deleting Answer",
                description: res.message,
            });
        }
    };
    //function xử lý xoá question 
    const handleDeleteQuestion = async (questionId, removeField) => {
        const res = await deleteQuestionApi(questionId);
        if (res.data) {
            notification.success({
                message: "Delete Question",
                description: "Quession deleted successfully",
            });
            removeField(); // Xóa field test khỏi giao diện
            await loadTest();
        } else {
            notification.error({
                message: "Error Deleting Question",
                description: res.message,
            });
        }
    }
    //function update test
    const handleUpdateTestInfo = async () => {
        const formValues = formRef.current.getFieldsValue()
        const { testId, testName, chapterId } = formValues
        const res = await updateTestApi(testId, testName, chapterId)
        if (res.data) {
            notification.success({
                message: "Update Test",
                description: "Test updated successfully"
            });
            await loadTest();
        }
    }
    //function update question
    const handleUpdateQuestion = async () => {
        const formValues = formRef.current.getFieldsValue()
        const { questionArr, testId } = formValues
        const updatedQuestion = questionArr.map((qs) => ({
            id: qs.id,
            name: qs.name,
            description: qs.description,
            testId: testId
        }))
        await updateManyQuestionOnTest(updatedQuestion)
    }
    //function update answer
    const handleUpdateManyAnswer = async () => {
        const formValues = formRef.current.getFieldsValue();
        const { questionArr } = formValues;

        const answersToUpdate = questionArr.flatMap((question) =>
            question.answerArr.map((answer) => ({
                id: answer.id,
                name: answer.name,
                description: answer.description,
                correct: answer.correct,
                questionId: question.id
            }))
        );

        await updateManyAnswerApi(answersToUpdate);
    };
    //fuction xử lý lưu dữ liệu đã cập nhật
    const handleSubmitBtn = async () => {
        await handleUpdateQuestion()
        await handleUpdateTestInfo()
        await handleUpdateManyAnswer()
        resetAndCloseModal()
    }

    const resetAndCloseModal = () => {
        setIsDrawerUpdateOpen(false)
        setDataUpdate(null)
    }
    return (
        <Drawer title="Update test"
            width={720}
            open={isDrawerUpdateOpen}
            onClose={resetAndCloseModal}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                <Space>
                    <Button onClick={resetAndCloseModal}>Cancel</Button>
                    <Button onClick={handleSubmitBtn} type="primary">
                        Submit
                    </Button>
                    <Button key="addQuestion" type="dashed" onClick={handleAddQuestion} >
                        Add Question
                    </Button>,
                </Space>
            }>
            <Form layout="vertical" ref={formRef}
                form={form}
                name="update_chapter_form"
                requiredMark>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="testId"
                            label="Test Id"

                            hidden
                        >
                        </Form.Item>
                        <Form.Item
                            name="testName"
                            label="Test Name"
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
                    <Col span={12}>
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
                                    message: 'Course name can be empty',
                                },
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <Form
                labelCol={{
                    span: 6,
                }}
                wrapperCol={{
                    span: 18,
                }}
                form={form}
                name="dynamic_form_complex"
                style={{
                    maxWidth: 600,
                }}
                autoComplete="off"
                initialValues={{
                    items: [{}],
                }}
            >
                <Form.List name="questionArr">
                    {(fields, { add, remove }) => (
                        <div
                            style={{
                                display: 'flex',
                                rowGap: 16,
                                flexDirection: 'column',
                            }}
                        >
                            {fields.map((field) => (
                                <Card
                                    size="small"
                                    title={`Item ${field.name + 1}`}
                                    key={field.key}
                                    extra={

                                        <Popconfirm
                                            title="Are you sure to delete this question?"
                                            onConfirm={() => handleDeleteQuestion(form.getFieldValue(['questionArr', field.name, 'id']), () => remove(field.name))}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <CloseOutlined />
                                        </Popconfirm>
                                    }
                                >

                                    <Form.Item
                                        label="Name" name={[field.name, 'name']}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="description" name={[field.name, 'description']}>
                                        <Input.TextArea />
                                    </Form.Item>
                                    <Form.Item label="List Answer">
                                        <Form.List name={[field.name, 'answerArr']}>
                                            {(subFields, subOpt) => (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        rowGap: 16,
                                                    }}
                                                >
                                                    {subFields.map((subField) => (
                                                        <Space key={subField.key}>
                                                            <Form.Item noStyle name={[subField.name, 'name']}>
                                                                <Input placeholder="Answer Name" />
                                                            </Form.Item>
                                                            <Form.Item noStyle name={[subField.name, 'description']}>
                                                                <Input.TextArea placeholder="Description" />
                                                            </Form.Item>
                                                            <Form.Item
                                                                noStyle
                                                                name={[subField.name, 'correct']}
                                                            >
                                                                <Select placeholder="Select true or false">
                                                                    <Select.Option value={true}>
                                                                        True
                                                                    </Select.Option>
                                                                    <Select.Option value={false}>
                                                                        False
                                                                    </Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                            <Popconfirm
                                                                title="Are you sure to delete this answer?"
                                                                onConfirm={() =>
                                                                    handleDeleteAnswer(
                                                                        form.getFieldValue(['questionArr', field.name, 'answerArr', subField.name, 'id']),
                                                                        () => subOpt.remove(subField.name)
                                                                    )
                                                                }
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <CloseOutlined />
                                                            </Popconfirm>
                                                        </Space>
                                                    ))}
                                                    <Button type="dashed" onClick={() => subOpt.add()} block>
                                                        + Add Answer
                                                    </Button>
                                                    <Button
                                                        type="primary"
                                                        onClick={async () => {
                                                            const answers = form.getFieldValue([
                                                                'questionArr',
                                                                field.name,
                                                                'answerArr',
                                                            ]);
                                                            const questionId = form.getFieldValue([
                                                                'questionArr',
                                                                field.name,
                                                                'id',
                                                            ]);
                                                            await handleAddAnswer(questionId, answers);
                                                        }}
                                                    >
                                                        Save Answers
                                                    </Button>

                                                </div>
                                            )}
                                        </Form.List>
                                    </Form.Item>
                                </Card>
                            ))}
                            <Button type="dashed" onClick={() => add()} block>
                                + Add Question
                            </Button>

                        </div>

                    )}
                </Form.List>
            </Form>
        </Drawer>

    )
}

export default UpdateTestModal
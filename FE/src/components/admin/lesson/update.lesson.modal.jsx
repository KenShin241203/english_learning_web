import {
    Button, Input, notification, Modal,
    Form, Card, Typography, Space, Drawer, Col, Row,
    message, Popconfirm, Select, Tag
} from "antd";
import { CloseOutlined, TranslationOutlined } from '@ant-design/icons';
import { useEffect, useRef } from "react";
import { fetchLessonWithQuestion, updateLessonApi } from "../../../services/api.lesson.service";
import { createManyQuestionForLesson, updateManyQuestionOnLesson, deleteQuestionApi, fetchQuestionWithAnswer, translateToEnglish } from "../../../services/api.question.service"
import { createManyAnswerApi, deleteAnswerApi, updateManyAnswerApi } from "../../../services/api.answer.service"
const UpdateLessonModal = (props) => {

    const [form] = Form.useForm();
    const formRef = useRef(null)
    const { isDrawerUpdateOpen, setIsDrawerUpdateOpen, dataUpdate, setDataUpdate, loadLesson } = props;

    useEffect(() => {
        if (dataUpdate && formRef) {
            loadLessonWithQuestion(dataUpdate._id)

        }
    }, [dataUpdate])

    //load data lesson cần update
    const loadLessonWithQuestion = async (lessonId) => {
        const res = await fetchLessonWithQuestion(lessonId);
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
                        id: qs._id,
                        name: qs.name,
                        description: qs.description,
                        lessonId: qs.lessonId,
                        type: qs.type,
                        translation: qs.translation,
                        wordBank: qs.wordBank || [],
                        answerArr
                    };
                })
            );
            form.setFieldsValue({
                lessonId: lessonId,
                lessonName: res.data.name,
                chapterId: res.data.chapterId._id,
                chapterName: res.data.chapterId.name,
                questionArr: questionData
            });
        } else {
            notification.error({
                message: "Error Loading Lesson",
                description: res.message,
            });
        }
    };

    //function xử lý add question
    const handleAddQuestion = async () => {
        const formValues = formRef.current.getFieldsValue();
        const { questionArr, lessonId } = formValues;

        // Định dạng lại dữ liệu câu hỏi trước khi gửi
        const formattedQuest = questionArr.map((qs) => {
            if (qs.type === 'word_order') {
                // Kiểm tra bắt buộc trường translation và wordBank
                if (!qs.translation || !qs.wordBank || qs.wordBank.length === 0) {
                    notification.error({
                        message: "Error Adding Question",
                        description: "Word order questions must have translation and word bank.",
                    });
                    return null;
                }
            }

            return {
                name: qs.name,
                description: qs.description,
                lessonId,
                type: qs.type,
                translation: qs.type === 'word_order' ? qs.translation : undefined,
                wordBank: qs.type === 'word_order' ? qs.wordBank : undefined,
            };
        }).filter((qs) => qs !== null); // Loại bỏ các câu hỏi không hợp lệ

        // Gửi API tạo câu hỏi
        const res = await createManyQuestionForLesson(formattedQuest);
        if (res.data) {
            notification.success({
                message: "Add Question Successfully",
                description: "Questions added successfully!",
            });
            await loadLessonWithQuestion(dataUpdate._id);
            await loadLesson();
        } else {
            notification.error({
                message: "Error Adding Question",
                description: JSON.stringify(res.message),
            });
        }
    };


    //fucntion xử lý add answer cho mỗi question trong lesson
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
            await loadLesson()
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
            removeField(); // Xóa field lesson khỏi giao diện
            await loadLesson();
        } else {
            notification.error({
                message: "Error Deleting Question",
                description: res.message,
            });
        }
    }
    //function update lesson
    const handleUpdateLessonInfo = async () => {
        const formValues = formRef.current.getFieldsValue()
        const { lessonId, lessonName, chapterId } = formValues
        const res = await updateLessonApi(lessonId, lessonName, chapterId)
        if (res.data) {
            notification.success({
                message: "Update Lesson",
                description: "Lesson updated successfully"
            });
            await loadLesson();
        }
    }
    //function update question
    const handleUpdateQuestion = async () => {
        const formValues = formRef.current.getFieldsValue()
        const { questionArr, lessonId } = formValues
        const updatedQuestion = questionArr.map((qs) => ({
            id: qs.id,
            name: qs.name,
            description: qs.description,
            type: qs.type,
            translation: qs.translation,
            wordBank: Array.isArray(qs.wordBank) ? qs.wordBank : [],
            lessonId: lessonId
        }))
        await updateManyQuestionOnLesson(updatedQuestion)
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

    const handleTranslate = async (fieldName) => {
        // Lấy dữ liệu questionArr từ form
        const questionArr = form.getFieldValue("questionArr");
        console.log("fieldName:", fieldName);  // Kiểm tra giá trị fieldName
        console.log("questionArr:", questionArr);  // Kiểm tra cấu trúc questionArr

        // Tìm câu hỏi trong mảng questionArr dựa trên fieldName (tên câu hỏi)
        const questionIndex = questionArr.findIndex(q => q.description === fieldName); // Tìm index của câu hỏi

        // Nếu không tìm thấy câu hỏi, hiển thị thông báo lỗi
        if (questionIndex === -1) {
            notification.error({
                message: "Error",
                description: "Question not found.",
            });
            return;
        }

        // Lấy giá trị description từ questionArr theo chỉ số tìm được
        const description = questionArr[questionIndex].description;
        console.log("Description:", description); // Kiểm tra giá trị description

        if (!description) {
            notification.error({
                message: "Error",
                description: "Please enter a description before translating.",
            });
            return;
        }

        try {
            // Gọi API dịch
            const res = await translateToEnglish(description);
            if (res.data) {
                // Cập nhật translation vào Form
                const translation = res.data.translation;
                questionArr[questionIndex].translation = translation; // Cập nhật giá trị translation

                // Tách các từ từ bản dịch và lưu vào wordBank
                const words = translation.split(' ').filter((word) => word.trim() !== ''); // Loại bỏ từ rỗng
                questionArr[questionIndex].wordBank = words; // Lưu danh sách từ vào wordBank

                // Đồng bộ lại Form
                form.setFieldsValue({ questionArr });
                notification.success({ message: "Translation and Word Bank generated successfully!" });
            }
        } catch (error) {
            notification.error({
                message: "Translation Error",
                description: "Failed to translate the description.",
            });
            console.error("Translation Error:", error);
        }
    };




    //fuction xử lý lưu dữ liệu đã cập nhật
    const handleSubmitBtn = async () => {
        await handleUpdateQuestion()
        await handleUpdateLessonInfo()
        await handleUpdateManyAnswer()
        resetAndCloseModal()
    }

    const resetAndCloseModal = () => {
        setIsDrawerUpdateOpen(false)
        setDataUpdate(null)
    }
    return (
        <Drawer title="Update lesson"
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
                            name="lessonId"
                            label="Lesson Id"

                            hidden
                        >
                        </Form.Item>
                        <Form.Item
                            name="lessonName"
                            label="Lesson Name"
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
                                        label="Name"
                                        name={[field.name, 'name']}
                                    >
                                        <Input />
                                    </Form.Item>

                                    {/* Loại câu hỏi */}
                                    <Form.Item
                                        name={[field.name, 'type']}
                                        label="Type"
                                        rules={[{ required: true, message: 'Type cannot be empty.' }]}
                                    >
                                        <Select
                                            placeholder="Select question type"
                                            onChange={(value) => {
                                                const questionArr = [...form.getFieldValue('questionArr')]; // Clone questionArr before updating
                                                questionArr[field.name].type = value;
                                                form.setFieldsValue({ questionArr }); // Đồng bộ lại Form
                                            }}
                                        >
                                            <Select.Option value="multiple_choice">Multiple Choice</Select.Option>
                                            <Select.Option value="word_order">Word Order</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label="Description"
                                        name={[field.name, 'description']}
                                        rules={[{ required: true, message: 'Description cannot be empty.' }]}
                                    >
                                        <Input.TextArea
                                            placeholder="Enter question description"
                                            onChange={(e) => {
                                                const questionArr = [...form.getFieldValue('questionArr')]; // Clone questionArr before updating
                                                questionArr[field.name].description = e.target.value; // Cập nhật vào mảng
                                                form.setFieldsValue({ questionArr }); // Đồng bộ lại Form
                                            }}
                                        />
                                    </Form.Item>

                                    <Button
                                        icon={<TranslationOutlined />}
                                        type="text"
                                        onClick={async () => {
                                            const questionArr = form.getFieldValue('questionArr');
                                            const description = questionArr[field.name].description; // Lấy description của câu hỏi hiện tại
                                            await handleTranslate(description);  // Gửi description để dịch
                                        }}
                                    >
                                        Translate
                                    </Button>

                                    {/* Trường cho loại Word Order */}
                                    {form.getFieldValue(['questionArr', field.name, 'type']) === 'word_order' && (
                                        <>
                                            <Form.Item
                                                label="Translation"
                                                name={[field.name, 'translation']}
                                                rules={[{ required: true, message: 'Translation cannot be empty.' }]}
                                            >
                                                <Input.TextArea
                                                    value={form.getFieldValue(['questionArr', field.name, 'translation']) || ''} // Đảm bảo là chuỗi văn bản
                                                    placeholder="Translation (English)"
                                                    onChange={(e) => {
                                                        const questionArr = [...form.getFieldValue('questionArr')]; // Clone questionArr before updating
                                                        questionArr[field.name].translation = e.target.value; // Cập nhật translation
                                                        form.setFieldsValue({ questionArr }); // Đồng bộ lại Form
                                                    }}
                                                />
                                            </Form.Item>
                                            {/* Hiển thị danh sách từ trong wordBank */}
                                            <Form.Item
                                                label="Word Bank"
                                                name={[field.name, 'wordBank']}
                                            >
                                                <div>
                                                    {form.getFieldValue(['questionArr', field.name, 'wordBank'])?.map((word, index) => (
                                                        <Tag key={index}>{word}</Tag>
                                                    ))}
                                                </div>
                                            </Form.Item>
                                        </>

                                    )}

                                    {/* Trường cho loại Multiple Choice */}
                                    {form.getFieldValue(['questionArr', field.name, 'type']) === 'multiple_choice' && (
                                        <>
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
                                                                    <Form.Item noStyle name={[subField.name, 'correct']}>
                                                                        <Select placeholder="Select true or false">
                                                                            <Select.Option value={true}>True</Select.Option>
                                                                            <Select.Option value={false}>False</Select.Option>
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
                                                                Add Answers
                                                            </Button>
                                                            {/* <Button
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
                                                                    await handleUpdateManyAnswer(questionId, answers);
                                                                }}
                                                            >
                                                                Save Answers
                                                            </Button> */}
                                                        </div>
                                                    )}
                                                </Form.List>
                                            </Form.Item>
                                        </>
                                    )}
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

export default UpdateLessonModal
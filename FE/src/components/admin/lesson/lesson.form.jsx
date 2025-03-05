import { Button, Input, notification, Modal } from "antd";
import { useState } from "react";
import { createLessonApi } from "../../../services/api.lesson.service";

const LessonForm = (props) => {
    const { loadLesson } = props;

    const [name, setLessonName] = useState("");
    const [total_Question, setTotalQuestion] = useState("");
    const [chapterId, setChapter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleSubmitBtn = async () => {
        const res = await createLessonApi(name, total_Question, chapterId)
        if (res.data) {
            notification.success({
                message: "Create Lesson",
                description: "New lesson just created"
            })

            resetAndCloseModal()
            await loadLesson();
        }
        else {
            notification.error({
                message: "Error Create Lesson",
                description: JSON.stringify(res.message)
            })
        }
    }
    const resetAndCloseModal = () => {
        setIsModalOpen(false)
        setLessonName("")
        setTotalQuestion("")
        setChapter("")
    }
    return (
        <div className="lesson-form" style={{ margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "end" }}>
                <Button type="primary" onClick={() => setIsModalOpen(true)}> Create Lesson </Button>
            </div>
            <Modal title="Create Lesson"
                open={isModalOpen}
                onOk={() => handleSubmitBtn()}
                onCancel={() => { resetAndCloseModal() }}
                maskClosable={false}
                okText={"CREATE"}>
                <div className="lesson-form">
                    <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                        <div>
                            <span>Lesson name</span>
                            <Input value={name}
                                onChange={(event) => setLessonName(event.target.value)} />
                        </div>
                        <div>
                            <span>Total question</span>
                            <Input value={total_Question}
                                onChange={(event) => setTotalQuestion(event.target.value)} />
                        </div>
                        <div>
                            <span>Chapter</span>
                            <Input value={chapterId}
                                onChange={(event) => setChapter(event.target.value)} />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>

    )
}

export default LessonForm
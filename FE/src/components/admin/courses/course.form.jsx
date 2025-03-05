import { useState } from "react"
import { createCourseApi } from "../../../services/api.course.service"
import { Button, Input, notification, Modal } from "antd";

const CourseForm = (props) => {
    const [courseName, setCourseName] = useState("")
    const [totalTime, setTotalTime] = useState("")
    const [price, setPrice] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { loadCourse } = props
    const handleSubmitBtn = async () => {
        const res = await createCourseApi(courseName, totalTime, price)
        if (res.data) {
            notification.success({
                message: "Create Course",
                description: "Create course sucessfully"
            })
            resetAndCloseModal()
            await loadCourse();
        }
        else {
            notification.error({
                message: "Error Create Course",
                description: JSON.stringify(res.message)
            })
        }
    }
    const resetAndCloseModal = () => {
        setIsModalOpen(false)
        setCourseName("")
        setTotalTime("")
        setPrice("")
    }

    return (
        <div className="course-form" style={{ margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "end" }}>

                <Button type="primary" onClick={() => setIsModalOpen(true)}> Create Course </Button>
            </div>
            <Modal title="Create Course"
                open={isModalOpen}
                onOk={() => handleSubmitBtn()}
                onCancel={() => { resetAndCloseModal() }}
                maskClosable={false}
                okText={"CREATE"}>
                <div className="lesson-form">
                    <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                        <div>
                            <span>Course Name</span>
                            <Input value={courseName}
                                onChange={(event) => setCourseName(event.target.value)} />
                        </div>
                        <div>
                            <span>Total Time</span>
                            <Input value={totalTime}
                                onChange={(event) => setTotalTime(event.target.value)} />
                        </div>
                        <div>
                            <span>Course Price</span>
                            <Input value={price}
                                onChange={(event) => setPrice(event.target.value)} />
                        </div>
                    </div>
                </div>

            </Modal>
        </div>

    )
}
export default CourseForm
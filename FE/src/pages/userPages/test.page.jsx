import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CloseOutlined, MutedOutlined } from "@ant-design/icons";
import { Typography, Button, Spin, Progress, Layout, message, Tooltip, Menu } from "antd";
import { fetchQuestionWithLessonId } from "../../services/api.question.service";
import './test.page.css';
import { fetchLessonWithQuestion } from "../../services/api.lesson.service";
import { AuthContext } from "../../components/context/auth.context";
import { getAccount } from "../../services/api.user.service";
import { markLessonCompleteApi } from "../../services/api.progress.service";

const TestPage = () => {
    const navigate = useNavigate();
    const { user, setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);
    const { Header } = Layout;
    const { Title, Paragraph } = Typography;
    const { lessonId } = useParams();
    const [lessonName, setLessonName] = useState();
    const [courseId, setCourseId] = useState();
    const [chapterId, setChapterId] = useState();
    const [questions, setQuestions] = useState([]);
    const [answeredCount, setAnsweredCount] = useState(0); // Số câu hỏi đã trả lời
    const [answers, setAnswers] = useState({}); // Theo dõi các câu trả lời đã chọn
    const [resultVisible, setResultVisible] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
    const [resultPercent, setResultPercent] = useState(0);
    const [resultStatus, setResultStatus] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserInfo();
        fetchQuestionAndAnswer();
        fetchLessonById();
    }, []);

    const fetchUserInfo = async () => {
        const res = await getAccount();
        if (res.data) {
            setUser(res.data);
        }
        setIsAppLoading(false);
    };

    const fetchQuestionAndAnswer = async () => {
        setLoading(true);
        const user = await getAccount();
        if (user.data) {
            const res = await fetchQuestionWithLessonId(lessonId);

            if (res.data) {
                const multipleChoiceQuestions = res.data.filter(question => question.type === 'multiple_choice');
                setQuestions(multipleChoiceQuestions);
            }
        }
        setLoading(false);
    };

    const fetchLessonById = async () => {
        const res = await fetchLessonWithQuestion(lessonId);
        if (res.data) {
            setCourseId(res.data.chapterId.courseId._id);
            setChapterId(res.data.chapterId._id);
            setLessonName(res.data.name);
        }
    };

    const handleSubmit = async () => {
        const results = questions.map((question) => {
            const correctAnswer = question.answerInfo.find(answer => answer.correct);
            const isCorrect = answers[question._id] === correctAnswer?._id;
            return { ...question, isCorrect, correctAnswerId: correctAnswer?._id };
        });

        const correctCount = results.filter((q) => q.isCorrect).length;
        const wrongCount = questions.length - correctCount;

        if (correctCount === questions.length) {
            try {
                const response = await markLessonCompleteApi(user._id, courseId, chapterId, lessonId, correctCount, questions.length);
                if (response.data.success) {
                    message.success(response.data.message);
                    user.tokens = response.data.tokens;  // Update user's tokens
                }
            } catch (error) {
                message.error('Lỗi khi cập nhật trạng thái hoàn thành bài học');
            }
        } else {
            message.warning("Bạn chưa trả lời đúng hết các câu hỏi!");
        }

        setCorrectAnswersCount(correctCount);
        setWrongAnswersCount(wrongCount);
        setQuestions(results);
        setResultVisible(true);

        const resultPercent = (correctCount / questions.length) * 100;
        const resultStatus = wrongCount > 0 ? 'success' : 'success';

        setResultPercent(resultPercent);
        setResultStatus(resultStatus);

    };



    const handleAnswerToggle = (questionId, answerId) => {
        setAnswers((prev) => {
            const updatedAnswers = { ...prev };
            if (updatedAnswers[questionId] === answerId) {
                delete updatedAnswers[questionId];
                setAnsweredCount((count) => count - 1);
            } else {
                updatedAnswers[questionId] = answerId;
                if (!prev[questionId]) setAnsweredCount((count) => count + 1);
            }
            return updatedAnswers;
        });
    };

    const handleClose = () => {
        // Quay lại trang LearningPage
        navigate(`/course/${courseId}/learning`);
    };

    const speakQuestion = (text) => {
        if ('speechSynthesis' in window) {
            // Dừng mọi âm thanh hiện tại trước khi phát
            window.speechSynthesis.cancel();

            // Tạo một đối tượng SpeechSynthesisUtterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // Đọc bằng tiếng Anh
            utterance.rate = 1; // Tốc độ đọc (1 là mặc định)
            utterance.pitch = 1; // Cao độ giọng đọc
            utterance.volume = 1; // Âm lượng (0.0 đến 1.0)

            // Phát giọng nói
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support text-to-speech functionality!');
        }
    };

    const totalQuestions = questions.length;
    const progressPercent = (answeredCount / totalQuestions) * 100;
    // const resultPercent = (correctAnswersCount / totalQuestions) * 100;
    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;
    }

    return (
        <>
            {isAppLoading === true ?
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Spin />
                </div>
                :
                <Layout className="test-page-container">
                    <Header className="test-page-header">
                        <div className="header-content">
                            <Title level={4} style={{ color: 'white', margin: 0 }}>
                                {answeredCount}/{totalQuestions}
                            </Title>
                            <Title level={5} style={{ color: 'white', margin: 0 }}>
                                Kiểm tra {lessonName}
                            </Title>
                            <CloseOutlined
                                className="close-icon"
                                onClick={handleClose}
                            // style={{ color: 'white', fontSize: '24px', position: 'absolute', right: '10px', top: '10px' }}
                            />
                        </div>
                    </Header>

                    <Progress
                        style={{ height: '0px' }}
                        percent={progressPercent}
                        status="active"
                        strokeColor="#1890ff"
                        className="progress-bar"
                        showInfo={false}
                    />
                    <div className="questions-container">
                        {resultVisible && (
                            <div className="result-container">
                                <Tooltip>
                                    <Progress
                                        style={{ marginBottom: '10px' }}
                                        type="circle"
                                        percent={resultPercent}

                                        strokeColor={resultStatus === 'exception' ? '#ff4d4f' : '#52c41a'} // Màu đỏ cho sai, màu xanh cho đúng
                                    />
                                    <Title className="correct-count-title" level={5}>Số câu đúng: {correctAnswersCount}</Title>
                                    <Title className="wrong-count-title" level={5}>Số câu sai: {wrongAnswersCount}</Title>
                                </Tooltip>
                            </div>
                        )}
                        {questions.map((question, index) => (
                            <div key={question._id} className="question-container">
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Title level={5} style={{ fontSize: '20px', margin: 0 }}>
                                        {question.name}
                                    </Title>
                                    {/* Nút loa */}
                                    <MutedOutlined
                                        type="link"
                                        onClick={() => speakQuestion(question.description)} // Hàm đọc câu hỏi
                                        style={{ fontSize: "20px", margin: "0 8px" }}

                                    />
                                </div>
                                <Paragraph className="description-paragraph" ellipsis={false}>{question.description}</Paragraph>
                                <div className="answer-group">
                                    {question.answerInfo.map((answer) => {
                                        const isCorrectAnswer = answer.correct; // Đây là đáp án đúng
                                        const isSelectedAnswer = answers[question._id] === answer._id; // Đây là đáp án được chọn
                                        const isWrongAnswer = resultVisible && isSelectedAnswer && !isCorrectAnswer; // Đáp án sai được chọn

                                        return (
                                            <Button
                                                key={answer._id}
                                                type={isSelectedAnswer ? "primary" : "default"}
                                                className={`answer-option 
                                                ${resultVisible && isCorrectAnswer ? 'correct-answer' : ''} 
                                                ${isWrongAnswer ? 'wrong-answer' : ''}
                                                ${!resultVisible && isSelectedAnswer ? 'selected-answer' : ''}`}
                                                onClick={() => !resultVisible && handleAnswerToggle(question._id, answer._id)}
                                            >
                                                {answer.description}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {!resultVisible && (
                            <Button type="primary" className="submit-button" onClick={handleSubmit}>
                                Nộp bài
                            </Button>
                        )}
                    </div>
                </Layout>
            }
        </>
    );
};

export default TestPage;

import { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Row, Col, Collapse, List, Spin, Typography, Button,
    Space, Pagination, Rate, Progress, message, Form, Select,
    Modal, notification, Input
} from 'antd';
import { LockOutlined, CheckCircleOutlined, SoundOutlined, LikeOutlined, DislikeOutlined, LikeFilled, DislikeFilled } from '@ant-design/icons';
import { fetchCourseById } from '../../services/api.course.service';
import { fetchChapterWithLessAndTest, unlockChapterApi } from '../../services/api.chapter.service';
import { getProgressApi, markLessonCompleteApi } from '../../services/api.progress.service';
import { AuthContext } from '../../components/context/auth.context';
import './learning.page.css';
import Footer from '../../components/user/layout/footer';
import { dislikeReviewApi, fetchLikeAndDislikeApi, fetchReviewsOfCourseApi, getReviewByIdApi, likeReviewApi, removeReactionReviewApi, respondToReviewApi } from '../../services/api.review.service';
import { fetchQuestionWithLessonId } from '../../services/api.question.service';
import HeaderLearningPage from './sider.learning.page';
import CongratulationAnimation from './animation/CongratulationAnimation';
import TrumpetAnimation from './animation/TrumpetAnimation';

const { Panel } = Collapse;
const { Paragraph } = Typography;
const { Option } = Select
const LearningPage = () => {
    const { user } = useContext(AuthContext);
    const { courseId } = useParams();
    const [course, setCourse] = useState({});
    const [chapters, setChapters] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [currentLessons, setCurrentLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]); // Danh sách bài học đã hoàn thành
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showVocabulary, setShowVocabulary] = useState(true); // Toggle giữa từ vựng và giải nghĩa
    const [loading, setLoading] = useState(true);
    const [chapterLessons, setChapterLessons] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const previousPage = location.state?.from || '/';
    const [reviews, setReviews] = useState([]); // Danh sách review
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [reviewLoading, setReviewLoading] = useState(false);
    const [clickLesson, setClickLesson] = useState(null);
    const [answers, setAnswers] = useState({}); // Theo dõi các câu trả lời đã chọn
    const [isChecked, setIsChecked] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0); // Đếm số câu trả lời đúng
    const [showResultCard, setShowResultCard] = useState(false); // Hiển thị card kết quả
    const [sortedWords, setSortedWords] = useState([]); // Các từ đã được kéo vào ô
    const [shuffledWordBank, setShuffledWordBank] = useState([]); // WordBank xáo trộn
    const [ratings, setRatings] = useState([])
    const [selectedRating, setSelectedRating] = useState(null); // Lưu rating được chọn để lọc
    const [filteredReviews, setFilteredReviews] = useState(reviews); // Danh sách đánh giá được lọc
    const [noReviewsFound, setNoReviewsFound] = useState(false); // Trạng thái để kiểm tra khi không có đánh giá
    const [feedback, setFeedback] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [likedReviewIds, setLikedReviewIds] = useState([]);
    const [dislikedReviewIds, setDislikedReviewIds] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Lấy thông tin khóa học và tiến độ
                const courseRes = await fetchCourseById(courseId);
                const progressRes = await getProgressApi(user._id, courseId);
                setCourse(courseRes.data);
                const progress = progressRes.data?.chapterProgress || [];
                const chapters = courseRes.data?.chapterInfo || [];

                if (chapters.length > 0) {
                    chapters.sort((a, b) => a.numOrder - b.numOrder);
                    setChapters(chapters);

                    const completedLessonsSet = new Set();
                    progress.forEach((chapter) =>
                        chapter.completedLessons.forEach((lessonId) => completedLessonsSet.add(lessonId))
                    );
                    setCompletedLessons(Array.from(completedLessonsSet));

                    // Always unlock the chapter with numOrder = 1
                    const updatedChapters = chapters.map((ch) => ({
                        ...ch,
                        unlocked: ch.numOrder === 1 || progress.some((p) => p.chapterId._id === ch._id),
                    }));

                    setChapters(updatedChapters);

                    let unlockedChapter = updatedChapters.find((chapter) => chapter.unlocked);

                    if (!unlockedChapter) {
                        unlockedChapter = updatedChapters[0]; // Nếu không có chương nào được mở khóa, chọn chương đầu tiên
                    }

                    setCurrentChapter(unlockedChapter);

                    const chapterRes = await fetchChapterWithLessAndTest(unlockedChapter._id, { populate: 'lessonInfo' });
                    if (chapterRes.data) {
                        const lessons = chapterRes.data.lessonInfo || [];
                        setCurrentLessons(lessons);

                        const firstLesson = lessons[0];
                        setSelectedLesson(firstLesson);

                        setChapterLessons((prev) => ({
                            ...prev,
                            [unlockedChapter._id]: lessons,
                        }));

                        await fetchLessonCards(firstLesson);
                        setClickLesson(firstLesson._id);
                    }
                }

                // Fetch reviews after initial data
                await fetchReviews();
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }

            setLoading(false);
        };

        fetchData(); // Gọi hàm fetchData trong useEffect
    }, [courseId, user._id]); // useEffect sẽ được gọi lại khi courseId hoặc user._id thay đổi

    const shuffleArray = (array) => {
        return array
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    };

    const fetchReviews = async () => {
        setReviewLoading(true);
        try {
            const res = await fetchReviewsOfCourseApi(current, pageSize, courseId);
            if (res.data) {
                setReviews(res.data.reviews);
                setRatings(res.data.ratings); // Thống kê rating
                setCurrent(res.meta.currentPage);
                setPageSize(res.meta.pageSize);
                setTotal(res.meta.totalEntity);
                setFilteredReviews(res.data.reviews);

                // Update like and dislike status
                const likedIds = [];
                const dislikedIds = [];
                res.data.reviews.forEach(review => {
                    if (review.likes.includes(user._id)) likedIds.push(review._id);
                    if (review.dislikes.includes(user._id)) dislikedIds.push(review._id);
                });
                setLikedReviewIds(likedIds);
                setDislikedReviewIds(dislikedIds);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách review:", error);
        }
        setReviewLoading(false);
    };


    // Chọn chương khi người dùng chuyển đổi
    const handleChapterChange = async (activeKeys) => {
        for (const chapterId of activeKeys) {
            if (!chapterLessons[chapterId]) {
                try {
                    const res = await fetchChapterWithLessAndTest(chapterId, { populate: 'lessonInfo' });
                    if (res.data) {
                        setChapterLessons((prev) => ({
                            ...prev,
                            [chapterId]: res.data.lessonInfo,
                        }));
                    }
                } catch (error) {
                    console.error(`Lỗi khi lấy bài học của chapter ${chapterId}:`, error);
                }
            }
        }

        // Khi chọn chương mới, cập nhật bài học đầu tiên của chương đó
        const selectedChapter = chapters.find(chapter => chapter._id === activeKeys[0]);
        if (selectedChapter) {
            setCurrentChapter(selectedChapter);
            setCurrentLessons(chapterLessons[selectedChapter._id] || []);
            setSelectedLesson(chapterLessons[selectedChapter._id]?.[0] || null); // Cập nhật bài học đầu tiên của chương đó
        }
    };

    const handleLessonClick = async (lesson) => {
        if (!isLessonUnlocked(lesson)) return;

        setClickLesson(lesson._id);
        setSelectedLesson(lesson);
        await fetchLessonCards(lesson);

        // Lấy danh sách câu hỏi cho lesson hiện tại
        const lessonQuestionsRes = await fetchQuestionWithLessonId(lesson._id);
        if (lessonQuestionsRes.data) {
            // Kiểm tra và xử lý các câu hỏi dạng 'word_order'
            const wordOrderQuestions = lessonQuestionsRes.data.filter(q => q.type === 'word_order');
            console.log(wordOrderQuestions)
            if (wordOrderQuestions.length > 0) {
                const wordBank = wordOrderQuestions[0].wordBank || [];
                setShuffledWordBank(shuffleArray(wordBank)); // Xáo trộn từ trong wordBank
                setSortedWords([]); // Reset các từ đã được sắp xếp
            }
        }
    };

    const fetchImageFromPixabay = async (query) => {
        const apiKey = "47357345-307ac793c6fec6ecdd653b2a7";
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Check if any images are returned
            if (data.hits && data.hits.length > 0) {
                // Return the URL of the first image
                return data.hits[0].webformatURL;
            } else {
                return null; // No images found
            }
        } catch (error) {
            console.error("Error fetching image:", error);
            return null; // Error, return null
        }
    };

    const fetchLessonCards = async (lesson) => {
        try {
            const res = await fetchQuestionWithLessonId(lesson._id); // Gọi API với lessonId
            if (res.data) {
                const lessonCards = await Promise.all(
                    res.data.map(async (question) => {
                        // Xử lý wordBank và shuffledWordBank
                        const wordBank = question.wordBank || [];
                        const shuffledWordBank = shuffleArray(wordBank); // Tạo wordBank xáo trộn

                        return {
                            questionId: question._id,
                            questionDescription: question.description,
                            type: question.type,
                            translation: question.translation,
                            wordBank: wordBank, // Danh sách từ gốc
                            shuffledWordBank: shuffledWordBank, // Tạo wordBank xáo trộn
                            sortedWords: [], // Khởi tạo khung sắp xếp rỗng
                            answerInfo: question.answerInfo
                                ? await Promise.all(
                                    question.answerInfo.map(async (answer) => ({
                                        ...answer,
                                        imageUrl: await fetchImageFromPixabay(answer.name),
                                    }))
                                )
                                : [],
                        };
                    })
                );

                setCards(lessonCards);
                setSelectedLesson(lesson);
                setCurrentCardIndex(0);
            }
        } catch (error) {
            console.error("Lỗi khi lấy câu hỏi của bài học:", error);
            message.error("Có lỗi xảy ra khi tải dữ liệu bài học.");
        }
    };



    const isLessonUnlocked = (lesson) => {
        const chapter = chapters.find((ch) =>
            (chapterLessons[ch._id] || []).some((les) => les._id === lesson._id)
        );
        // Bài học được mở khóa nếu chương chứa nó đã mở khóa
        return chapter && isChapterUnlocked(chapter);
    };


    // Hàm kiểm tra chương được mở khóa
    const isChapterUnlocked = async (chapter) => {
        if (chapter.numOrder === 1)
            return true; // Chương đầu tiên luôn mở khóa
        const previousChapter = chapters.find((ch) => ch.numOrder === chapter.numOrder - 1);
        if (!previousChapter)
            return false;

        const prevChapterLessons = chapterLessons[previousChapter._id] || [];
        // Mở khóa nếu tất cả bài học của chương trước đã hoàn thành
        return await prevChapterLessons.every((lesson) => completedLessons.includes(lesson._id));
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

    const handleBack = () => navigate(previousPage);

    const handleClickTest = () => navigate(`/test/lesson/${selectedLesson._id}`);

    // const toggleContent = () => {
    //     setShowVocabulary((prev) => !prev);
    // };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setShowVocabulary(true);  // Reset lại nội dung là từ vựng

            // Thêm hiệu ứng màu đỏ cho "Previous"
            toggleHighlight("highlight-prev");
        }
    };

    const handleNextCard = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsChecked(false)
            // Thêm hiệu ứng màu xanh lá cho "Next"
            toggleHighlight("highlight-next");
        }
    };

    const handleAnswerToggle = (questionId, answerId) => {
        const currentCard = cards[currentCardIndex];
        if (currentCard?.checked) return; // Không cho phép chọn lại nếu đã kiểm tra

        setAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const checkMultipleChoiceAnswer = (currentCard, answers) => {
        if (!answers[currentCard._id]) {
            // Hiển thị thông báo nếu chưa chọn đáp án
            message.warning('Vui lòng chọn một đáp án trước khi kiểm tra!');
            return false;
        }

        const correctAnswer = currentCard?.answerInfo.find((answer) => answer.correct);
        const selectedAnswerId = answers[currentCard._id];

        if (correctAnswer && correctAnswer._id === selectedAnswerId) {
            setCorrectAnswers((prev) => prev + 1); // Tăng số câu đúng
        }

        const updatedAnswers = currentCard?.answerInfo.map((answer) => ({
            ...answer,
            isCorrect: answer._id === correctAnswer._id, // Đánh dấu đáp án đúng
            isWrong: answer._id === selectedAnswerId && answer._id !== correctAnswer._id, // Đánh dấu đáp án sai nếu chọn sai
        }));

        const updatedCard = {
            ...currentCard,
            answerInfo: updatedAnswers,
            checked: true, // Đánh dấu đã kiểm tra
        };

        const updatedCards = [...cards];
        updatedCards[currentCardIndex] = updatedCard;

        setAnswers([]);
        setCards(updatedCards);
        setIsChecked(true); // Đánh dấu trạng thái đã kiểm tra

        return true; // Đã kiểm tra và xử lý đúng
    };


    const checkWordOrderAnswer = (currentCard, sortedWords) => {
        // Kiểm tra xem người dùng đã kéo thả ít nhất một từ vào khung hay chưa
        if (sortedWords.length === 0) {
            message.warning('Vui lòng kéo ít nhất một từ vào trong ô trước khi kiểm tra!');
            return false;
        }

        // So sánh mảng các từ đã sắp xếp với translation của câu hỏi
        const correctOrder = currentCard.translation.trim().split(" ");
        const userOrder = sortedWords.map((word) => word.trim());

        // Kiểm tra đáp án
        const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);

        if (isCorrect) {
            message.success('Đáp án đúng!');
            setCorrectAnswers((prev) => prev + 1); // Tăng số câu đúng

            // Tô nền xanh cho câu hỏi đúng
            currentCard.answerStyle = { backgroundColor: "#d4edda", color: "#155724" }; // Nền xanh, chữ xanh
        } else {
            message.error('Đáp án sai, vui lòng thử lại!');

            // Tô nền đỏ cho câu hỏi sai
            currentCard.answerStyle = { backgroundColor: "#f8d7da", color: "#721c24" }; // Nền đỏ, chữ đỏ
        }

        // Cập nhật trạng thái kiểm tra cho câu hỏi
        const updatedCard = {
            ...currentCard,
            checked: true, // Đánh dấu đã kiểm tra
        };

        const updatedCards = [...cards];
        updatedCards[currentCardIndex] = updatedCard;


        setCards(updatedCards);
        setIsChecked(true); // Đánh dấu trạng thái đã kiểm tra




        return true; // Đã kiểm tra và xử lý đúng
    };




    const handleCheckAnswer = () => {
        const currentCard = cards[currentCardIndex];

        // Kiểm tra với câu hỏi có type 'multiple_choice'
        if (currentCard.type === "multiple_choice") {
            if (!checkMultipleChoiceAnswer(currentCard, answers)) {
                return; // Nếu kiểm tra không thành công thì dừng lại
            }
        }
        // Kiểm tra với câu hỏi có type 'word_order'
        else if (currentCard.type === "word_order") {
            if (!checkWordOrderAnswer(currentCard, sortedWords)) {
                return; // Nếu kiểm tra không thành công thì dừng lại
            }
        }

        // Nếu là câu hỏi cuối cùng, chuyển sang card kết quả
        if (currentCardIndex === cards.length - 1) {
            setTimeout(() => {
                setShowResultCard(true); // Sau 1 giây, chuyển qua màn hình kết quả
            }, 2000); // Thời gian delay là 1 giây
        }

    };





    const toggleHighlight = (highlightClass) => {
        const wrapper = document.querySelector(".content-wrapper");
        wrapper.classList.add(highlightClass);

        // Xóa lớp hiệu ứng sau 300ms để chỉ nháy lên một lần
        setTimeout(() => {
            wrapper.classList.remove(highlightClass);
        }, 300);
    };

    const handleDragStart = (e, word, from) => {
        e.dataTransfer.setData("word", word);  // Lưu từ vào dataTransfer
        e.dataTransfer.setData("from", from); // Lưu nơi bắt đầu (wordBank hoặc sortedWords)
    };


    const handleDrop = (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định

        const word = e.dataTransfer.getData("word");
        const from = e.dataTransfer.getData("from");

        // Xử lý từ bị kéo từ wordBank hoặc sortedWords
        if (from === "wordBank") {
            setShuffledWordBank((prev) => prev.filter((w) => w !== word)); // Xóa từ khỏi shuffledWordBank
        } else if (from === "sortedWords") {
            setSortedWords((prev) => prev.filter((w) => w !== word)); // Xóa từ khỏi sortedWords
        }

        // Thêm từ vào sortedWords
        setSortedWords((prev) => [...prev, word]);
    };


    const handleDragOver = (e) => {
        e.preventDefault(); // Cho phép thả
    };

    // Xử lý khi thay đổi bộ lọc review
    const handleFilterChange = (value) => {
        setSelectedRating(value);

        if (value) {
            // Lọc đánh giá dựa trên rating
            const filtered = reviews.filter((review) => review.rating === value);
            setFilteredReviews(filtered);

            // Kiểm tra nếu không có đánh giá nào khớp với rating được chọn
            if (filtered.length === 0) {
                setNoReviewsFound(true);
            } else {
                setNoReviewsFound(false);
            }
        } else {
            // Hiển thị tất cả nếu không chọn bộ lọc
            setFilteredReviews(reviews);
            setNoReviewsFound(false);
        }
    };

    const handleReorder = (e, index) => {
        e.preventDefault();

        const word = e.dataTransfer.getData("word");
        const from = e.dataTransfer.getData("from");

        // Xử lý nếu kéo từ wordBank hoặc từ sortedWords
        if (from === "wordBank") {
            setShuffledWordBank((prev) => prev.filter((w) => w !== word)); // Xóa từ khỏi shuffledWordBank
        } else if (from === "sortedWords") {
            setSortedWords((prev) => prev.filter((w) => w !== word)); // Xóa từ khỏi sortedWords
        }

        // Thêm từ vào vị trí mới
        setSortedWords((prev) => {
            const newSorted = [...prev];
            newSorted.splice(index, 0, word);
            return newSorted;
        });
    };


    const handleRetryLesson = async () => {
        if (!selectedLesson) {
            message.error("Không thể tải lại bài học vì không xác định được bài học hiện tại.");
            return;
        }

        setShowResultCard(false); // Ẩn card kết quả
        setCurrentCardIndex(0); // Quay lại câu hỏi đầu tiên
        setIsChecked(false); // Reset trạng thái kiểm tra
        setAnswers({}); // Reset đáp án đã chọn
        setCorrectAnswers(0); // Reset số câu đúng

        // Reset tất cả các thẻ
        const resetCards = cards.map((card) => {
            if (card.type === "multiple_choice") {
                return {
                    ...card,
                    checked: false,
                    answerInfo: card.answerInfo.map((answer) => ({
                        ...answer,
                        isCorrect: false,
                        isWrong: false,
                    })),
                };
            } else if (card.type === "word_order") {
                // Khi học lại, đưa tất cả từ trong `sortedWords` quay lại `shuffledWordBank`
                const resetShuffledWordBank = [...card.wordBank]; // Thêm từ từ sortedWords vào shuffledWordBank
                const shuffledWordBank = setShuffledWordBank(shuffleArray(resetShuffledWordBank)); // Xáo trộn lại wordBank

                return {
                    ...card,
                    checked: false,
                    sortedWords: [], // Reset khung sắp xếp
                    shuffledWordBank: shuffledWordBank, // Đưa lại tất cả các từ vào shuffledWordBank
                };
            }
            return card;
        });

        setCards(resetCards); // Cập nhật lại danh sách thẻ

        // Reset các state khác (nếu có) để chuẩn bị cho học lại
        setSortedWords([]); // Reset các từ đã sắp xếp

        // Gọi lại API để làm mới thẻ (nếu cần)
        await fetchLessonCards(selectedLesson);
    };

    const showFeedbackModal = async (reviewId) => {
        const res = await getReviewByIdApi(reviewId);
        if (res.data.adminResponse) {
            setSelectedReviewId(reviewId);
            setIsModalVisible(true);
            setFeedback(res.data.adminResponse);
        }
        setSelectedReviewId(reviewId);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setFeedback('');
    };

    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleFeedbackSubmit = async () => {
        try {
            const res = await respondToReviewApi(selectedReviewId, feedback);
            if (res.status === 200) {

                notification.success({
                    message: 'Success',
                    description: 'Feedback submitted successfully.',
                });
                setReviews((prevReviews) =>
                    prevReviews.map((review) =>
                        review._id === selectedReviewId
                            ? { ...review, adminResponse: feedback }
                            : review
                    )
                );
                setFeedback(''); // Clear feedback input after submission
                setIsModalVisible(false); // Close the modal
                fetchReviews(); // Refresh reviews
            } else {
                notification.error({
                    message: 'Error',
                    description: res.data.message || 'Failed to submit feedback. Please try again later.',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to submit feedback. Please try again later.',
            });
        }
    };

    const handleLike = async (reviewId) => {
        try {
            await likeReviewApi(user._id, reviewId);
            fetchReviews(); // Refresh reviews
        } catch (error) {
            console.error("Lỗi khi like review:", error);
        }
    };

    const handleDislike = async (reviewId) => {
        try {
            await dislikeReviewApi(user._id, reviewId);
            fetchReviews(); // Refresh reviews
        } catch (error) {
            console.error("Lỗi khi dislike review:", error);
        }
    };

    const handleRemoveReaction = async (reviewId, reactionType) => {
        try {
            console.log(reviewId, reactionType, user._id)
            await removeReactionReviewApi(user._id, reviewId, reactionType);
            fetchReviews(); // Refresh reviews
        } catch (error) {
            console.error(`Lỗi khi remove ${reactionType} review:`, error);
        }
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '400px auto' }} />;

    return (
        <>
            <HeaderLearningPage />
            <Row gutter={[16, 16]} className="learning-page-container">
                <Col span={18}>
                    {showResultCard ? (

                        <div className={`result-card ${correctAnswers === cards.length ? 'congratulation' : ''}`} style={{ textAlign: "center", padding: "20px", position: "relative" }}>
                            <h2>Kết quả bài học</h2>
                            {correctAnswers === cards.length && (
                                <>
                                    <div className='trumpet-left'>
                                        <TrumpetAnimation />
                                    </div>
                                    <div className='trumpet-right'>
                                        <TrumpetAnimation />
                                    </div>
                                    <div className='react-lottie'>
                                        <CongratulationAnimation />
                                    </div>

                                </>
                            )}
                            <div style={{ display: "inline-block", marginBottom: "20px" }}>
                                <Progress
                                    type="circle"
                                    percent={Math.round((correctAnswers / cards.length) * 100)}
                                    format={(percent) => (
                                        <div>
                                            <div>Đúng: {correctAnswers}</div>
                                            <div>Sai: {cards.length - correctAnswers}</div>
                                        </div>
                                    )}
                                />
                            </div>
                            <div>
                                <Button
                                    type="primary"
                                    onClick={handleClickTest}
                                    style={{ marginBottom: "10px" }}
                                >
                                    Bài kiểm tra
                                </Button>
                                <br />
                                <Button
                                    type="primary"
                                    onClick={handleRetryLesson}
                                >
                                    Học lại
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="content-wrapper">

                            {/* Nếu câu hỏi có type là 'multiple_choice' */}
                            {cards[currentCardIndex]?.type === "multiple_choice" && (
                                <>
                                    <div style={{ marginBottom: "16px", marginTop: "-50px" }}>
                                        <div style={{ display: "flex", alignItems: "baseline" }}>
                                            <Paragraph className="question-paragraph" ellipsis={false}>
                                                {cards[currentCardIndex]?.questionDescription || "Không có nội dung"}
                                            </Paragraph>
                                            {course.price === 0 &&
                                                <SoundOutlined
                                                    onClick={() => speakQuestion(cards[currentCardIndex]?.questionDescription)}
                                                    style={{ fontSize: "20px", cursor: "pointer" }}
                                                />
                                            }
                                        </div>
                                    </div>
                                    <Form.Item
                                        name={cards[currentCardIndex]?.translation}
                                        hidden>

                                    </Form.Item>
                                    <div className="answer-container" >
                                        {cards[currentCardIndex]?.answerInfo.map((answer) => {
                                            const isSelectedAnswer = answers[cards[currentCardIndex]._id] === answer._id;
                                            const isCorrectAnswer = cards[currentCardIndex]?.checked && answer.isCorrect;
                                            const isWrongAnswer = cards[currentCardIndex]?.checked && answer.isWrong;

                                            return (
                                                <Button
                                                    key={answer._id}
                                                    type={isSelectedAnswer ? "primary" : "default"}
                                                    className={`answer-setting
                                                    ${isCorrectAnswer ? "correct-answer" : ""} 
                                                    ${isWrongAnswer ? "wrong-answer" : ""} 
                                                    ${!cards[currentCardIndex]?.checked && isSelectedAnswer ? "selected-answer" : ""}`}
                                                    onClick={() => {
                                                        handleAnswerToggle(cards[currentCardIndex]._id, answer._id);
                                                        { course.price === 0 && speakQuestion(answer.name); }
                                                    }}
                                                >

                                                    {course.price === 0 &&
                                                        <div className="answer-content">
                                                            <div className="answer-text">{answer.description}</div>

                                                            <img style={{ width: '120px', height: '100px' }} src={answer.imageUrl} alt={answer.name} className="answer-image" />
                                                        </div>
                                                    }
                                                    {course.price > 0 &&
                                                        <div className="answer-content">
                                                            <div className="answer-text">{answer.description}</div>
                                                        </div>
                                                    }
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Nếu câu hỏi có type là 'word_order' */}
                            {cards[currentCardIndex]?.type === "word_order" && (
                                <>
                                    <div style={{ marginBottom: "16px", marginTop: "-50px" }}>
                                        <div style={{ display: "flex", alignItems: "baseline" }}>
                                            <Paragraph className="question-paragraph" ellipsis={false}>
                                                {cards[currentCardIndex]?.questionDescription || "Không có nội dung"}
                                            </Paragraph>
                                            <SoundOutlined
                                                onClick={() => speakQuestion(cards[currentCardIndex]?.translation)}
                                                style={{ fontSize: "20px", cursor: "pointer" }}
                                            />
                                        </div>
                                    </div>
                                    <Form.Item
                                        name={cards[currentCardIndex]?.translation}
                                        hidden>

                                    </Form.Item>
                                    <div>
                                        {/* Description của câu hỏi */}
                                        <div style={{ marginBottom: "16px" }}>
                                            <Paragraph className="word-order-description">
                                                {cards[currentCardIndex]?.description}
                                            </Paragraph>
                                        </div>

                                        {/* Khung trống để sắp xếp từ */}
                                        <div
                                            style={{
                                                border: "2px dashed #ccc",
                                                padding: "20px",
                                                marginBottom: "50px",
                                                minHeight: "50px",
                                                display: "flex",
                                                gap: "8px",
                                                flexWrap: "wrap",
                                            }}
                                            onDrop={(e) => handleDrop(e)}
                                            onDragOver={(e) => handleDragOver(e)} // Cho phép kéo thả vào đây
                                        >
                                            {sortedWords.map((word, index) => (
                                                <div
                                                    key={index}
                                                    className="sorted-word"
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#c0e4ff",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                    }}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, word, "sortedWords")}
                                                    onDrop={(e) => handleReorder(e, index)} // Thay đổi vị trí
                                                    onDragOver={(e) => handleDragOver(e)}
                                                >
                                                    {word}
                                                </div>
                                            ))}
                                        </div>


                                        {/* Các tag chứa wordBank xáo trộn */}
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                                            {shuffledWordBank.map((word, index) => (
                                                <div
                                                    key={index}
                                                    className="word-tag"
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#f0f0f0",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        userSelect: "none",
                                                    }}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, word, "wordBank")}
                                                >
                                                    {word}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Nút kiểm tra */}
                            <div style={{ marginTop: "16px", textAlign: "center" }}>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        if (!isChecked) {
                                            handleCheckAnswer(); // Kiểm tra nếu chưa kiểm tra
                                        } else {
                                            handleNextCard(); // Chuyển câu tiếp theo
                                        }
                                    }}
                                >
                                    {isChecked ? "Tiếp tục" : "Kiểm tra"}
                                </Button>
                            </div>

                            {/* Chỉ báo thẻ */}
                            <span className="page-indicator" style={{ display: "block", textAlign: "center", marginTop: "16px" }}>
                                Thẻ {currentCardIndex + 1} / {cards.length}
                            </span>
                        </div>

                    )}


                    {/* Phần đánh giá */}
                    <div style={{ margin: '30px auto auto 80px' }}>
                        <Typography.Title level={2}>Phản hồi của học viên</Typography.Title>
                        <div>
                            {ratings.map((rating) => (
                                <div key={rating.stars} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                                    <Rate
                                        disabled
                                        value={rating.stars}
                                        style={{ fontSize: 16, marginRight: 10 }}
                                    />
                                    <Progress
                                        percent={rating.percentage}
                                        showInfo={false}
                                        strokeColor="#fadb14"
                                        style={{
                                            flex: 1,
                                            margin: '0 10px',
                                            maxWidth: '500px',  // Giới hạn chiều rộng tối đa của progress bar
                                        }}
                                    />
                                    <Typography.Text type="secondary">
                                        {rating.percentage} %
                                    </Typography.Text>
                                </div>
                            ))}
                        </div>
                        {/* Bộ lọc đánh giá */}
                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Typography.Text strong> Lọc theo sao: </Typography.Text>
                            <Select
                                value={selectedRating}
                                onChange={handleFilterChange}
                                placeholder="Chọn số sao"
                                style={{ width: '200px', marginLeft: '10px' }}
                            >
                                <Option value={null}>Tất cả</Option>
                                {ratings.map((rating) => (
                                    <Option key={rating.stars} value={rating.stars}>
                                        {rating.stars} sao
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        {/* <Typography.Text strong>Tổng số lượt đánh giá: {totalReviews}</Typography.Text> */}
                        {reviewLoading ? (
                            <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />
                        ) : noReviewsFound ? (
                            <Typography.Text type="danger" style={{ textAlign: 'center', display: 'block', marginTop: '20px' }}>
                                Không tìm thấy đánh giá cho mức sao này.
                            </Typography.Text>
                        ) : (
                            <List
                                styles={{ marginLeft: '40px' }}
                                dataSource={filteredReviews}
                                renderItem={(review) => (
                                    <List.Item>
                                        <Space direction="vertical">
                                            <Typography.Text strong>{review.username}</Typography.Text>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Rate
                                                    disabled
                                                    value={review.rating}
                                                    style={{ marginRight: 10, fontSize: 14 }}
                                                />
                                                <Typography.Text type="secondary">
                                                    {review.createdAt}
                                                </Typography.Text>
                                            </div>
                                            <Typography.Text>{review.content}</Typography.Text>
                                            <Space>
                                                {likedReviewIds.includes(review._id) ? (
                                                    <LikeFilled onClick={() => handleRemoveReaction(review._id, 'like')} style={{ color: 'blue', cursor: 'pointer' }} />
                                                ) : (
                                                    <LikeOutlined onClick={() => handleLike(review._id)} style={{ color: 'gray', cursor: 'pointer' }} />
                                                )}
                                                {dislikedReviewIds.includes(review._id) ? (
                                                    <DislikeFilled onClick={() => handleRemoveReaction(review._id, 'dislike')} style={{ color: 'red', cursor: 'pointer' }} />
                                                ) : (
                                                    <DislikeOutlined onClick={() => handleDislike(review._id)} style={{ color: 'gray', cursor: 'pointer' }} />
                                                )}
                                            </Space>
                                            {user.role === 'admin' && !review.adminResponse && (
                                                <Button style={{ left: '-17px' }} type="link" onClick={() => showFeedbackModal(review._id)}>
                                                    Phản hồi
                                                </Button>
                                            )}
                                            {review.adminResponse && (
                                                <>
                                                    {user.role === 'admin' && (
                                                        <Button style={{ left: '-17px' }} type="link" onClick={() => showFeedbackModal(review._id)}>
                                                            Chỉnh sửa
                                                        </Button>
                                                    )}
                                                    <Typography.Text style={{ paddingLeft: '20px', color: 'gray', borderLeft: '4px solid #d1d7dc' }}>
                                                        Phản hồi của Admin: {review.adminResponse}
                                                    </Typography.Text>
                                                </>
                                            )}
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        )}
                        <Pagination
                            style={{ marginTop: '20px', textAlign: 'center' }}
                            current={current}
                            pageSize={pageSize}
                            total={total}
                            onChange={(current, pageSize) => fetchReviews(current, pageSize, courseId)}
                        />
                    </div>
                    <Modal title="Phản hồi" visible={isModalVisible} onCancel={handleCancel} footer={[
                        <Button key="back" onClick={handleCancel}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleFeedbackSubmit}>
                            Submit
                        </Button>,
                    ]}>
                        <Input.TextArea
                            value={feedback}
                            onChange={handleFeedbackChange}
                            placeholder="Enter your feedback"
                        />
                    </Modal>
                </Col>

                {/* Phần chương và bài học */}
                <Col span={6}>
                    <Collapse onChange={handleChapterChange} defaultActiveKey={currentChapter?._id} style={{ padding: '0px' }}>
                        {chapters.map((chapter) => (
                            <Panel
                                style={{ backgroundColor: '#bfc5d1', fontFamily: 'revert-layer' }}
                                header={
                                    <Space>
                                        {chapter.name}
                                    </Space>
                                }
                                key={chapter._id}
                                disabled={!chapter.unlocked}
                                extra={!chapter.unlocked && (
                                    <Button
                                        style={{ color: 'red', height: '0px' }}
                                        type="link"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            Modal.confirm({
                                                title: 'Xác nhận mở khóa chương',
                                                content: `Bạn có chắc chắn muốn trả 4 token để mở khóa chương này? Bạn có ${user.tokens} token.`,
                                                okText: 'Xác nhận',
                                                cancelText: 'Hủy',
                                                onOk: async () => {
                                                    try {
                                                        const response = await unlockChapterApi(user._id, courseId, chapter._id);
                                                        console.log(response);
                                                        if (response.data.success) {
                                                            message.success(response.data.message);
                                                            user.tokens = response.data.tokensRemaining;
                                                            setChapters(prevChapters => prevChapters.map(ch =>
                                                                ch._id === chapter._id ? { ...ch, unlocked: true } : ch
                                                            ));
                                                        } else {
                                                            message.error(response.data.message);
                                                        }
                                                    } catch (error) {
                                                        message.error('Lỗi khi mở khóa chương');
                                                    }
                                                },
                                            });
                                        }}
                                    >
                                        <LockOutlined />
                                    </Button>
                                )}
                            >
                                <List
                                    style={{ backgroundColor: 'rgb(255 255 255)', padding: "10px" }}
                                    dataSource={chapterLessons[chapter._id] || []}
                                    renderItem={(lesson) => {
                                        const isCompleted = completedLessons.includes(lesson._id);

                                        return (
                                            <List.Item
                                                style={{
                                                    borderRadius: "0px",
                                                    cursor: chapter.unlocked ? 'pointer' : 'not-allowed',
                                                    opacity: chapter.unlocked ? 1 : 0.6,
                                                }}
                                                className={`lesson-item ${clickLesson === lesson._id ? "selected-lesson" : ""}`}
                                                onClick={() => chapter.unlocked && handleLessonClick(lesson)}
                                            >
                                                <Space>
                                                    {lesson.name}
                                                    {chapter.unlocked && isCompleted && (
                                                        <CheckCircleOutlined style={{ color: 'green' }} />
                                                    )}
                                                </Space>
                                            </List.Item>
                                        );
                                    }}
                                />
                            </Panel>
                        ))}
                    </Collapse>
                </Col>

                <Col span={24} style={{ textAlign: 'start', marginTop: '20px' }}>
                    <Button type="primary" onClick={handleBack}>Back</Button>
                </Col>
            </Row >
            <Footer />

        </>
    );
};
export default LearningPage;
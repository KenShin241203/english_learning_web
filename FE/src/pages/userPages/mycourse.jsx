import { Card, Col, Row, Spin, Rate, notification, Progress } from 'antd';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCourseApi } from '../../services/api.user.service';
import { AuthContext } from '../../components/context/auth.context';
import { checkUserHasAddedCourse } from '../../services/api.course.service';
import { getUserReviewApi } from '../../services/api.review.service';
import ReviewUpdateModal from '../../components/user/mycourse/update.review.modal';
import Footer from '../../components/user/layout/footer';
import { getCompletionPercetageApi } from '../../services/api.progress.service';
import Header from '../../components/user/layout/header';

const MyCoursePage = () => {
    const { Meta } = Card;
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null); // Giữ khóa học đã chọn để cập nhật
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserCourses();
    }, []);

    const fetchUserCourses = async () => {
        try {
            const res = await getUserCourseApi(user._id);

            if (res.data) {
                const coursesWithProgress = await Promise.all(
                    res.data.courseInfo.map(async (course) => {
                        const rateRes = await getUserReviewApi(user._id, course._id);
                        const userRating = rateRes.data.review ? rateRes.data.review.rating : 0;

                        const completionRes = await getCompletionPercetageApi(user._id, course._id);
                        const completionPercentage = completionRes.data.completionPercentage || 0;

                        return {
                            ...course,
                            userRating,
                            completionPercentage,
                            ratingLabel: 'Xếp hạng của bạn',
                        };
                    })
                );
                setCourses(coursesWithProgress);
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to fetch courses. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRatingUpdate = async (newRating) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course._id === selectedCourse._id ? { ...course, userRating: newRating } : course
            )
        );

        setIsModalUpdateOpen(false);
        await fetchUserCourses();
    };

    const handleReviewClick = (event, course) => {
        event.stopPropagation();
        if (user._id) {
            setSelectedCourse(course);
            setIsModalUpdateOpen(true);
        } else {
            notification.error({
                message: 'Error',
                description: 'You need to log in to rate',
            });
        }
    };

    const handleCardClick = async (courseId) => {
        const userId = user._id;
        const res = await checkUserHasAddedCourse(courseId, userId);
        if (res.data.enrolled) {
            navigate(`/course/${courseId}/learning`, { state: { from: window.location.pathname } });
        } else {
            navigate(`/course/detail/${courseId}`);
        }
    };

    const handleMouseEnter = (courseId) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course._id === courseId ? { ...course, ratingLabel: 'Chỉnh sửa xếp hạng của bạn' } : course
            )
        );
    };

    const handleMouseLeave = (courseId) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course._id === courseId ? { ...course, ratingLabel: 'Xếp hạng của bạn' } : course
            )
        );
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '200px' }} />;
    }

    const inProgressCourses = courses.filter(course => course.completionPercentage < 100);
    const completedCourses = courses.filter(course => course.completionPercentage === 100);

    return (
        <>
            <Header />
            <div style={{ justifyItems: 'center', marginTop: '200px', height: 'auto' }}>
                <div style={{ textAlign: 'center', margin: '50px 0 -60px 100px', width: '100%', justifyItems: 'start' }}>
                    <h2 className="title-course">Khoá học của bạn</h2>
                </div>
                <div className="card-container">
                    {inProgressCourses.length > 0 ? (
                        <Row gutter={[16, 16]} justify="center">
                            {inProgressCourses.map((course) => (
                                <Col key={course._id} xs={12} sm={12} md={8} lg={6} className="col-centered">
                                    <Card
                                        onClick={() => handleCardClick(course._id)}
                                        hoverable
                                        cover={
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
                                                style={{ borderRadius: '8px', height: '160px', objectFit: 'cover' }}
                                            />
                                        }
                                        style={{ width: 300, height: 'auto' }}
                                    >
                                        <Meta title={course.name} description={course.description} />
                                        <br />
                                        <Rate
                                            allowHalf
                                            value={course.userRating || 0}
                                            style={{ marginBottom: '10px' }}
                                        />
                                        <p
                                            onClick={(event) => handleReviewClick(event, course)}
                                            onMouseEnter={() => handleMouseEnter(course._id)}
                                            onMouseLeave={() => handleMouseLeave(course._id)}
                                            className="rating-label"
                                        >
                                            {course.ratingLabel}
                                        </p>
                                        <Progress
                                            percent={course.completionPercentage}
                                            status={course.completionPercentage === 100 ? 'success' : 'active'}
                                            style={{ marginTop: '10px' }}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '20px' }}>
                            Bạn chưa tham gia khoá học nào
                        </div>
                    )}

                    {completedCourses.length > 0 ? (
                        <>
                            <div style={{ textAlign: 'center', margin: '50px 0 -60px 100px', width: '100%', justifyItems: 'start' }}>
                                <h2 className="title-course">các khoá học đã hoàn thành</h2>
                            </div>
                            <Row gutter={[16, 16]} justify="center">
                                {completedCourses.map((course) => (
                                    <Col key={course._id} xs={12} sm={12} md={8} lg={6} className="col-centered">
                                        <Card
                                            onClick={() => handleCardClick(course._id)}
                                            hoverable
                                            cover={
                                                <img
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
                                                    style={{ borderRadius: '8px', height: '160px', objectFit: 'cover' }}
                                                />
                                            }
                                            style={{ width: 300, height: 'auto' }}
                                        >
                                            <Meta title={course.name} description={course.description} />
                                            <br />
                                            <Rate
                                                allowHalf
                                                value={course.userRating || 0}
                                                style={{ marginBottom: '10px' }}
                                            />
                                            <p
                                                onClick={(event) => handleReviewClick(event, course)}
                                                onMouseEnter={() => handleMouseEnter(course._id)}
                                                onMouseLeave={() => handleMouseLeave(course._id)}
                                                className="rating-label"
                                            >
                                                {course.ratingLabel}
                                            </p>
                                            <Progress
                                                percent={course.completionPercentage}
                                                status={course.completionPercentage === 100 ? 'success' : 'active'}
                                                style={{ marginTop: '10px' }}
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    ) : null}
                </div>

                {selectedCourse && (
                    <ReviewUpdateModal
                        visible={isModalUpdateOpen}
                        onClose={() => setIsModalUpdateOpen(false)}
                        courseId={selectedCourse._id}
                        onRatingUpdate={handleRatingUpdate}
                    />
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyCoursePage;
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Rate, Collapse, Spin, Button, Row, Col, List,
    notification, Typography, Space, Pagination, Select, Progress,
    Modal, Radio
} from 'antd';
import { addUserToCourse, fetchCourseById } from '../../services/api.course.service';
import { fetchChapterWithLessAndTest } from '../../services/api.chapter.service';
import { useNavigate } from 'react-router-dom';
import ReviewUpdateModal from '../../components/user/mycourse/update.review.modal';
import { getUserReviewApi, fetchReviewsOfCourseApi } from '../../services/api.review.service';
import { AuthContext } from '../../components/context/auth.context';
import './course.detail.css'
import Footer from '../../components/user/layout/footer';
import { createPayment } from '../../services/api.order.service';
import MomoIcon from '../../../public/MoMo_Logo.png';
import ZaloPayIcon from '../../../public/zalopay-logo.png';
const { Panel } = Collapse;
const { Option } = Select;

const CourseDetail = () => {
    const { Text } = Typography;
    const { courseId } = useParams();
    const [courseRating, setCourseRating] = useState("");
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState("");
    const [chapterLessons, setChapterLessons] = useState({});
    const [loading, setLoading] = useState(true);
    const [ratingLabel, setRatingLabel] = useState('Xếp hạng của bạn');
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [ratings, setRatings] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [filteredReviews, setFilteredReviews] = useState(reviews);
    const [noReviewsFound, setNoReviewsFound] = useState(false);
    const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        const res = await fetchCourseById(courseId, { populate: 'lessonInfo' });
        if (res.data) {
            setCourse(res.data);
        }
        setCourseRating(res.data.totalStar);
        await fetchReviews();
        setLoading(false);
    };


    const fetchReviews = async () => {
        setReviewLoading(true);
        try {
            const res = await fetchReviewsOfCourseApi(current, pageSize, courseId);
            if (res.data) {
                setReviews(res.data.reviews);
                setRatings(res.data.ratings);
                setCurrent(res.meta.currentPage);
                setPageSize(res.meta.pageSize);
                setTotal(res.meta.totalEntity);
                setFilteredReviews(res.data.reviews);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách review:", error);
        }
        setReviewLoading(false);
    };

    const handleChapterChange = async (activeKeys) => {
        for (const chapterId of activeKeys) {
            if (!chapterLessons[chapterId]) {
                try {
                    const res = await fetchChapterWithLessAndTest(chapterId);
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
    };

    const handleRatingUpdate = () => {
        fetchCourseDetails();
        setIsModalUpdateOpen(false);
    };

    const handleOnClickJoin = async () => {
        if (!user._id) {
            navigate('/login');
            return;
        }
        await addUserToCourse(user._id, courseId);
        navigate(`/course/${courseId}/learning`);
    };

    const showPurchaseModal = () => {
        setIsPurchaseModalVisible(true);
    };

    const handlePaymentMethodChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    };

    const handlePurchaseClick = () => {
        if (selectedPaymentMethod === 'momo') {
            handlePurchase();
            setIsPurchaseModalVisible(false);
        }
    };

    const handlePurchase = async () => {
        try {
            const response = await createPayment(user._id, courseId, course.price);
            if (response.data.payUrl) {
                window.location.href = response.data.payUrl;
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
        }
    };

    // const handleMouseEnter = () => {
    //     setRatingLabel('Chỉnh sửa xếp hạng của bạn');
    // };

    // const handleMouseLeave = () => {
    //     setRatingLabel('Xếp hạng của bạn');
    // };

    const handleReviewClick = () => {
        if (user._id) {
            setIsModalUpdateOpen(true);
        } else {
            notification.error({
                message: "Error",
                description: "You need to log in to rate"
            });
        }
    };

    const handleFilterChange = (value) => {
        setSelectedRating(value);
        if (value) {
            const filtered = reviews.filter((review) => review.rating === value);
            setFilteredReviews(filtered);
            setNoReviewsFound(filtered.length === 0);
        } else {
            setFilteredReviews(reviews);
            setNoReviewsFound(false);
        }
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;
    }

    if (!course) {
        return <div>No course data available</div>;
    }

    return (
        <>
            <div className="course-detail-container">
                <Row gutter={[20, 20]}>
                    <Col xs={24} md={5} className="left-column">
                        <img
                            alt={course.title}
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar} ` || 'default_image_url'}
                            className="course-image"
                        />
                        <h2 className="course-title">{course.name}</h2>
                        <Rate allowHalf disabled defaultValue={courseRating || 0} style={{ marginBottom: '10px' }} />
                        {
                            course.price === 0 ?
                                <Button onClick={handleOnClickJoin} type="primary" size="large" className="join-button">
                                    Tham gia khoá học
                                </Button>
                                :
                                <div>
                                    <Text style={{ display: 'block', marginTop: '4px', fontWeight: 'bold', color: course.price > 0 ? '#fa541c' : '#52c41a' }}>
                                        {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} VND`}
                                    </Text>
                                    <Button onClick={showPurchaseModal} type="primary" size="large" className="join-button">
                                        Mua khoá học
                                    </Button>
                                </div>
                        }
                    </Col>

                    <Col xs={24} md={3}></Col>
                    <Col xs={24} md={16} className="right-column">
                        <h2 className="course-title">Mô tả khoá học</h2>
                        <p className="course-description">
                            {course.description || 'This is a placeholder description for the course.'}
                        </p>
                        <h3 className="chapter-title">Danh sách chương:</h3>
                        <Collapse onChange={handleChapterChange} style={{ backgroundColor: 'rgb(200 193 193)' }}>
                            {Array.isArray(course.chapterInfo) && course.chapterInfo.map((chapter) => (
                                <Panel header={chapter.name} key={chapter._id} style={{ color: 'rgb(255 253 253)' }}>
                                    <List
                                        dataSource={chapterLessons[chapter._id] || []}
                                        renderItem={(lesson) => (
                                            <List.Item className="lesson-list-item">
                                                <div><strong>{lesson.name}</strong></div>
                                            </List.Item>
                                        )}
                                        bordered
                                    />
                                </Panel>
                            ))}
                        </Collapse>
                        <div className="requirements-section">
                            <h3 className="requirements-title">Yêu cầu</h3>
                            <p className="requirements-description">
                                Để học khoá học này, bạn cần là người đã có kiến thức cơ bản về lập trình,
                                yêu thích công nghệ, và muốn nâng cao kỹ năng của mình trong lĩnh vực này.
                                Một máy tính có kết nối Internet là bắt buộc để thực hành các bài học.
                            </p>
                        </div>
                        <div style={{ margin: '30px auto auto 15px' }}>
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
                                                maxWidth: '500px',
                                            }}
                                        />
                                        <Typography.Text type="secondary">
                                            {rating.percentage} %
                                        </Typography.Text>
                                    </div>
                                ))}
                            </div>
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
                                        <List.Item >
                                            <Space direction="vertical">
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography.Text strong>{review.username}</Typography.Text>
                                                    <Rate
                                                        disabled
                                                        value={review.rating}
                                                        style={{ marginLeft: 10, fontSize: 14 }}
                                                    />
                                                </div>
                                                <Typography.Text>{review.content}</Typography.Text>
                                                <Typography.Text type="secondary">
                                                    {review.createdAt}
                                                </Typography.Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            )}
                            <Pagination
                                style={{ marginTop: '20px', textAlign: 'center', }}
                                current={current}
                                pageSize={pageSize}
                                total={total}
                                onChange={(current, pageSize) => fetchReviews(current, pageSize, courseId)}
                            />
                        </div>
                    </Col>
                </Row>
                <Modal
                    title="Xác nhận lại thông tin"
                    visible={isPurchaseModalVisible}
                    onCancel={() => setIsPurchaseModalVisible(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setIsPurchaseModalVisible(false)}>
                            Hủy
                        </Button>,
                        <Button key="submit" type="primary" onClick={handlePurchaseClick}>
                            Thanh toán
                        </Button>,
                    ]}
                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                    bodyStyle={{ padding: '20px', background: '#f0f2f5' }}
                    titleStyle={{ backgroundColor: '#1890ff', color: '#fff', padding: '10px 20px' }}
                    footerStyle={{ backgroundColor: '#f0f2f5', borderTop: '1px solid #e8e8e8' }}
                >
                    {course ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }} >
                                <img src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`} alt={course.name} style={{ width: '150px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div style={{ marginLeft: '10px' }}>
                                    <h3 style={{ margin: 0 }}>Thông tin khoá học</h3>
                                    <h4 style={{ margin: '5px 0' }}>Tên: {course.name}</h4>
                                    <h4 style={{ margin: '5px 0' }}>Giá tiền: {course.price.toLocaleString()} VND</h4>
                                </div>
                            </div>
                            <h3 style={{ marginBottom: '15px' }}>Chọn phương thức thanh toán</h3>
                            <Radio.Group onChange={handlePaymentMethodChange} style={{ display: 'flex', flexDirection: 'column' }}>
                                <Radio value="momo" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <img src={MomoIcon} alt="Momo" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                                    MoMo
                                </Radio>
                                <Radio value="zalopay" style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={ZaloPayIcon} alt="ZaloPay" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                                    ZaloPay
                                </Radio>
                            </Radio.Group>
                        </>
                    ) : (
                        <p>Không có dữ liệu</p>
                    )}
                </Modal>
            </div>

            <Footer />
        </>
    );
};

export default CourseDetail;
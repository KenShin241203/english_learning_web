import { Card, Col, Row, Rate, Spin, Tag, Typography, Switch, Button, Popover } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons'; // Biểu tượng bánh răng
import { useState, useEffect, useContext } from 'react';
import { checkUserHasAddedCourse, fetchAllCourseApi, fetchCourseById } from '../../services/api.course.service';
import { useNavigate } from 'react-router-dom';
import Slide from '../../components/user/layout/slide';
import { AuthContext } from '../../components/context/auth.context';
import Footer from '../../components/user/layout/footer';
import './home.css'
import Header from '../../components/user/layout/header';
const MainPage = () => {
    const [loading, setLoading] = useState(true);
    const [dataCourseFree, setDataCourseFree] = useState([]);
    const [dataCoursePaid, setDataCoursePaid] = useState([]);
    const { Title, Text } = Typography;
    const { Meta } = Card;
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [darkMode, setDarkMode] = useState(false); // Trạng thái Dark Mode
    const [currentIndexFree, setCurrentIndexFree] = useState(0);
    const [currentIndexPaid, setCurrentIndexPaid] = useState(0);
    useEffect(() => {
        loadCourse();
    }, []);

    const loadCourse = async () => {
        const res = await fetchAllCourseApi();
        if (res.data) {
            const freeCourses = res.data.result.filter((course) => course.price === 0);
            const paidCourses = res.data.result.filter((course) => course.price > 0);

            setDataCourseFree(freeCourses);
            setDataCoursePaid(paidCourses);
        }
        setLoading(false);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode', !darkMode); // Cập nhật class cho body
    };

    const content = (
        <div>
            <p>Chế độ màu</p>
            <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                checkedChildren="Dark"
                unCheckedChildren="Light"
            />
        </div>
    );
    const handleCardClick = async (courseId) => {
        const userId = user._id;
        if (!userId) {
            const res = await fetchCourseById(courseId);
            if (res) navigate(`/course/detail/${courseId}`);
        }
        const res = await checkUserHasAddedCourse(courseId, userId);
        if (res.data.enrolled) {
            navigate(`course/${courseId}/learning`, { state: { from: window.location.pathname } });
        } else {
            navigate(`/course/detail/${courseId}`);
        }
    };

    // Function to handle next click for courseFree
    const handleNextFree = () => {
        if (currentIndexFree < dataCourseFree.length - 1) {
            setCurrentIndexFree(currentIndexFree + 1);
        }
    };

    // Function to handle previous click for courseFree
    const handlePrevFree = () => {
        if (currentIndexFree > 0) {
            setCurrentIndexFree(currentIndexFree - 1);
        }
    };

    // Function to handle next click for coursePaid
    const handleNextPaid = () => {
        if (currentIndexPaid < dataCoursePaid.length - 1) {
            setCurrentIndexPaid(currentIndexPaid + 1);
        }
    };

    // Function to handle previous click for coursePaid
    const handlePrevPaid = () => {
        if (currentIndexPaid > 0) {
            setCurrentIndexPaid(currentIndexPaid - 1);
        }
    };


    if (loading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '200px' }} />;
    }

    return (
        <>
            <Header />
            <Slide />
            <div style={{ justifyItems: 'center' }}>
                {/* Danh sách khóa học miễn phí */}
                <div className="card-container">
                    <div className="title-container">
                        <Title level={2} className="title-course">Khóa Học Miễn Phí</Title>
                        <Tag color="magenta" className="title-label" style={{ right: '-270px', top: '-60px' }}>PHỔ BIẾN</Tag>
                    </div>
                    <div className="card-slider">
                        <Button className="arrow-btn left" onClick={handlePrevFree}>
                            <LeftOutlined />
                        </Button>
                        <Row gutter={[24, 24]} justify="center" className="card-row">
                            {dataCourseFree.slice(currentIndexFree, currentIndexFree + 4).map((course, index) => (
                                <Col key={index} xs={24} sm={12} md={8} lg={6} className="col-centered">
                                    <Card
                                        onClick={() => handleCardClick(course._id)}
                                        hoverable
                                        cover={
                                            <img
                                                alt={course.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
                                                style={{ borderRadius: '8px', height: '160px', objectFit: 'cover' }}
                                            />
                                        }
                                        className="course-card"
                                    >
                                        <Meta
                                            title={<Text strong style={{ fontSize: '16px' }}>{course.name}</Text>}
                                            description={<Text type="secondary">{course.shortDescription}</Text>}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                            <Rate disabled allowHalf defaultValue={course.totalStar || 0} style={{ fontSize: '14px' }} />
                                            <Text>({course.totalStudent || 0}) học viên</Text>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <Button className="arrow-btn right" onClick={handleNextFree}>
                            <RightOutlined />
                        </Button>
                    </div>
                </div>
                <div className="card-container">
                    <div className="title-container">
                        <Title level={2} className="title-course">Khóa Học Trả Phí</Title>
                        <Tag color="green" className="title-label" style={{ right: '-270px', top: '-60px' }}>MỚI</Tag>
                    </div>
                    <div className="card-slider">
                        <Button className="arrow-btn left" onClick={handlePrevPaid}>
                            <LeftOutlined />
                        </Button>
                        <Row gutter={[24, 24]} justify="center" className="card-row">
                            {dataCoursePaid.slice(currentIndexPaid, currentIndexPaid + 4).map((course, index) => (
                                <Col key={index} xs={24} sm={12} md={8} lg={6} className="col-centered">
                                    <Card
                                        onClick={() => handleCardClick(course._id)}
                                        hoverable
                                        cover={
                                            <img
                                                alt={course.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
                                                style={{ borderRadius: '8px', height: '160px', objectFit: 'cover' }}
                                            />
                                        }
                                        className="course-card"
                                        style={{ width: '300px', height: '300px' }}
                                    >
                                        <Meta
                                            title={<Text strong style={{ fontSize: '16px' }}>{course.name}</Text>}
                                            description={<Text type="secondary">{course.shortDescription}</Text>}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Rate disabled allowHalf defaultValue={course.totalStar || 0} style={{ fontSize: '14px' }} />
                                            <Text>({course.totalStudent || 0}) học viên</Text>
                                        </div>
                                        <Text style={{ display: 'block', marginTop: '4px', fontWeight: 'bold', color: course.price > 0 ? '#fa541c' : '#52c41a' }}>
                                            {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} VND`}
                                        </Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <Button className="arrow-btn right" onClick={handleNextPaid}>
                            <RightOutlined />
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MainPage;

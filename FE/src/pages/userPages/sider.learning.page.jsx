import React, { useContext, useEffect, useState } from 'react';
import { Progress, notification, Dropdown, Menu } from 'antd';
import { AuthContext } from '../../components/context/auth.context';
import { getTotalLessonCompletedApi } from '../../services/api.progress.service';
import { TrophyOutlined, DownOutlined, LeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCoins } from 'react-icons/fa'; // Import FaCoins icon
import './sider.learning.page.css';

const HeaderLearningPage = () => {
    const { user } = useContext(AuthContext);
    const { courseId } = useParams();
    const [courseProgress, setCourseProgress] = useState(0);
    const [completedLessons, setCompletedLessons] = useState(0);
    const [totalLessons, setTotalLessons] = useState(0);
    const previousPage = location.state?.from || '/';
    const navigate = useNavigate();

    useEffect(() => {
        fetchLessonData();
    }, [courseId]);

    const fetchLessonData = async () => {
        try {
            const res = await getTotalLessonCompletedApi(user._id, courseId);
            setCompletedLessons(res.data.totalLessonCompleted.completedLessons);
            setTotalLessons(res.data.totalLessonCompleted.totalLessons);

            if (res.data.totalLessonCompleted.totalLessons > 0) {
                const progressPercent = Math.round((res.data.totalLessonCompleted.completedLessons / res.data.totalLessonCompleted.totalLessons) * 100);
                setCourseProgress(progressPercent);
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to fetch lesson data. Please try again later.',
            });
        }
    }

    const handleBack = () => navigate(previousPage);
    const menu = (
        <Menu>
            <Menu.Item>
                Bạn đã hoàn thành {completedLessons} / {totalLessons} tổng số bài học
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="header-learning-page">
            <div className="back-icon-container">
                <LeftOutlined className="back-icon" onClick={handleBack} />
            </div>
            <div className="progress-container">
                <div className="token-points">
                    <FaCoins style={{ fontFamily: 'monospace' }} /> Token Points: {user.tokens}
                </div>
                <Progress
                    trailColor='#f0f0f0'
                    type="circle"
                    percent={courseProgress}
                    width={60}
                    format={() => <TrophyOutlined className="trophy-icon" />}
                />
                <Dropdown overlay={menu} trigger={['click']}>
                    <span className="progress-text">
                        Tiến độ của bạn <DownOutlined />
                    </span>
                </Dropdown>
            </div>
        </div>
    );
};

export default HeaderLearningPage;
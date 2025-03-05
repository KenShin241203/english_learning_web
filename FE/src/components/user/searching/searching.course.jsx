import { Input, Dropdown, Menu, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import searchingApi from '../../../services/api.searching.service';
import { AuthContext } from '../../context/auth.context';
import '../layout/css/header.css'
const SearchComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const { user } = useContext(AuthContext)
    const navigate = useNavigate();

    // Hàm xử lý tìm kiếm khi nhập chữ vào input
    const handleSearch = async (term) => {
        if (!term) {
            setSearchResults([]);
            setDropdownVisible(false);
            return;
        }

        try {
            // Check if user is logged in before passing userId
            const userId = user?._id || null;
            const { data } = await searchingApi(term, userId);
            setSearchResults(data);
            setDropdownVisible(true);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    // Hàm xử lý thay đổi input
    const handleChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);  // Cập nhật giá trị tìm kiếm
        handleSearch(term);  // Gọi hàm tìm kiếm mỗi khi thay đổi
    };

    // Hàm xử lý khi nhấn Enter hoặc chọn khóa học
    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            handleSearch(searchTerm);
        }
    };
    const handleSelect = async (course) => {
        if (!user || !user._id) {
            // If user is not logged in, navigate to course detail page
            navigate(`/course/detail/${course._id}`);
            return;
        }
        if (course.isEnrolled) {
            navigate(`course/${course._id}/learning`, { state: { from: window.location.pathname } });
        } else {
            navigate(`/course/detail/${course._id}`);
        }
    };

    return (
        <Dropdown
            overlay={
                <Menu style={{ marginTop: '10px' }}>
                    {searchResults.length > 0 ? (
                        searchResults.map(course => (
                            <Menu.Item key={course._id} onClick={() => handleSelect(course)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Avatar size={35} style={{ marginTop: '17px', position: 'cover' }}
                                        src={<img src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`} alt="avatar" />} />
                                    <span style={{ marginTop: '10px' }}>{course.name}</span>

                                </div>
                            </Menu.Item>
                        ))
                    ) : (
                        searchTerm && (
                            <Menu.Item disabled>Không có kết quả cho `{searchTerm}`</Menu.Item>
                        )
                    )}
                </Menu>
            }
            visible={isDropdownVisible}
            onVisibleChange={(visible) => setDropdownVisible(visible)}
        >
            <Input
                value={searchTerm}
                onChange={handleChange}
                onKeyDown={handleEnterKey}  // Bắt sự kiện Enter
                placeholder="Tìm kiếm khóa học"
                style={{
                    width: 350,
                    borderRadius: '20px',
                    verticalAlign: 'middle',
                }}
                prefix={<SearchOutlined />}

            />
        </Dropdown>
    );
};

export default SearchComponent;

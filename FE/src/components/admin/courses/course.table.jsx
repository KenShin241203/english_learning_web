import { useState } from "react"
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Popconfirm, notification, Input, Row, Col } from 'antd';
import UpdateCourseModal from "./update.course";
import { deleteCourseApi } from "../../../services/api.course.service";
import DetailCourse from './view.course.detail'
const CourseTable = (props) => {
    const { dataCourse, loadCourse, current,
        pageSize, setCurrent, setPageSize, total } = props
    //data update
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false)
    const [dataUpdate, setDataUpdate] = useState(null)

    //detail data
    const [isDataDetailOpen, setIsDataDetailOpen] = useState(false)
    const [dataDetail, setDetailData] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = dataCourse.filter((course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    }
    const columns = [
        {
            title: 'Stt',
            render: (_, record, index) => {
                return (
                    <div>{(index + 1) + (current - 1) * pageSize}</div>
                )
            }
        },
        {
            title: 'Id',
            dataIndex: '_id',
            render: (_, record) => {
                return (
                    <a href="#"
                        onClick={() => {
                            setDetailData(record)
                            setIsDataDetailOpen(true)
                        }}>{record._id}</a>
                )
            }

        },
        {
            title: 'Course name',
            dataIndex: 'name',
            filters: [
                { text: 'A-M', value: 'A-M' },
                { text: 'N-Z', value: 'N-Z' },
            ],
            onFilter: (value, record) => {
                const firstChar = record.name[0].toUpperCase();
                if (value === 'A-M') {
                    return firstChar >= 'A' && firstChar <= 'M';
                } else if (value === 'N-Z') {
                    return firstChar >= 'N' && firstChar <= 'Z';
                }
                return false;
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Price',
            dataIndex: 'price',
            sorter: {
                compare: (a, b) => a.price - b.price,
                multiple: 4
            },
            render: (_, record) => {
                return (
                    <td>{formatCurrency(record.price)}</td>
                )
            }
        },
        {
            title: 'Total Time',
            dataIndex: 'totalTime',
        },
        {
            title: 'Total Chapter',
            dataIndex: 'totalChapter',
            sorter: {
                compare: (a, b) => a.totalChapter - b.totalChapter,
                multiple: 2
            }
        },
        {
            title: 'Total Student',
            dataIndex: 'totalStudent',
            sorter: {
                compare: (a, b) => a.totalStudent - b.totalStudent,
                multiple: 1
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: "flex", gap: "20px" }}>
                    <EditOutlined onClick={() => {
                        setDataUpdate(record)
                        setIsModalUpdateOpen(true)
                    }}
                        style={{ cursor: "pointer", color: "orange" }} />
                    <Popconfirm
                        title="Delete Course"
                        description="Are you sure to delete this course?"
                        onConfirm={() => handleDeleteCourse(record._id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left">
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                    </Popconfirm>

                    <EyeOutlined onClick={() => {
                        setDetailData(record)
                        setIsDataDetailOpen(true)
                    }} style={{ cursor: "pointer", color: "blue" }} />
                </div>
            ),
        },

    ];

    const handleDeleteCourse = async (id) => {
        const res = await deleteCourseApi(id);
        if (res.data) {
            notification.success({
                message: "Delete course",
                description: "Xóa course thành công"
            })
            await loadCourse();

        }
        else {
            notification.error({
                message: "Error delete course",
                description: JSON.stringify(res.message)
            })
        }
    }
    const onChange = (pagination, filters, sorter, extra) => {
        // setCurrent, setPageSize
        //nếu thay đổi trang : current
        if (pagination && pagination.current) {
            if (pagination.current !== current) {
                setCurrent(pagination.current)
            }
        }

        //nếu thay đổi tổng số phần tử : pageSize
        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== pageSize) {
                setPageSize(pagination.pageSize) //"5" => 5
            }
        }
        console.log(">>> check ", { pagination, filters, sorter, extra })
    };
    return (
        <>
            <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                <Col>
                    <h3>Table Course</h3>
                </Col>
                <Col>
                    <Input.Search
                        placeholder="Search course"
                        enterButton={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
            </Row>
            <Table columns={columns} dataSource={filteredData} rowKey={"_id"} pagination={
                {
                    current: current,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    total: total,
                    showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                }
            }
                onChange={onChange} />
            <UpdateCourseModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadCourse={loadCourse} />
            <DetailCourse
                isDataDetailOpen={isDataDetailOpen}
                setIsDataDetailOpen={setIsDataDetailOpen}
                dataDetail={dataDetail}
                setDetailData={setDetailData}
                loadCourse={loadCourse} />
        </>)
}

export default CourseTable
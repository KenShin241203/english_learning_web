import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Popconfirm, notification, Row, Col, Input } from 'antd';
import { useState } from 'react';
import UpdateLessonModal from './update.lesson.modal';
import DetailLesson from './view.lesson.detail';
import { deleteLessonApi } from '../../../services/api.lesson.service';

const LessonTable = (props) => {

    const { dataLesson, loadLesson,
        current, pageSize, total, setCurrent, setPageSize } = props
    //data update
    const [isDrawerUpdateOpen, setIsDrawerUpdateOpen] = useState(false)
    const [dataUpdate, setDataUpdate] = useState(null)

    //detail data
    const [isDataDetailOpen, setIsDataDetailOpen] = useState(false)
    const [dataDetail, setDetailData] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = dataLesson.filter((lesson) =>
        lesson.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
            title: 'Lesson Name',
            dataIndex: 'name',
        },
        {
            title: 'Total Question',
            dataIndex: 'totalQuestion',
            sorter: {
                compare: (a, b) => a.totalQuestion - b.totalQuestion
            }
        },
        {
            title: 'Chapter name',
            dataIndex: 'chapterName',
        },
        {
            title: 'Course name',
            dataIndex: 'courseName',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: "flex", gap: "20px" }}>
                    <EditOutlined onClick={() => {
                        setDataUpdate(record)
                        setIsDrawerUpdateOpen(true)
                    }}
                        style={{ cursor: "pointer", color: "orange" }} />
                    <Popconfirm
                        title="Delete lesson"
                        description="Are you sure to delete this lesson?"
                        onConfirm={() => handleDeleteLesson(record._id)}
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

    const handleDeleteLesson = async (id) => {
        const res = await deleteLessonApi(id);
        if (res.data) {
            notification.success({
                message: "Delete lesson",
                description: "Xóa lesson thành công"
            })
            await loadLesson();

        }
        else {
            notification.error({
                message: "Error delete lesson",
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
                    <h3>Table Chapter</h3>
                </Col>
                <Col>
                    <Input.Search
                        placeholder="Search lesson"
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
            <UpdateLessonModal
                isDrawerUpdateOpen={isDrawerUpdateOpen}
                setIsDrawerUpdateOpen={setIsDrawerUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadLesson={loadLesson} />
            <DetailLesson
                isDataDetailOpen={isDataDetailOpen}
                setIsDataDetailOpen={setIsDataDetailOpen}
                dataDetail={dataDetail}
                setDetailData={setDetailData} />
        </>
    )
}

export default LessonTable
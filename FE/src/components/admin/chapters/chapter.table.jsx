import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Popconfirm, notification, Row, Col, Input } from 'antd';
import { useState } from 'react';
import { deleteChapterByIdApi } from '../../../services/api.chapter.service';
import DetailChapter from './view.chapter.detail';
import UpdateChapterModal from './update.chapter';
const ChapterTable = (props) => {

    const { dataChapter, loadChapter,
        current, pageSize, total, setCurrent, setPageSize } = props
    //data update
    const [isDrawerUpdateOpen, setIsDrawerUpdateOpen] = useState(false)
    const [dataUpdate, setDataUpdate] = useState(null)

    //detail data
    const [isDataDetailOpen, setIsDataDetailOpen] = useState(false)
    const [dataDetail, setDetailData] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = dataChapter.filter((chapter) =>
        chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            title: 'Chapter Name',
            dataIndex: 'name',
        },
        {
            title: 'Total Lesson',
            dataIndex: 'totalLesson',
            sorter: {
                compare: (a, b) => a.totalLesson - b.totalLesson,
            }
        },
        {
            title: 'Total Test',
            dataIndex: 'totalTest',
            sorter: {
                compare: (a, b) => a.totalTest - b.totalTest,
            }
        },
        {
            title: 'Course',
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
                        title="Delete chapter"
                        description="Are you sure to delete this chapter?"
                        onConfirm={() => handleDeleteChapter(record._id)}
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

    const handleDeleteChapter = async (id) => {
        const res = await deleteChapterByIdApi(id);
        if (res.data) {
            notification.success({
                message: "Delete chapter",
                description: "Xóa chapter thành công"
            })
            await loadChapter();

        }
        else {
            notification.error({
                message: "Error delete chapter",
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
                        placeholder="Search chapter"
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
            <UpdateChapterModal
                isDrawerUpdateOpen={isDrawerUpdateOpen}
                setIsDrawerUpdateOpen={setIsDrawerUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadChapter={loadChapter} />
            <DetailChapter
                isDataDetailOpen={isDataDetailOpen}
                setIsDataDetailOpen={setIsDataDetailOpen}
                dataDetail={dataDetail}
                setDetailData={setDetailData} />
        </>
    )
}

export default ChapterTable
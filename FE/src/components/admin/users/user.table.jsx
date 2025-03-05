import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Popconfirm, notification, Input, Row, Col } from 'antd';
import { useState } from 'react';
import { deleteUserApi } from '../../../services/api.user.service';
import UpdateUserModal from './update.user.modal';
import DetailUser from './view.user.detail';
// import UpdateLessonModal from './update.lesson.modal';
// import DetailLesson from './view.lesson.detail';
// import { deleteLessonApi } from '../../services/api.lesson.service';

const UserTable = (props) => {

    const { dataUser, loadUser,
        current, pageSize, total, setCurrent, setPageSize } = props
    //data update
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false)
    const [dataUpdate, setDataUpdate] = useState(null)

    //detail data
    const [isDataDetailOpen, setIsDataDetailOpen] = useState(false)
    const [dataDetail, setDetailData] = useState(null)

    const [searchTerm, setSearchTerm] = useState("");
    const filteredData = dataUser.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <a href="#" onClick={() => {
                        setDetailData(record)
                        setIsDataDetailOpen(true)
                    }}>{record._id}</a>
                )
            }

        },
        {
            title: 'Username',
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
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
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
                        title="Delete lesson"
                        description="Are you sure to delete this lesson?"
                        onConfirm={() => handleDeleteUser(record._id)}
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

    const handleDeleteUser = async (id) => {
        const res = await deleteUserApi(id);
        if (res.data) {
            notification.success({
                message: "Delete user",
                description: "Delete user successfully"
            })
            await loadUser();

        }
        else {
            notification.error({
                message: "Error delete user",
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
            <Row align="middle" style={{ marginBottom: '16px' }}>
                <Col>
                    <Input.Search
                        placeholder="Search username"
                        enterButton={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey={'_id'}
                pagination={{
                    current: current,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    total: total,
                    showTotal: (total, range) => {
                        return (
                            <div>
                                {' '}
                                {range[0]}-{range[1]} trên {total} rows
                            </div>
                        );
                    },
                }}
                onChange={onChange}
            />
            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadUser={loadUser} />
            <DetailUser
                isDataDetailOpen={isDataDetailOpen}
                setIsDataDetailOpen={setIsDataDetailOpen}
                dataDetail={dataDetail}
                setDetailData={setDetailData}
                loadUser={loadUser} />
        </>
    )
}

export default UserTable
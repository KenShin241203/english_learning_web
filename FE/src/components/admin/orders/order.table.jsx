import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Table, Popconfirm, notification, Input, Row, Col } from 'antd';
const OrderTable = (props) => {
    const { dataOrder, loadOrder, current,
        pageSize, setCurrent, setPageSize, total } = props

    const [searchTerm, setSearchTerm] = useState("");
    const filteredData = dataOrder.filter((order) =>
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.courseName.toLowerCase().includes(searchTerm.toLowerCase())
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
            title: 'Order id',
            dataIndex: 'orderId',
            render: (_, record) => {
                return (
                    <a>{record.orderId}</a>
                )
            }

        },
        {
            title: 'Email',
            dataIndex: 'email',
            filters: [
                { text: 'A-M', value: 'A-M' },
                { text: 'N-Z', value: 'N-Z' },
            ],
            onFilter: (value, record) => {
                const firstChar = record.email[0].toUpperCase();
                if (value === 'A-M') {
                    return firstChar >= 'A' && firstChar <= 'M';
                } else if (value === 'N-Z') {
                    return firstChar >= 'N' && firstChar <= 'Z';
                }
                return false;
            },
            sorter: (a, b) => a.email.localeCompare(b.email),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Course Name',
            dataIndex: 'courseName',
            filters: [
                { text: 'A-M', value: 'A-M' },
                { text: 'N-Z', value: 'N-Z' },
            ],
            onFilter: (value, record) => {
                const firstChar = record.courseName[0].toUpperCase();
                if (value === 'A-M') {
                    return firstChar >= 'A' && firstChar <= 'M';
                } else if (value === 'N-Z') {
                    return firstChar >= 'N' && firstChar <= 'Z';
                }
                return false;
            },
            sorter: (a, b) => a.courseName.localeCompare(b.courseName),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            sorter: {
                compare: (a, b) => a.amount - b.amount,
            },
            render: (_, record) => {
                return (
                    <td>{formatCurrency(record.amount)}</td>
                )
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                let color;
                if (status === 'success') color = 'green';
                else if (status === 'pending') color = 'blue';
                else if (status === 'failed') color = 'red';

                return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: color,
                            }}
                        ></span>
                        {status}
                    </span>
                );
            },
        }
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: (_, record) => (
        //         <div style={{ display: "flex", gap: "20px" }}>
        //             <EditOutlined onClick={() => {
        //                 setDataUpdate(record)
        //                 setIsModalUpdateOpen(true)
        //             }}
        //                 style={{ cursor: "pointer", color: "orange" }} />
        //             <Popconfirm
        //                 title="Delete Course"
        //                 description="Are you sure to delete this course?"
        //                 onConfirm={() => handleDeleteCourse(record._id)}
        //                 okText="Yes"
        //                 cancelText="No"
        //                 placement="left">
        //                 <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
        //             </Popconfirm>

        //             <EyeOutlined onClick={() => {
        //                 setDetailData(record)
        //                 setIsDataDetailOpen(true)
        //             }} style={{ cursor: "pointer", color: "blue" }} />
        //         </div>
        //     ),
        // },

    ];

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
                    <h3>Table Order</h3>
                </Col>
                <Col>
                    <Input.Search
                        placeholder="Search order"
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
        </>
    )
}


export default OrderTable
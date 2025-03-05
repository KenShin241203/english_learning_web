import { useState } from "react"
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Popconfirm, notification, Input, Row, Col } from 'antd';
import UpdateTokenPackModal from "./update.tokenPack";
import { deleteTokenPackageApi } from "../../../services/api.tokenPackage.service";
// import DetailCourse from './view.course.detail'
const TokenPackTable = (props) => {
    const { dataTokenPack, loadTokenPack, current,
        pageSize, setCurrent, setPageSize, total } = props
    //data update
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false)
    const [dataUpdate, setDataUpdate] = useState(null)

    //detail data
    const [isDataDetailOpen, setIsDataDetailOpen] = useState(false)
    const [dataDetail, setDetailData] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = dataTokenPack.filter((tokenPack) =>
        tokenPack.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            title: 'Token Package name',
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
                multiple: 1
            },
            render: (_, record) => {
                return (
                    <td>{formatCurrency(record.price)}</td>
                )
            }
        },
        {
            title: 'Number of token',
            dataIndex: 'token',
            sorter: {
                compare: (a, b) => a.token - b.token,
                multiple: 2
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
                        title="Delete Token Package"
                        description="Are you sure to delete this token package?"
                        onConfirm={() => handleDeleteTokenPack(record._id)}
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

    const handleDeleteTokenPack = async (id) => {
        const res = await deleteTokenPackageApi(id);
        if (res.data) {
            notification.success({
                message: "Delete token package",
                description: "Xóa token package thành công"
            })
            await loadTokenPack();

        }
        else {
            notification.error({
                message: "Error delete token package",
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
                    <h3>Table Token Package</h3>
                </Col>
                <Col>
                    <Input.Search
                        placeholder="Search token package"
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
            <UpdateTokenPackModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadTokenPack={loadTokenPack} />
            {/* <DetailCourse
                isDataDetailOpen={isDataDetailOpen}
                setIsDataDetailOpen={setIsDataDetailOpen}
                dataDetail={dataDetail}
                setDetailData={setDetailData}
                loadCourse={loadCourse} /> */}
        </>)
}

export default TokenPackTable
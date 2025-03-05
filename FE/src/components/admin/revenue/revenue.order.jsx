import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/charts';
import { DatePicker, Spin } from 'antd';
import { getRenvenueOfCourses } from '../../../services/api.revenue.service';

const { RangePicker } = DatePicker;

const RevenueChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadStats = async (startDate, endDate) => {
        setLoading(true);
        try {
            const stats = await getRenvenueOfCourses(startDate, endDate);
            const sortedData = stats.sort((a, b) => a.totalRevenue - b.totalRevenue);
            setData(sortedData || []);
        } catch (error) {
            console.error('Failed to load revenue stats:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        loadStats(firstDayOfMonth.toISOString(), lastDayOfMonth.toISOString());
    }, []);

    const handleDateChange = (dates) => {
        if (dates) {
            const [start, end] = dates;
            loadStats(start.toISOString(), end.toISOString());
        }
    };

    const config = {
        data,
        xField: 'courseName',
        yField: 'totalRevenue',
        seriesField: 'courseName',
        color: '#3b82f6',
        columnWidthRatio: 0.8,
        label: {
            position: 'top',
            style: {
                fill: '#000',
                opacity: 0.8,
            },
        },
        xAxis: {
            label: {
                autoHide: false,
                autoRotate: true,
                style: {
                    fontSize: 12,
                },
            },
        },
        yAxis: {
            title: {
                text: 'Doanh thu (VND)',
                style: {
                    fontSize: 14,
                    fontWeight: 600,
                },
            },
            label: {
                formatter: (value) => `${value.toLocaleString('vi-VN')} VND`, // Format values to VND
            },
        },
        tooltip: {
            showMarkers: false,
            formatter: (datum) => {
                return {
                    name: datum.courseName,
                    value: `Số lượng bán: ${datum.totalOrders}`,
                };
            },
        },
        legend: {
            position: 'top',
        },
        interactions: [{ type: 'active-region' }],
    };

    return (
        <div>
            <h2>Biểu Đồ Doanh Thu Từ Các Khoá Học</h2>
            <RangePicker onChange={handleDateChange} style={{ marginBottom: 16 }} />
            {loading ? (
                <Spin size="large" />
            ) : data.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                    <Column {...config} />
                </div>
            ) : (
                <p>Không có dữ liệu để hiển thị</p>
            )}
        </div>
    );
};

export default RevenueChart;
import OrderTable from "../../components/admin/orders/order.table";
import { checkStatusTransactionApi, fetchAllOrderApi } from "../../services/api.order.service";
import { useState, useEffect } from "react";

const OrderPage = () => {

    const [dataOrder, setDataOrder] = useState([]);
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    useEffect(() => {
        loadOrder();
    }, [current, pageSize]);

    const loadOrder = async () => {
        try {
            const res = await fetchAllOrderApi(current, pageSize);

            if (res.data) {
                const orders = res.data.result;

                // Kiểm tra trạng thái từng order
                const updatedOrders = await Promise.all(
                    orders.map(async (order) => {
                        const result = await checkStatusTransactionApi(order.orderId);
                        console.log(result.data)
                        if (result.data.resultCode === 1005) {
                            order.status = 'failed';
                        }
                        return order;
                    })
                );

                // Cập nhật state
                setDataOrder(updatedOrders);
                setCurrent(res.data.meta.currentPage);
                setPageSize(res.data.meta.pageSize);
                setTotal(res.data.meta.totalEntity);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <OrderTable
                dataOrder={dataOrder}
                loadOrder={loadOrder}
                current={current}
                pageSize={pageSize}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                total={total} />

        </div>
    )
}

export default OrderPage
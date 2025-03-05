import axios from "./axios.customize";


const fetchAllOrderApi = (page, limit) => {
    const URL_BACKEND = `/v1/api/get-all-order?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND)
}

const checkStatusTransactionApi = (orderId) => {
    const URL_BACKEND = `/api/payment/check-status`
    const data = { orderId }
    return axios.post(URL_BACKEND, data)
}

const createPayment = (userId, courseId, amount) => {
    const URL_BACKEND = '/api/payment/create-payment'
    const data = {
        userId,
        courseId,
        amount
    }
    return axios.post(URL_BACKEND, data)
}

const updateAfterStatusIsSuccess = (orderId) => {
    const URL_BACKEND = `/v1/api/process/order/${orderId}`
    return axios.get(URL_BACKEND)
}

export { createPayment, updateAfterStatusIsSuccess, fetchAllOrderApi, checkStatusTransactionApi }
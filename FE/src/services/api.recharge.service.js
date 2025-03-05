import axios from "./axios.customize";

const createRechargePayment = (userId, tokenPackageId, amount) => {
    const URL_BACKEND = '/api/payment/create-recharge-payment'
    const data = {
        userId,
        tokenPackageId,
        amount
    }
    return axios.post(URL_BACKEND, data)
}

const updateAfterRechargeSuccess = (orderId) => {
    const URL_BACKEND = `/v1/api/process/recharge/${orderId}`
    return axios.get(URL_BACKEND)
}

export { createRechargePayment, updateAfterRechargeSuccess }
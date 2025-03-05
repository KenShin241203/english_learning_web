import axios from './axios.customize'

const resetPasswordApi = async (email, resetCode, newPassword) => {
    const URL_BACKEND = '/api/auth/reset_password'
    const data = { email, resetCode, newPassword }
    return axios.post(URL_BACKEND, data)
}

const forgotPasswordApi = async (email) => {
    const URL_BACKEND = '/api/auth/forgot_password'
    const data = { email }
    return axios.post(URL_BACKEND, data)
}

export { resetPasswordApi, forgotPasswordApi }
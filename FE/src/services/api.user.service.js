import axios from "./axios.customize"

const fecthAllUserApi = (page, limit) => {
    const URL_BACKEND = `/v1/api/users?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND);
}

const getUserCourseApi = (id) => {
    const URL_BACKEND = `/v1/api/users_courses/${id}`
    return axios.get(URL_BACKEND)
}

const createNewUserApi = (name, email, password, repeat_password, phone) => {
    const URL_BACKEND = "/v1/api/users"
    const data = { name, email, password, repeat_password, phone }
    return axios.post(URL_BACKEND, data)
}

const updateUserApi = (id, name, email, phone, role) => {
    const URL_BACKEND = "/v1/api/users"
    const data = { id, name, email, phone, role }
    return axios.put(URL_BACKEND, data)
}

const deleteUserApi = (id) => {
    const URL_BACKEND = `/v1/api/users/${id}`
    return axios.delete(URL_BACKEND)
}
const handleUploadFile = (file, folder) => {
    const URL_BACKEND = "/v1/api/single-file"
    let config = {
        headers: {
            "type": folder,
            "Content-Type": "multipart/form-data"
        }
    }
    const bodyFormData = new FormData()
    bodyFormData.append("image", file)
    return axios.post(URL_BACKEND, bodyFormData, config)
}

const uploadAvatarUserApi = (avatar, id, fullName, phone) => {
    const URL_BACKEND = "/v1/api/users";
    const data = {
        avatar: avatar,
        id: id,
        fullName: fullName,
        phone: phone
    }
    return axios.put(URL_BACKEND, data);

}

const registerUserAPI = (name, email, password, repeat_password, phone) => {
    const URL_BACKEND = "/api/auth/register"
    const data = { name, email, password, repeat_password, phone }
    return axios.post(URL_BACKEND, data)
}

const verifyCode = (email, verificationCode) => {
    const URL_BACKEND = "/api/auth/verify_code"
    const data = { email, verificationCode }
    return axios.post(URL_BACKEND, data)
}

const loginAPI = (email, password) => {
    const URL_BACKEND = "/api/auth/login"
    const data = {
        email: email,
        password: password,
    }
    return axios.post(URL_BACKEND, data)
}

const getAccount = () => {
    const URL_BACKEND = "/api/auth/get_account"
    return axios.get(URL_BACKEND)
}

const LogoutApi = () => {
    const URL_BACKEND = "/api/auth/logout"
    return axios.post(URL_BACKEND)
}
export {
    fecthAllUserApi, createNewUserApi, deleteUserApi,
    updateUserApi, handleUploadFile, uploadAvatarUserApi, getUserCourseApi,
    registerUserAPI, loginAPI,
    getAccount, LogoutApi, verifyCode
}
import axios from "./axios.customize"

const fetchAllCourseApi = (page, limit) => {
    const URL_BACKEND = `/v1/api/course?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND)
}

const fetchCourseById = (id) => {
    const URL_BACKEND = `/v1/api/course/${id}`
    return axios.get(URL_BACKEND)
}

const createCourseApi = (name, totalTime, price) => {
    const URL_BACKEND = '/v1/api/course'
    const data = {
        name,
        totalTime,
        price
    }
    return axios.post(URL_BACKEND, data)
}

const addUserToCourse = (userId, courseId) => {
    const URL_BACKEND = '/v1/api/add-user-to-course'
    const data = {
        userId,
        courseId
    }
    return axios.post(URL_BACKEND, data)
}

const checkUserHasAddedCourse = (courseId, userId) => {
    const URL_BACKEND = `/v1/api/users_courses/${courseId}/${userId}/status`
    return axios.get(URL_BACKEND)
}
const uploadAvatarCourse = (id, avatar) => {
    const URL_BACKEND = '/v1/api/course'
    const data = { id, avatar }
    return axios.put(URL_BACKEND, data)
}

const updateCourseApi = (id, name, totalTime, price) => {
    const URL_BACKEND = '/v1/api/course'
    const data = {
        id, name, totalTime, price
    }
    return axios.put(URL_BACKEND, data)
}

const deleteCourseApi = (id) => {
    const URL_BACKEND = `/v1/api/course/${id}`
    return axios.delete(URL_BACKEND)
}

//Get course with chapters
const getCourseWithChapters = (id) => {
    const URL_BACKEND = `/v1/api/course_chapters/${id}`
    return axios.get(URL_BACKEND)
}
export {
    fetchAllCourseApi, createCourseApi, updateCourseApi,
    deleteCourseApi, getCourseWithChapters, uploadAvatarCourse,
    fetchCourseById, addUserToCourse, checkUserHasAddedCourse
}
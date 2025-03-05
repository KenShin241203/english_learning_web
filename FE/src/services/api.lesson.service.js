
import axios from "./axios.customize"
const createLessonApi = (name, total_Question, chapterId) => {
    const URL_BACKEND = "/v1/api/lesson"
    const data = {
        name: name,
        total_Question: total_Question,
        chapterId: chapterId
    }
    return axios.post(URL_BACKEND, data)
}

const createManyLessonApi = async (lessons) => {
    const URL_BACKEND = '/v1/api/many_lesson'
    try {
        // Đảm bảo chapters là mảng hợp lệ, nếu không thì trả về lỗi
        if (!Array.isArray(lessons) || lessons.length === 0) {
            throw new Error("Lessons must be a non-empty array.");
        }

        // Gọi API với dữ liệu chapters trong định dạng { chapters: [...] }         
        return await axios.post(URL_BACKEND, { lessons });

    } catch (error) {
        // Bắt lỗi và trả về thông báo lỗi từ server hoặc từ kiểm tra bên trên
        return {
            success: false,
            message: error.response?.data?.message || error.message || "An error occurred while adding lessons",
        };
    }
}

const fetchAllLessonApi = async (page, limit) => {
    const URL_BACKEND = `/v1/api/lesson?page=${page}&limit=${limit}`
    return await axios.get(URL_BACKEND)
}

const fetchLessonWithQuestion = async (id) => {
    const URL_BACKEND = `/v1/api/lesson/${id}`
    return await axios.get(URL_BACKEND)
}

const updateLessonApi = (id, name, chapterId) => {
    const URL_BACKEND = "/v1/api/lesson"
    const data = {
        id,
        name,
        chapterId
    }
    return axios.put(URL_BACKEND, data)
}
const updateManyLessonApi = async (lessons) => {
    const URL_BACKEND = `/v1/api/many_lesson`
    return axios.put(URL_BACKEND, { lessons })
}

const deleteLessonApi = (id) => {
    const URL_BACKEND = `/v1/api/lesson/${id}`
    return axios.delete(URL_BACKEND)
}


export {
    createLessonApi, fetchAllLessonApi, updateLessonApi, deleteLessonApi,
    createManyLessonApi, updateManyLessonApi, fetchLessonWithQuestion
}


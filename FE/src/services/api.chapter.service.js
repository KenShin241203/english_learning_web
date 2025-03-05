import axios from "./axios.customize"

const createManyChapterApi = async (chapters) => {
    const URL_BACKEND = '/v1/api/many_chapter'
    try {
        // Đảm bảo chapters là mảng hợp lệ, nếu không thì trả về lỗi
        if (!Array.isArray(chapters) || chapters.length === 0) {
            throw new Error("Chapters must be a non-empty array.");
        }

        // Gọi API với dữ liệu chapters trong định dạng { chapters: [...] }         
        return await axios.post(URL_BACKEND, { chapters });

    } catch (error) {
        // Bắt lỗi và trả về thông báo lỗi từ server hoặc từ kiểm tra bên trên
        return {
            success: false,
            message: error.response?.data?.message || error.message || "An error occurred while adding chapters",
        };
    }
}

const fetchAllChapterApi = async (page, limit) => {
    const URL_BACKEND = `/v1/api/chapters?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND)
}
const fetchAllChaptersWithCourseApi = async (page, limit) => {
    const URL_BACKEND = `/v1/api/chapters_course?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND)
}
const fetchChapterWithLessAndTest = async (id) => {
    const URL_BACKEND = `/v1/api/chapter_less_test/${id}`
    return axios.get(URL_BACKEND)
}
const deleteChapterByIdApi = async (id) => {
    const URL_BACKEND = `/v1/api/chapters/${id}`
    return axios.delete(URL_BACKEND)
}


const unlockChapterApi = async (userId, courseId, chapterId) => {
    const URL_BACKEND = `/v1/api/unlock_chapter`
    const data = { userId, courseId, chapterId }
    return axios.post(URL_BACKEND, data)
}

const updateManyChapterApi = async (chapters) => {
    const URL_BACKEND = `/v1/api/many_chapter`
    return axios.put(URL_BACKEND, { chapters })
}

const updateChapterApi = async (chapterId, name, numOrder, courseId) => {
    const URL_BACKEND = `/v1/api/chapters`
    const data = { chapterId, name, numOrder, courseId }
    return axios.put(URL_BACKEND, data)
}
export {
    createManyChapterApi, deleteChapterByIdApi, updateManyChapterApi,
    fetchAllChapterApi, fetchAllChaptersWithCourseApi, fetchChapterWithLessAndTest,
    updateChapterApi, unlockChapterApi
} 
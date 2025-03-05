import axios from "./axios.customize"


const fetchAllTestApi = async (page, limit) => {
    const URL_BACKEND = `/v1/api/test?page=${page}&limit=${limit}`
    return await axios.get(URL_BACKEND)
}

const fetchTestWithQuestion = async (id) => {
    const URL_BACKEND = `/v1/api/test/${id}`
    return await axios.get(URL_BACKEND)
}
const createManyTestApi = (testArr) => {
    const URL_BACKEND = '/v1/api/many_test'
    try {
        if (!Array.isArray(testArr) || testArr.length === 0) {
            throw new Error("testArr must be a non-empty array.");
        }
        return axios.post(URL_BACKEND, { testArr });

    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message || "An error occurred while adding test",
        };
    }
}

const updateTestApi = (id, name, chapterId) => {
    const URL_BACKEND = `/v1/api/test`
    const data = {
        id, name, chapterId
    }
    return axios.put(URL_BACKEND, data)
}

const updateManyTestApi = (testArr) => {
    const URL_BACKEND = `/v1/api/many_test`
    return axios.put(URL_BACKEND, { testArr })
}

const deleteTestApi = (id) => {
    const URL_BACKEND = `/v1/api/test/${id}`
    return axios.delete(URL_BACKEND)
}
export {
    createManyTestApi, deleteTestApi, updateManyTestApi, updateTestApi,
    fetchAllTestApi, fetchTestWithQuestion
}
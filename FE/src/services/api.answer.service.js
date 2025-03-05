import axios from "./axios.customize"

const createManyAnswerApi = async (answers) => {
    const URL_BACKEND = '/v1/api/many_answer'
    return axios.post(URL_BACKEND, { answers })
}

const updateManyAnswerApi = async (answers) => {
    const URL_BACKEND = '/v1/api/many_answer'
    return axios.put(URL_BACKEND, { answers })
}

const deleteAnswerApi = async (id) => {
    const URL_BACKEND = `/v1/api/answers/${id}`
    return axios.delete(URL_BACKEND)
}
export { createManyAnswerApi, deleteAnswerApi, updateManyAnswerApi }
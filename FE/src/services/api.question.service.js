import axios from "./axios.customize"

const fetchQuestionWithAnswer = async (id) => {
    const URL_BACKEND = `/v1/api/questions/${id}`
    return axios.get(URL_BACKEND)
}

const fetchQuestionWithLessonId = async (lessonId) => {
    const URL_BACKEND = `/v1/api/${lessonId}/questions`
    return axios.get(URL_BACKEND)
}
const createManyQuestionForLesson = async (questions) => {
    const URL_BACKEND = '/v1/api/questions_lesson'
    return axios.post(URL_BACKEND, { questions })
}

const createManyQuestionForTest = async (questions) => {
    const URL_BACKEND = '/v1/api/questions_test'
    return axios.post(URL_BACKEND, { questions })
}

const updateManyQuestionOnLesson = async (questions) => {
    const URL_BACKEND = '/v1/api/questions_lesson'
    return axios.put(URL_BACKEND, { questions })
}

const updateManyQuestionOnTest = async (questions) => {
    const URL_BACKEND = '/v1/api/questions_test'
    return axios.put(URL_BACKEND, { questions })
}

const deleteQuestionApi = async (id) => {
    const URL_BACKEND = `/v1/api/questions/${id}`
    return axios.delete(URL_BACKEND)
}

const translateToEnglish = async (description) => {
    const URL_BACKEND = '/v1/api/translate_description'
    const data = { description }
    return axios.post(URL_BACKEND, data)
}
export {
    createManyQuestionForLesson, createManyQuestionForTest,
    updateManyQuestionOnLesson, updateManyQuestionOnTest,
    deleteQuestionApi, fetchQuestionWithAnswer,
    fetchQuestionWithLessonId, translateToEnglish
}
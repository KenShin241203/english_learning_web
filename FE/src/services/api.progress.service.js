import axios from "./axios.customize"

const markLessonCompleteApi = (userId, courseId, chapterId, lessonId, correctAnswersCount, totalQuestions) => {
    const URL_BACKEND = '/v1/api/progress/markLessonComplete'
    const data = {
        userId,
        courseId,
        chapterId,
        lessonId,
        correctAnswersCount,
        totalQuestions
    }
    return axios.post(URL_BACKEND, data)
}

const getProgressApi = (userId, courseId) => {
    const URL_BACKEND = `/v1/api/progress/${userId}/${courseId}`
    return axios.get(URL_BACKEND)
}

const getCompletionPercetageApi = (userId, courseId) => {
    const URL_BACKEND = `/v1/api/progress/completionPercentage/${userId}/${courseId}`
    return axios.get(URL_BACKEND)
}


const getTotalLessonCompletedApi = (userId, courseId) => {
    const URL_BACKEND = `/v1/api/progress/totalLessonCompleted/${userId}/${courseId}`
    return axios.get(URL_BACKEND)
}
export { markLessonCompleteApi, getProgressApi, getCompletionPercetageApi, getTotalLessonCompletedApi }
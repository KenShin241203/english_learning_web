import axios from "./axios.customize"

const getUserReviewApi = (userId, courseId) => {
    const URL_BACKEND = `/v1/api/user_review/${userId}/${courseId}`

    return axios.get(URL_BACKEND)
}

const fetchAllReviewApi = (page, limit) => {
    const URL_BACKEND = `/v1/api/reviews/?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND)
}

const fetchReviewsOfCourseApi = (page, limit, courseId) => {
    const URL_BACKEND = `/v1/api/reviews/${courseId}/?page=${page}&limit=${limit}`
    return axios.get(URL_BACKEND)
}

const createUserReviewApi = (userId, courseId, rating, content) => {
    const URL_BACKEND = `/v1/api/write_review`
    const data = { userId, courseId, rating, content }
    return axios.post(URL_BACKEND, data)
}

const deleteUserReviewApi = (reviewId) => {
    const URL_BACKEND = `/v1/api/review/${reviewId}`
    return axios.delete(URL_BACKEND)
}
const respondToReviewApi = (reviewId, adminResponse) => {
    const URL_BACKEND = `/v1/api/respond_to_review`
    const data = { reviewId, adminResponse }
    return axios.post(URL_BACKEND, data)
}

const getReviewByIdApi = (reviewId) => {
    const URL_BACKEND = `/v1/api/review/${reviewId}`
    return axios.get(URL_BACKEND)
}

const likeReviewApi = (userId, reviewId) => {
    const URL_BACKEND = `/v1/api/like_review`
    const data = { userId, reviewId }
    return axios.post(URL_BACKEND, data)
}

const dislikeReviewApi = (userId, reviewId) => {
    const URL_BACKEND = `/v1/api/dislike_review`
    const data = { userId, reviewId }
    return axios.post(URL_BACKEND, data)
}

const fetchLikeAndDislikeApi = (userId, reviewId) => {
    const URL_BACKEND = `/v1/api/fetch_like_dislike/${userId}/${reviewId}`
    return axios.get(URL_BACKEND)
}

const removeReactionReviewApi = (userId, reviewId, reactionType) => {
    const URL_BACKEND = `/v1/api/remove_reaction/${userId}/${reviewId}/${reactionType}`
    return axios.delete(URL_BACKEND)
}
export {
    getUserReviewApi, createUserReviewApi, deleteUserReviewApi, fetchReviewsOfCourseApi,
    fetchAllReviewApi, respondToReviewApi, getReviewByIdApi, likeReviewApi, dislikeReviewApi,
    fetchLikeAndDislikeApi, removeReactionReviewApi
}
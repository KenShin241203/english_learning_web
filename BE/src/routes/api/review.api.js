const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Validate Review
const validateReview = require('../../middleware/validate/validateReview');

//Review controller
const { getReviewsApi, postCreateReviewApi, updateReviewApi, deleteReviewApi, deleteManyReviewApi,
    writeReviewApi, getUserReviewCourseApi, getReviewByCourseId,
    respondToReviewApi,
    deleteAdminResponseApi,
    getReviewByIdApi,
    likeReviewApi,
    dislikeReviewApi,
    fetchLikeAndDislikeOfUser,
    removeReactionApi } = require('../../controller/reviewController');

//Review Api
routerApi.get('/reviews', verifyToken, getReviewsApi);
routerApi.get('/user_review/:userId/:courseId', verifyToken, getUserReviewCourseApi)
routerApi.get('/reviews/:courseId', getReviewByCourseId)
routerApi.post('/write_review', verifyToken, writeReviewApi);
routerApi.post('/reviews', validateReview, verifyToken, authorizeRoles("admin", "user"), postCreateReviewApi);
routerApi.put('/reviews', verifyToken, authorizeRoles("admin", "user"), updateReviewApi);
routerApi.delete('/reviews/:id', verifyToken, authorizeRoles("admin", "user"), deleteReviewApi);
routerApi.delete('/many_review', verifyToken, authorizeRoles("admin"), deleteManyReviewApi);
routerApi.get('/review/:id', verifyToken, authorizeRoles("admin"), getReviewByIdApi);
routerApi.post('/respond_to_review', verifyToken, authorizeRoles("admin"), respondToReviewApi);
routerApi.post('/like_review', verifyToken, likeReviewApi);
routerApi.post('/dislike_review', verifyToken, dislikeReviewApi);
routerApi.get('/fetch_like_dislike/:userId/:reviewId', verifyToken, fetchLikeAndDislikeOfUser);
routerApi.delete('/remove_reaction/:userId/:reviewId/:reactionType', verifyToken, removeReactionApi);
routerApi.delete('/respond_to_review', verifyToken, authorizeRoles("admin"), deleteAdminResponseApi);

module.exports = routerApi;
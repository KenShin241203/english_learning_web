const { json } = require('express');
const Review = require('../models/review');
const User = require('../models/user');
const { createReviewService, updateReviewService, getAllReviewService,
    deleteReviewService, deleteManyReview, handleReview,
    getUserReviewForCourse,
    getReviewsOfCourseService,
    respondToReviewService,
    deleteResponseService,
    updateResponseService,
    getReviewById,
    removeReactionFromReview, } = require('../services/reviewService');

const getReviewsApi = async (req, res) => {

    const totalDocuments = await Review.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllReviewService(req.query);
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: {
                meta: {
                    currentPage: current,
                    pageSize: limit,
                    totalPages: totalPages,
                    totalEntity: totalDocuments
                },
                result
            }
        })
    }
}

const getReviewByIdApi = async (req, res) => {
    let result = await getReviewById(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const getUserReviewCourseApi = async (req, res) => {
    try {
        const result = await getUserReviewForCourse(req.params.userId, req.params.courseId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getReviewByCourseId = async (req, res) => {
    const { courseId } = req.params;
    try {
        const { formattedReviews, ratings, totalReviews } = await getReviewsOfCourseService(req.query, courseId);

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const totalPages = Math.ceil(totalReviews / limit);

        res.status(200).json({
            meta: {
                currentPage: page,
                pageSize: limit,
                totalPages: totalPages,
                totalReviews: totalReviews,
            },
            data: {
                reviews: formattedReviews,
                ratings: ratings,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy review', error: error.message });
    }
};


const postCreateReviewApi = async (req, res) => {
    let result = await createReviewService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const writeReviewApi = async (req, res) => {
    const { userId, courseId, rating, content } = req.body;
    try {
        const result = await handleReview(userId, courseId, rating, content);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateReviewApi = async (req, res) => {
    let result = await updateReviewService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteReviewApi = async (req, res) => {
    let result = await deleteReviewService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyReviewApi = async (req, res) => {
    let result = await deleteManyReview(req.body.reviewsArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const respondToReviewApi = async (req, res) => {
    const { reviewId, adminResponse } = req.body;
    try {
        const result = await respondToReviewService(reviewId, adminResponse);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteAdminResponseApi = async (req, res) => {
    const { reviewId } = req.body;
    try {
        const result = await deleteResponseService(reviewId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const likeReviewApi = async (req, res) => {
    const { userId, reviewId } = req.body; // Assume userId is sent in the body

    const review = await Review.findById(reviewId);
    const user = await User.findById(userId);

    if (!review || !user) return res.status(404).send('Review or User not found');

    review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
    user.dislikedReviews = user.dislikedReviews.filter(id => id.toString() !== reviewId);

    if (!review.likes.includes(userId)) {
        review.likes.push(userId);
        user.likedReviews.push(reviewId);
    }

    await review.save();
    await user.save();
    res.send('Review liked');
}

const dislikeReviewApi = async (req, res) => {
    const { userId, reviewId } = req.body; // Assume userId is sent in the body


    const review = await Review.findById(reviewId);
    const user = await User.findById(userId);

    if (!review || !user) return res.status(404).send('Review or User not found');

    review.likes = review.likes.filter(id => id.toString() !== userId);
    user.likedReviews = user.likedReviews.filter(id => id.toString() !== reviewId);

    if (!review.dislikes.includes(userId)) {
        review.dislikes.push(userId);
        user.dislikedReviews.push(reviewId);
    }

    await review.save();
    await user.save();

    res.send('Review disliked');
}

const fetchLikeAndDislikeOfUser = async (req, res) => {
    const { userId, reviewId } = req.params;
    try {
        const user = await User.findById(userId).populate('likedReviews').populate('dislikedReviews');
        if (!user) return res.status(404).send('User not found');

        const isLiked = user.likedReviews.some(review => review._id.toString() === reviewId);
        const isDisliked = user.dislikedReviews.some(review => review._id.toString() === reviewId);

        res.json({ isLiked, isDisliked });
    } catch (error) {
        console.error('Error fetching liked/disliked reviews:', error);
        res.status(500).send('Server error');
    }
};

const removeReactionApi = async (req, res) => {
    try {
        const { userId, reviewId, reactionType } = req.params;
        console.log(userId, reviewId, reactionType);
        const result = await removeReactionFromReview(userId, reviewId, reactionType);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReviewsApi, postCreateReviewApi, updateReviewApi,
    deleteReviewApi, deleteManyReviewApi, writeReviewApi,
    getUserReviewCourseApi, getReviewByCourseId, respondToReviewApi,
    deleteAdminResponseApi, getReviewByIdApi, likeReviewApi, dislikeReviewApi,
    fetchLikeAndDislikeOfUser, removeReactionApi
}
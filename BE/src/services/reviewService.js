const Review = require('../models/review');
const User = require('../models/user');
const Course = require('../models/course')
const { default: aqp } = require('api-query-params');
const mongoose = require('mongoose');

const moment = require('moment');

const getAllReviewService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Review.find(filter)
        .populate({
            path: 'userId',
            select: 'email'
        })
        .populate({
            path: 'courseId',
            select: 'name'
        })
        .skip(offset)
        .limit(limit)
        .exec();
    const formattedReviews = result.map(review => ({
        _id: review._id,
        email: review.userId ? review.userId.email : "Unknown",
        courseName: review.courseId ? review.courseId.name : "Unknown",
        rating: review.rating,
        content: review.content
    }));
    return formattedReviews;
}

const getReviewsOfCourseService = async (queryString, courseId) => {
    const page = queryString.page;
    let { filter, limit } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let totalReviews = await Review.countDocuments({ courseId });
    let reviews = await Review.find({ courseId })
        .populate({
            path: 'userId',
            select: 'name'
        })
        .populate({
            path: 'courseId',
            select: 'name'
        })
        .skip(offset)
        .limit(limit)
        .exec();

    let formattedReviews = reviews.map((review) => ({
        _id: review._id,
        username: review.userId.name,
        content: review.content,
        rating: review.rating,
        adminResponse: review.adminResponse,
        likes: review.likes,
        dislikes: review.dislikes,
        createdAt: moment(review.createdAt).fromNow()
    }));


    // Tính toán thống kê số lượng rating 1-5 sao
    const ratingCounts = await Review.aggregate([
        { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    // Chuẩn hóa kết quả cho mỗi mức rating

    let ratings = Array(5).fill(0).map((_, i) => {
        const ratingData = ratingCounts.find((r) => r._id === i + 1);
        return {
            stars: i + 1,
            count: ratingData ? ratingData.count : 0,
            percentage: totalReviews > 0 ? ((ratingData?.count || 0) / totalReviews) * 100 : 0
        };
    });
    return {
        formattedReviews,
        ratings,
        totalReviews
    };
};

const getReviewById = async (id) => {
    try {
        let review = await Review.findById(id);
        return review;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createReviewService = async (data) => {
    try {
        let result = await Review.create(data);
        let user = await User.findOne({ _id: data.userId });

        if (!user) {
            return new Error('User not found');
        }
        user.reviewInfo.push(result);
        await user.save();
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

// Hàm lấy review của người dùng cho khóa học
const getUserReviewForCourse = async (userId, courseId) => {
    try {
        // Tìm review của người dùng cho khóa học cụ thể
        const review = await Review.findOne({ userId: userId, courseId: courseId });

        if (!review) {
            // Nếu không tìm thấy review, trả về thông báo
            return { message: 'No review found for this course' };
        }

        return { review }; // Trả về review của người dùng
    } catch (error) {
        console.error('Error fetching review:', error);
        throw new Error('An error occurred while fetching the review');
    }
}

// Hàm tính lại tổng điểm trung bình của course
const updateCourseTotalStar = async (courseId) => {
    try {
        const course = await Course.findById(courseId).populate('reviewInfo');
        const totalReviews = course.reviewInfo.length;

        // Tính tổng rating của tất cả reviews
        const totalRating = course.reviewInfo.reduce((sum, review) => sum + review.rating, 0);

        // Tính trung bình rating (totalStar)
        const totalStar = totalReviews === 0 ? 0 : totalRating / totalReviews;

        // Cập nhật trường totalStar của khóa học
        course.totalStar = totalStar;
        await course.save();

        return course;
    } catch (error) {
        console.error('Error updating course totalStar:', error);
        throw new Error('An error occurred while updating course rating');
    }
}
// Hàm xử lý logic viết review
const handleReview = async (userId, courseId, rating, content) => {
    try {
        // Kiểm tra xem người dùng đã có review cho khóa học này chưa
        const existingReview = await Review.findOne({ userId: userId, courseId: courseId });
        if (existingReview) {
            // Nếu đã có review, cho phép chỉnh sửa review cũ
            existingReview.content = content; // giả sử reviewData chứa nội dung review mới
            existingReview.rating = rating;   // giả sử reviewData chứa rating mới

            // Cập nhật lại review trong database
            await existingReview.save();
            await updateCourseTotalStar(courseId)
            return { message: 'Review updated successfully', review: existingReview };
        } else {
            // Nếu chưa có review, tạo review mới
            const newReview = new Review({
                userId: userId,
                courseId: courseId,
                rating: rating,
                content: content
            });

            // Lưu review mới vào database
            await newReview.save();
            await User.findByIdAndUpdate(userId, { $addToSet: { reviewInfo: newReview._id } });
            await Course.findByIdAndUpdate(courseId, { $addToSet: { reviewInfo: newReview._id } });

            await updateCourseTotalStar(courseId)
            return { message: newReview.isNew ? 'Review created successfully' : 'Review updated successfully', newReview };
        }
    } catch (error) {
        console.error('Error handling review:', error);
        throw new Error('An error occurred while processing the review');
    }
}

const updateReviewService = async (data) => {
    try {
        let result = await Review.updateOne({ _id: data.id }, { ...data });
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const deleteReviewService = async (id) => {
    try {
        let review = await Review.findById(id);
        let result = await Review.deleteById(id);
        await User.findByIdAndUpdate(review.userId, {
            $pull: { reviewInfo: id }
        });
        await Course.findByIdAndUpdate(review.courseId, {
            $pull: { reviewInfo: id }
        });
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyReview = async (arrId) => {
    try {
        let result = await Review.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}

const respondToReviewService = async (reviewId, adminResponse) => {
    try {
        let review = await Review.findById(reviewId);
        if (!review) {
            return new Error('Review not found');
        }
        review.adminResponse = adminResponse;
        await review.save();
        return review;
    } catch (error) {
        console.log(error);
        return error;
    }
}
const deleteResponseService = async (reviewId) => {
    try {
        let review = await Review.findById(reviewId);
        if (!review) {
            return new Error('Review not found');
        }
        review.adminResponse = '';
        await review.save();
        return review;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const removeReactionFromReview = async (userId, reviewId, reactionType) => {
    try {
        if (reactionType === 'like') {
            await Review.findByIdAndUpdate(reviewId, { $pull: { likes: userId } });
            await User.findByIdAndUpdate(userId, { $pull: { likedReviews: reviewId } });
        } else if (reactionType === 'dislike') {
            await Review.findByIdAndUpdate(reviewId, { $pull: { dislikes: userId } });
            await User.findByIdAndUpdate(userId, { $pull: { dislikedReviews: reviewId } });
        }
        return { message: `${reactionType} removed successfully` };
    } catch (error) {
        console.error('Error removing reaction:', error);
        throw new Error('An error occurred while removing the reaction');
    }
};
module.exports = {
    createReviewService, updateReviewService, getAllReviewService,
    deleteReviewService, deleteManyReview, handleReview, getUserReviewForCourse,
    getReviewsOfCourseService, respondToReviewService, deleteResponseService, getReviewById,
    removeReactionFromReview
}
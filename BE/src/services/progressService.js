const Progress = require('../models/progress')
const Chapter = require('../models/chapter')
const User = require('../models/user')

const getProgressService = async (userId, courseId) => {
    try {
        const progress = await Progress.findOne({ userId, courseId }).populate({
            path: 'chapterProgress.chapterId',
            select: 'name',
        });
        return progress;
    } catch (error) {
        throw new Error('Error fetching progress');
    }
};



const markLessonComplete = async (userId, courseId, chapterId, lessonId, correctAnswersCount, totalQuestions) => {
    try {
        if (!userId || !courseId || !chapterId || !lessonId) {
            return { success: false, message: "Thiếu thông tin đầu vào" };
        }

        // Kiểm tra nếu người dùng trả lời đúng tất cả câu hỏi
        if (correctAnswersCount === totalQuestions) {
            let progress = await Progress.findOne({ userId, courseId });
            if (!progress) {
                progress = new Progress({
                    userId,
                    courseId,
                    chapterProgress: [],
                    lastUpdated: new Date(),
                });
                await progress.save();
            }

            // Cập nhật bài học hoàn thành
            const updatedProgress = await Progress.findOneAndUpdate(
                { userId, courseId, "chapterProgress.chapterId": chapterId },
                {
                    $addToSet: { "chapterProgress.$.completedLessons": lessonId },
                    $set: { lastUpdated: new Date() },
                },
                { new: true }
            );

            // Nếu chương chưa tồn tại, thêm mới
            if (!updatedProgress) {
                await Progress.findOneAndUpdate(
                    { userId, courseId },
                    {
                        $push: { chapterProgress: { chapterId, completedLessons: [lessonId] } },
                        $set: { lastUpdated: new Date() },
                    },
                    { new: true }
                );
            }

            // Cộng 2 token vào user
            await User.findByIdAndUpdate(userId, { $inc: { tokens: 2 } });

            return { success: true, message: "Bài học đã hoàn thành", progress: updatedProgress };
        } else {
            return { success: false, message: "Chưa đạt điều kiện hoàn thành bài học" };
        }
    } catch (error) {
        throw new Error('Lỗi khi cập nhật trạng thái hoàn thành bài học');
    }
};

const getCompletionPercentage = async (userId, courseId) => {
    try {
        const progress = await Progress.findOne({ userId, courseId }).lean();

        // Lấy tất cả các chương và bài học của khóa học
        const allChapters = await Chapter.find({ courseId }).populate('lessonInfo').lean();

        let totalLessons = 0;
        let completedLessons = 0;

        for (const chapter of allChapters) {
            totalLessons += chapter.lessonInfo.length;

            const progressForChapter = progress?.chapterProgress.find(
                (c) => c.chapterId.toString() === chapter._id.toString()
            );

            completedLessons += progressForChapter?.completedLessons.length || 0;
        }

        if (totalLessons === 0) return 0; // Tránh chia cho 0 nếu không có bài học

        // Tính phần trăm hoàn thành dựa trên tổng số bài học
        return Math.round((completedLessons / totalLessons) * 100);
    } catch (error) {
        throw new Error('Lỗi khi tính phần trăm hoàn thành khóa học');
    }
};


const getTotalLessonCompleted = async (userId, courseId) => {
    try {
        const progress = await Progress.findOne({ userId, courseId }).lean();

        // Lấy tất cả các chương và bài học của khóa học
        const allChapters = await Chapter.find({ courseId }).populate('lessonInfo').lean();

        let totalLessons = 0;
        let completedLessons = 0;

        for (const chapter of allChapters) {
            totalLessons += chapter.lessonInfo.length;

            const progressForChapter = progress?.chapterProgress.find(
                (c) => c.chapterId.toString() === chapter._id.toString()
            );

            completedLessons += progressForChapter?.completedLessons.length || 0;
        }

        return {
            totalLessons,
            completedLessons
        };
    } catch (error) {
        throw new Error('Lỗi khi lấy thông tin bài học');
    }
};



module.exports = { markLessonComplete, getCompletionPercentage, getProgressService, getTotalLessonCompleted }
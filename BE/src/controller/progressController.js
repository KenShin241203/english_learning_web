
const { markLessonComplete, getCompletionPercentage, getProgressService, getTotalLessonCompleted } = require('../services/progressService')

const getProgressApi = async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        const result = await getProgressService(userId, courseId);

        if (!result) {
            return res.status(200).json({
                message: "No progress found for this course",
                data: { chapterProgress: [] },
            });
        }

        return res.status(200).json({
            message: "Progress retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error); // Optional: Log the error for debugging.
        return res.status(500).json({ message: error.message });
    }
};

const markLessonCompleteApi = async (req, res) => {
    const { userId, courseId, chapterId, lessonId, correctAnswersCount, totalQuestions } = req.body;

    // Validate the input
    if (
        !userId ||
        !courseId ||
        !chapterId ||
        !lessonId ||
        typeof correctAnswersCount !== "number" ||
        typeof totalQuestions !== "number"
    ) {
        return res.status(400).json({
            message: "Invalid input data. Please ensure all fields are provided and correctly formatted.",
        });
    }

    try {
        const result = await markLessonComplete(
            userId,
            courseId,
            chapterId,
            lessonId,
            correctAnswersCount,
            totalQuestions
        );

        // Include updated progress in the response for better frontend experience
        const updatedProgress = await getProgressService(userId, courseId);

        res.status(200).json({ ...result, updatedProgress });
    } catch (error) {
        console.error(error); // Optional: Log the error for debugging.
        res.status(500).json({ message: error.message });
    }
};


const getCompletionPercentageApi = async (req, res) => {
    const { userId, courseId } = req.params;

    // Validate query parameters
    if (!userId || !courseId) {
        return res.status(400).json({ message: "Missing userId or courseId in query parameters." });
    }

    try {
        const percentage = await getCompletionPercentage(userId, courseId);

        // Optionally include total progress details if helpful for the frontend
        const progressDetails = await getProgressService(userId, courseId);

        res.status(200).json({
            completionPercentage: percentage,
            progressDetails, // Include progress data for frontend flexibility
        });
    } catch (error) {
        console.error(error); // Optional: Log the error for debugging.
        res.status(500).json({ message: error.message });
    }
};


const getTotalLessonCompletedApi = async (req, res) => {
    const { userId, courseId } = req.params;

    // Validate query parameters
    if (!userId || !courseId) {
        return res.status(400).json({ message: "Missing userId or courseId in query parameters." });
    }

    try {
        const totalLessonCompleted = await getTotalLessonCompleted(userId, courseId);



        res.status(200).json({
            totalLessonCompleted,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = { markLessonCompleteApi, getCompletionPercentageApi, getProgressApi, getTotalLessonCompletedApi }

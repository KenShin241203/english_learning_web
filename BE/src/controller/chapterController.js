const { createChapterService, updateChapterService, getAllChapterService,
    deleteChapterService, deleteManyChapter, createManyChapterService,
    updateManyChapterService, getAllChaptersWithCourseName,
    unlockChapter } = require('../services/chapterService');
const Chapter = require('../models/chapter');
const { getProgressService } = require('../services/progressService');
const getChaptersApi = async (req, res) => {
    const totalDocuments = await Chapter.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllChapterService(req.query);
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

const getChaptersWithCourseApi = async (req, res) => {
    const totalDocuments = await Chapter.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllChaptersWithCourseName(req.query);
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

const getChapterWithLessonAndTestApi = async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate({
            path: 'lessonInfo',
            select: 'name && chapterId'
        }).populate({
            path: 'testInfo',
            select: 'name && chapterId'
        }).populate({
            path: 'courseId',
            select: 'name '
        });
        res.status(200).json({ success: true, data: chapter });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const unlockChapterApi = async (req, res) => {
    const { userId, courseId, chapterId } = req.body;

    // Validate the input
    if (!userId || !courseId || !chapterId) {
        return res.status(400).json({
            message: "Invalid input data. Please ensure all fields are provided.",
        });
    }

    try {
        const result = await unlockChapter(userId, courseId, chapterId);

        // Include updated progress in the response for better frontend experience
        const updatedProgress = await getProgressService(userId, courseId);

        res.status(200).json({ ...result, updatedProgress });
    } catch (error) {
        console.error(error); // Optional: Log the error for debugging.
        res.status(500).json({ message: error.message });
    }
};



const postCreateChapterApi = async (req, res) => {
    let result = await createChapterService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}
const postCreateManyChapterApi = async (req, res) => {
    try {
        let result = await createManyChapterService(req.body.chapters);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const updateChapterApi = async (req, res) => {
    try {

        let result = await updateChapterService(req.body);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }

}

const updateManyChapterApi = async (req, res) => {
    const chapters = req.body.chapters; // Lấy danh sách chapters từ request body

    if (!Array.isArray(chapters)) {
        return res.status(400).json({ success: false, message: "Chapters must be an array" });
    }

    try {
        const updatedChapters = await updateManyChapterService(req.body.chapters);
        return res.status(200).json({ success: true, message: "Chapters updated successfully", data: updatedChapters });
    } catch (error) {
        console.error("Error updating chapters:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}
const deleteChapterApi = async (req, res) => {
    let result = await deleteChapterService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyChapterApi = async (req, res) => {
    let result = await deleteManyChapter(req.body.chapterArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = {
    getChaptersApi, postCreateChapterApi, postCreateManyChapterApi,
    updateChapterApi, updateManyChapterApi,
    deleteChapterApi, deleteManyChapterApi, getChaptersWithCourseApi,
    getChapterWithLessonAndTestApi, unlockChapterApi
}
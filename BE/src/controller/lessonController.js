const { model } = require('mongoose');
const Lesson = require('../models/lesson');
const { createLessonService, updateLessonService, getAllLessonService,
    deleteLessonService, deleteManyLesson, createManyLessonService, updateManyLessonService } = require('../services/lessonService');

const getLessonsApi = async (req, res) => {
    const totalDocuments = await Lesson.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllLessonService(req.query);
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

const getLessonById = async (req, res) => {
    try {
        let result = await Lesson.findById(req.params.id)
            .populate({
                path: 'chapterId',
                select: 'name',
                populate: 'courseId'
            })
            .populate({
                path: 'questionInfo',
                populate: {
                    path: 'answerInfo',
                    model: 'answer'
                }
            })
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
const postCreateLessonApi = async (req, res) => {
    let result = await createLessonService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const postCreateManyLessonApi = async (req, res) => {
    try {
        let result = await createManyLessonService(req.body.lessons);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const updateLessonApi = async (req, res) => {
    let result = await updateLessonService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}
const updateManyLessonApi = async (req, res) => {
    const lessons = req.body.lessons; // Lấy danh sách chapters từ request body

    if (!Array.isArray(lessons)) {
        return res.status(400).json({ success: false, message: "Lessons must be an array" });
    }

    try {
        const updatedLessons = await updateManyLessonService(req.body.lessons);
        return res.status(200).json({ success: true, message: "Lessons updated successfully", data: updatedLessons });
    } catch (error) {
        console.error("Error updating lessons:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}
const deleteLessonApi = async (req, res) => {
    const lessonId = req.params.id;
    let result = await deleteLessonService(lessonId);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyLessonApi = async (req, res) => {
    let result = await deleteManyLesson(req.body.lessons)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = {
    getLessonsApi, postCreateLessonApi, updateLessonApi,
    deleteLessonApi, deleteManyLessonApi, postCreateManyLessonApi,
    updateManyLessonApi, getLessonById
}
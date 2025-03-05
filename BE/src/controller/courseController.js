
const { createCourseService, createManyCourseService, updateCourseService, getAllCourseService, deleteCourseService, deleteManyCourse, getCourseByIdService } = require('../services/courseService');
const Course = require('../models/course')
const getCourseApi = async (req, res) => {
    const totalDocuments = await Course.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllCourseService(req.query);
    if (result) {
        return res.status(200).json({
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

const getCourseByIdApi = async (req, res) => {
    try {
        const result = await getCourseByIdService(req.params.id)
        res.status(200).json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
const getCourseWithChapters = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('chapterInfo'); // Giả sử `chapterInfo` chứa các `chapter`
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const postCreateCourseApi = async (req, res) => {
    let result = await createCourseService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const postCreateManyCourseApi = async (req, res) => {
    let result = await createManyCourseService(req.body.users);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const updateCourseApi = async (req, res) => {
    let result = await updateCourseService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteCourseApi = async (req, res) => {
    let result = await deleteCourseService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyCourseApi = async (req, res) => {
    let result = await deleteManyCourse(req.body.courseArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}
module.exports = {
    getCourseApi, postCreateCourseApi, postCreateManyCourseApi,
    updateCourseApi, deleteCourseApi, deleteManyCourseApi, getCourseWithChapters,
    getCourseByIdApi
}
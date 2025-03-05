const Test = require('../models/test');
const { createTestService, updateTestService, getAllTestService, deleteTestService, deleteManyTest, createManyTestService, updateManyTestService } = require('../services/testService');

const getTestsApi = async (req, res) => {
    const totalDocuments = await Test.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllTestService(req.query);
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

const getTestById = async (req, res) => {
    try {
        let result = await Test.findById(req.params.id)
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

const postCreateTestApi = async (req, res) => {
    let result = await createTestService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}
const postCreateManyTestApi = async (req, res) => {
    try {
        let result = await createManyTestService(req.body.testArr);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const updateTestApi = async (req, res) => {
    let result = await updateTestService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}
const updateManyTestApi = async (req, res) => {
    const testArr = req.body.testArr;

    if (!Array.isArray(testArr)) {
        return res.status(400).json({ success: false, message: "testArr must be an array" });
    }

    try {
        const updatedTestArr = await updateManyTestService(req.body.testArr);
        return res.status(200).json({ success: true, message: "TestArr updated successfully", data: updatedTestArr });
    } catch (error) {
        console.error("Error updating lessons:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}
const deleteTestApi = async (req, res) => {
    let result = await deleteTestService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyTestApi = async (req, res) => {
    let result = await deleteManyTest(req.body.testArr)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = {
    getTestsApi, postCreateTestApi, updateTestApi,
    deleteTestApi, deleteManyTestApi, postCreateManyTestApi,
    updateManyTestApi, getTestById
}
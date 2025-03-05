const User = require("../models/user")
const { createUserService, createManyUserService, updateUserService, getAllUserService, deleteUserService, deleteManyUser, getUserByIdService } = require('../services/userService');
const getUsersApi = async (req, res) => {
    const totalDocuments = await User.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    let result = await getAllUserService(req.query);
    const totalPages = Math.ceil(totalDocuments / limit)
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

const getUserCourseApi = async (req, res) => {
    try {
        const result = await getUserByIdService(req.params.id)
        return res.status(200).json({
            EC: 0,
            data: result
        })
    } catch (error) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }

}

const postCreateUserApi = async (req, res) => {
    let existEmail = await User.findOne({ email: req.body.email }).exec();
    if (existEmail) {
        return res.status(401).json({
            error: "Bad Request",
            message: "Email was created on another account",
            statusCode: 401
        })
    }
    let result = await createUserService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const postCreateManyUserApi = async (req, res) => {
    let result = await createManyUserService(req.body.users);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const updateUserApi = async (req, res) => {
    let result = await updateUserService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteUserApi = async (req, res) => {
    let result = await deleteUserService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyUserApi = async (req, res) => {
    let result = await deleteManyUser(req.body.userArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}
module.exports = {
    getUsersApi, postCreateUserApi, postCreateManyUserApi,
    updateUserApi, deleteUserApi, deleteManyUserApi,
    getUserCourseApi
}
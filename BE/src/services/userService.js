
const User = require('../models/user');
const { json } = require('express');
const { default: aqp } = require('api-query-params');

const getAllUserService = async (queryString) => {
    const page = queryString.page;

    let { filter, limit, population } = aqp(queryString);

    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await User.find(filter)
        .populate(population)
        .skip(offset)
        .limit(limit)
        .exec();
    return result;
}

const getUserByIdService = async (userId) => {
    try {
        const user = await User.findById(userId).populate('courseInfo')
        return (user)
    } catch (error) {
        throw new Error(`User with ${userId} not found`)
    }
}

const createUserService = async (data) => {
    try {
        let result = await User.create(data)
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createManyUserService = async (arr) => {
    try {
        let result = await User.insertMany(arr)
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const updateUserService = async (data) => {
    try {
        let result = await User.updateOne({ _id: data.id }, { ...data });
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const deleteUserService = async (id) => {
    try {
        let result = await User.deleteById(id);
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyUser = async (arrId) => {
    try {
        let result = await User.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}
module.exports = {
    createUserService, createManyUserService, updateUserService,
    getAllUserService, deleteUserService, deleteManyUser,
    getUserByIdService
}
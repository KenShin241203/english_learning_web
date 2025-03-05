const { json } = require('express');
const { default: aqp } = require('api-query-params');
const tokenPackage = require('../models/tokenPackage');

const getAllTokenPackageService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await tokenPackage.find(filter)
        .skip(offset)
        .limit(limit)
    return result;
}

const getTokenByIdService = async (id) => {
    try {
        let result = await tokenPackage.findById(id);
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createTokenPackageService = async (data) => {
    try {
        let result = await tokenPackage.create(data)
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const deleteTokenPackageService = async (id) => {
    try {
        let result = await tokenPackage.deleteOne({ _id: id });
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}
const updateTokenPackageService = async (data) => {
    try {
        let result = await tokenPackage.updateOne({ _id: data.id }, { ...data });
        return result;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = {
    getAllTokenPackageService, createTokenPackageService, deleteTokenPackageService,
    updateTokenPackageService, getTokenByIdService
};
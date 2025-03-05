const Course = require('../models/course');
const { json } = require('express');
const { default: aqp } = require('api-query-params');
const Chapter = require('../models/chapter');


const getAllCourseService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit, population } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Course.find(filter)
        .populate(population)
        .skip(offset)
        .limit(limit)
        .then(courses => courses.map(course => ({
            ...course.toObject(),
            totalChapter: course.chapterInfo.length,
            totalStudent: course.userInfo.length
        })))
    return result;
}

const getCourseByIdService = async (courseId) => {
    try {
        const course = await Course.findById(courseId).populate('chapterInfo')
        return course
    } catch (error) {
        console.log(error);
        return error
    }
}
const createCourseService = async (data) => {

    try {
        let result = await Course.create(data)
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createManyCourseService = async (arr) => {
    try {
        let result = await Course.insertMany(arr)
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const updateCourseService = async (data) => {
    try {
        let result = await Course.updateOne({ _id: data.id }, { ...data });
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const deleteCourseService = async (id) => {
    try {
        let result = await Course.deleteById(id);
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyCourse = async (arrId) => {
    try {
        let result = await Course.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}
module.exports = {
    createCourseService, getAllCourseService, createManyCourseService,
    updateCourseService, deleteCourseService, deleteManyCourse, getCourseByIdService
}
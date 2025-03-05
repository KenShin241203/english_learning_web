const { default: aqp } = require('api-query-params');
const { json } = require('express');
const Chapter = require('../models/chapter');
const Test = require('../models/test');

const getAllTestService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit, population } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Test.find(filter)
        .populate({
            path: 'chapterId',
            select: 'name && id && courseId',
            populate: {
                path: 'courseId',
                select: 'name'
            },
        })
        .skip(offset)
        .limit(limit)
        .then(tests => tests.map(test => ({
            ...test.toObject(),
            totalQuestion: test.questionInfo.length
        })));
    const formattedTests = result.map(test => ({
        _id: test._id,
        name: test.name,
        totalQuestion: test.totalQuestion,
        chapterId: test.chapterId ? test.chapterId._id : "Unknown",
        chapterName: test.chapterId ? test.chapterId.name : "Unknown",
        courseName: test.chapterId.courseId ? test.chapterId.courseId.name : "Unknown"
    }));
    return formattedTests;
}


const createTestService = async (data) => {
    try {
        let result = await Test.create(data);
        let chapter = await Chapter.findById({ _id: data.chapterId });
        if (!chapter) {
            return new Error('Course not found');
        }
        chapter.testInfo.push(result);
        await chapter.save();
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createManyTestService = async (testArrs) => {
    const savedTestArr = [];
    const chapterUpdates = {};
    for (const testData of testArrs) {
        const { chapterId, name } = testData;
        // Kiểm tra chapterId hợp lệ
        const chapter = await Chapter.findById(chapterId).populate('testInfo');
        if (!chapter) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }

        // Chuyển tên test hiện tại và tên test mới thành chữ in hoa
        const existingNamesUpper = chapter.testInfo.map((ts) => ts.name.toUpperCase());
        const newTestNameUpper = name.toUpperCase();

        // Kiểm tra trùng lặp tên chương
        if (existingNamesUpper.includes(newTestNameUpper)) {
            continue; // Bỏ qua chapter nếu tên trùng lặp
        }

        // Tạo test mới nếu không trùng
        const newTest = new Test(testData);
        const savedTest = await newTest.save();
        savedTestArr.push(savedTest);

        // Thêm test vào cập nhật chapter
        if (!chapterUpdates[chapterId]) {
            chapterUpdates[chapterId] = [];
        }
        chapterUpdates[chapterId].push(savedTest._id);
    }

    // Cập nhật các chapter với test mới
    for (const [chapterId, testIds] of Object.entries(chapterUpdates)) {
        await Chapter.findByIdAndUpdate(chapterId, {
            $push: { testInfo: { $each: testIds } }
        });
    }

    return savedTestArr;
}
const updateTestService = async (data) => {
    try {
        let result = await Test.updateOne({ _id: data.id }, { ...data });
        return result;
    } catch (error) {
        console.log(error);
        return error
    }
}
const updateManyTestService = async (testArr) => {
    const updatedTestArr = [];

    for (const test of testArr) {
        const { id, name, chapterId } = test;

        // Tìm chapter gốc từ database dựa trên id và courseId
        const existingTest = await Test.findById(id);
        if (!existingTest) {
            throw new Error(`Test with ID ${id} not found`);
        }

        // Kiểm tra khóa ngoại không bị thay đổi
        if (existingTest.chapterId.toString() !== chapterId) {
            throw new Error(`Cannot change chapterId for Test ID ${id}`);
        }

        // Lấy danh sách các lesson từ Chapter có chapterId tương ứng
        const chapter = await Chapter.findById(chapterId).populate('testInfo');
        if (!chapter) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }

        // Chuyển test name hiện tại và tên mới thành chữ in hoa
        const existingNamesUpper = chapter.testInfo.map((ts) => ts.name.toUpperCase());
        const newNameUpper = name.toUpperCase();

        // Kiểm tra xem name mới có trùng lặp không
        if (newNameUpper !== existingTest.name.toUpperCase() && existingNamesUpper.includes(newNameUpper)) {
            throw new Error(`Duplicate test name: ${name} already exists in chapter ${chapterId}`);
        }

        // Cập nhật lesson nếu các điều kiện trên thỏa mãn
        existingTest.name = name;
        existingTest.description = description;
        await existingTest.save();
        updatedTestArr.push(existingTest);
    }

    return updatedLessons;
}
const deleteTestService = async (id) => {
    try {
        let test = await Test.findById(id);
        let result = await Test.deleteById(id);
        await Chapter.findByIdAndUpdate(test.chapterId, {
            $pull: { testInfo: id }
        });
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyTest = async (arrId) => {
    try {
        let result = await Test.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}

module.exports = {
    createTestService, updateTestService, getAllTestService,
    deleteTestService, deleteManyTest, createManyTestService,
    updateManyTestService
}
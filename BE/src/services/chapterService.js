const { json } = require('express');
const Chapter = require('../models/chapter');
const Course = require('../models/course');
const User = require('../models/user');
const Progress = require('../models/progress');
const { default: aqp } = require('api-query-params');

const getAllChapterService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Chapter.find(filter)
        .populate({
            path: 'lessonInfo',
            select: 'name && chapterId'
        })
        .populate({
            path: 'testInfo',
            select: 'name && chapterId'
        })
        .skip(offset)
        .limit(limit)
        .exec();
    return result;
}


const getAllChaptersWithCourseName = async (queryString) => {
    const page = queryString.page;
    let { filter, limit } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    // Populate lấy tên course từ courseId của từng chapter
    const chapters = await Chapter.find(filter).populate({
        path: 'courseId',    // Trường có khóa ngoại (1-n) trỏ về model Course
        select: 'name && id',      // Chỉ lấy trường 'name' từ Course
    }).skip(offset).limit(limit).then(chapters => chapters.map(chapter => ({
        ...chapter.toObject(),
        totalLesson: chapter.lessonInfo.length,
        totalTest: chapter.testInfo.length
    })));
    // Định dạng dữ liệu để trả về courseName thay vì courseId
    const formattedChapters = chapters.map(chapter => ({
        _id: chapter._id,
        name: chapter.name,
        totalLesson: chapter.totalLesson,
        totalTest: chapter.totalTest,
        courseName: chapter.courseId ? chapter.courseId.name : "Unknown",
        courseId: chapter.courseId ? chapter.courseId._id : "Unknown"
    }));
    return formattedChapters
};
const createChapterService = async (data) => {
    try {
        let result = await Chapter.create(data);
        let course = await Course.findById({ _id: data.courseId });
        if (!course) {
            return new Error('Course not found');
        }
        course.chapterInfo.push(result);
        await course.save();
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}
const createManyChapterService = async (chapters) => {

    const savedChapters = [];
    const courseUpdates = {};

    for (const chapterData of chapters) {
        const { courseId, name } = chapterData;

        // Kiểm tra courseId hợp lệ
        const course = await Course.findById(courseId).populate('chapterInfo');
        if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
        }

        // Chuyển tên chương hiện tại và tên chương mới thành chữ in hoa
        const existingNamesUpper = course.chapterInfo.map((ch) => ch.name.toUpperCase());
        const newChapterNameUpper = name.toUpperCase();

        // Kiểm tra trùng lặp tên chương
        if (existingNamesUpper.includes(newChapterNameUpper)) {
            continue; // Bỏ qua chapter nếu tên trùng lặp
        }

        // Tạo chapter mới nếu không trùng
        const newChapter = new Chapter(chapterData);
        const savedChapter = await newChapter.save();
        savedChapters.push(savedChapter);

        // Thêm chapter vào cập nhật course
        if (!courseUpdates[courseId]) {
            courseUpdates[courseId] = [];
        }
        courseUpdates[courseId].push(savedChapter._id);
    }

    // Cập nhật các khóa học với chapter mới
    for (const [courseId, chapterIds] of Object.entries(courseUpdates)) {
        await Course.findByIdAndUpdate(courseId, {
            $push: { chapterInfo: { $each: chapterIds } }
        });
    }

    return savedChapters;
}

const updateChapterService = async (updatedData) => {
    const { chapterId, name, numOrder, courseId } = updatedData;

    // Kiểm tra sự tồn tại của chapter cần cập nhật
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
        throw new Error(`Chapter with ID ${chapterId} not found`);
    }

    // Kiểm tra courseId của chapter để đảm bảo không bị thay đổi
    if (chapter.courseId.toString() !== courseId) {
        throw new Error(`Cannot change courseId of an existing chapter.`);
    }

    // Kiểm tra sự tồn tại của course
    const course = await Course.findById(courseId).populate('chapterInfo');
    if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
    }

    // Chuyển đổi tên chương hiện tại và tên chương cập nhật thành chữ in hoa
    const existingNamesUpper = course.chapterInfo
        .filter((ch) => ch._id.toString() !== chapterId)  // Loại trừ chương hiện tại ra khỏi danh sách
        .map((ch) => ch.name.toUpperCase());
    const updatedNameUpper = name.toUpperCase();

    // Kiểm tra trùng lặp tên chương
    if (existingNamesUpper.includes(updatedNameUpper)) {
        throw new Error(`Chapter name "${name}" already exists in course ${courseId}`);
    }

    // Kiểm tra trùng lặp numOrder
    const existingNumOrders = course.chapterInfo
        .filter((ch) => ch._id.toString() !== chapterId)  // Loại trừ chương hiện tại ra khỏi danh sách
        .map((ch) => ch.numOrder);
    if (existingNumOrders.includes(numOrder)) {
        throw new Error(`Chapter number order "${numOrder}" already exists in course ${courseId}`);
    }

    // Cập nhật chapter nếu không có lỗi
    chapter.name = name;
    chapter.numOrder = numOrder;
    const updatedChapter = await chapter.save();

    return updatedChapter;
};


const updateManyChapterService = async (chapters) => {
    const updatedChapters = [];

    for (const chapter of chapters) {
        const { id, name, courseId } = chapter;

        // Tìm chapter gốc từ database dựa trên id và courseId
        const existingChapter = await Chapter.findById(id);
        if (!existingChapter) {
            throw new Error(`Chapter with ID ${id} not found`);
        }

        // Kiểm tra khóa ngoại không bị thay đổi
        if (existingChapter.courseId.toString() !== courseId) {
            throw new Error(`Cannot change courseId for Chapter ID ${id}`);
        }

        // Lấy danh sách các chapter từ Course có courseId tương ứng
        const course = await Course.findById(courseId).populate('chapterInfo');
        if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
        }

        // Chuyển chapter name hiện tại và tên mới thành chữ in hoa
        const existingNamesUpper = course.chapterInfo.map((ch) => ch.name.toUpperCase());
        const newNameUpper = name.toUpperCase();

        // Kiểm tra xem name mới có trùng lặp không
        if (newNameUpper !== existingChapter.name.toUpperCase() && existingNamesUpper.includes(newNameUpper)) {
            throw new Error(`Duplicate chapter name: ${name} already exists in course ${courseId}`);
        }

        // Cập nhật chapter nếu các điều kiện trên thỏa mãn
        existingChapter.name = name;
        await existingChapter.save();
        updatedChapters.push(existingChapter);
    }

    return updatedChapters;
}

const deleteChapterService = async (id) => {
    try {
        let chapter = await Chapter.findById(id);
        let result = await Chapter.deleteById(id);
        await Course.findByIdAndUpdate(chapter.courseId, {
            $pull: { chapterInfo: id }
        });
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyChapter = async (arrId) => {
    try {
        let result = await Chapter.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}

const unlockChapter = async (userId, courseId, chapterId) => {
    try {
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        }

        if (chapter.numOrder === 1) {
            return { success: true, message: 'Chapter with numOrder 1 is always unlocked', tokensRemaining: null };
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.tokens < 4) {
            return { success: false, message: 'Số token của bạn không đủ' };
        }

        user.tokens -= 4;
        await user.save();

        // Thêm chapter vào trường chapterProgress
        await Progress.findOneAndUpdate(
            { userId, courseId: chapter.courseId },
            {
                $addToSet: { chapterProgress: { chapterId, completedLessons: [] } },
                $set: { lastUpdated: new Date() },
            },
            { new: true, upsert: true }
        );

        return { success: true, message: 'Chapter unlocked successfully', tokensRemaining: user.tokens };
    } catch (error) {
        throw new Error('Lỗi khi mở khóa chương');
    }
};

module.exports = {
    createChapterService, updateChapterService, getAllChapterService,
    deleteChapterService, deleteManyChapter, createManyChapterService,
    updateManyChapterService, getAllChaptersWithCourseName, unlockChapter
}
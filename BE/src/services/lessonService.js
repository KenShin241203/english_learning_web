const { json } = require('express');
const { default: aqp } = require('api-query-params');
const Lesson = require('../models/lesson');
const Chapter = require('../models/chapter');

const getAllLessonService = async (queryString) => {
    const page = queryString.page;

    let { filter, limit, population } = aqp(queryString);

    delete filter.page;
    let offset = (page - 1) * limit;
    const lessons = await Lesson.find(filter)
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
        .then(lessons => lessons.map(lesson => ({
            ...lesson.toObject(),
            totalQuestion: lesson.questionInfo.length
        })));

    const formattedLessons = lessons.map(lesson => ({
        _id: lesson._id,
        name: lesson.name,
        totalQuestion: lesson.totalQuestion,
        chapterId: lesson.chapterId ? lesson.chapterId._id : "Unknown",
        chapterName: lesson.chapterId ? lesson.chapterId.name : "Unknown",
        courseName: lesson.chapterId.courseId ? lesson.chapterId.courseId.name : "Unknown"
    }));
    return formattedLessons;
}


const createLessonService = async (data) => {
    try {
        let result = await Lesson.create(data);
        let chapter = await Chapter.findById({ _id: data.chapterId });
        chapter.lessonInfo.push(result);
        await chapter.save();
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createManyLessonService = async (lessons) => {
    const savedLessons = [];
    const chapterUpdates = {};
    for (const lessonData of lessons) {
        const { chapterId, name } = lessonData;
        // Kiểm tra chapterId hợp lệ
        const chapter = await Chapter.findById(chapterId).populate('lessonInfo');
        if (!chapter) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }

        // Chuyển tên lesson hiện tại và tên lesson mới thành chữ in hoa
        const existingNamesUpper = chapter.lessonInfo.map((ls) => ls.name.toUpperCase());
        const newLessonNameUpper = name.toUpperCase();

        // Kiểm tra trùng lặp tên chương
        if (existingNamesUpper.includes(newLessonNameUpper)) {
            continue; // Bỏ qua chapter nếu tên trùng lặp
        }

        // Tạo lesson mới nếu không trùng
        const newLesson = new Lesson(lessonData);
        const savedLesson = await newLesson.save();
        savedLessons.push(savedLesson);

        // Thêm lesson vào cập nhật chapter
        if (!chapterUpdates[chapterId]) {
            chapterUpdates[chapterId] = [];
        }
        chapterUpdates[chapterId].push(savedLesson._id);
    }

    // Cập nhật các chapter với lesson mới
    for (const [chapterId, lessonIds] of Object.entries(chapterUpdates)) {
        await Chapter.findByIdAndUpdate(chapterId, {
            $push: { lessonInfo: { $each: lessonIds } }
        });
    }

    return savedLessons;
}

const updateLessonService = async (updatedData) => {
    const { id, name, chapterId } = updatedData;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
        throw new Error(`Lesson with ID ${id} not found`);
    }

    if (lesson.chapterId.toString() !== chapterId) {
        throw new Error(`Cannot change chapterId of an existing lesson.`);
    }

    const chapter = await Chapter.findById(chapterId).populate('lessonInfo');
    if (!chapter) {
        throw new Error(`Chapter with ID ${chapterId} not found`);
    }

    // Chuyển đổi tên chương hiện tại và tên chương cập nhật thành chữ in hoa
    const existingNamesUpper = chapter.lessonInfo
        .filter((ls) => ls._id.toString() !== id)  // Loại trừ lesson hiện tại ra khỏi danh sách
        .map((ls) => ls.name.toUpperCase());
    const updatedNameUpper = name.toUpperCase();


    if (existingNamesUpper.includes(updatedNameUpper))
        return null



    lesson.name = name;
    const updatedLessons = await lesson.save();

    return updatedLessons;
}
const updateManyLessonService = async (lessons) => {
    const updatedLessons = [];

    for (const lesson of lessons) {
        const { id, name, chapterId } = lesson;

        // Tìm chapter gốc từ database dựa trên id và courseId
        const existingLesson = await Lesson.findById(id);
        if (!existingLesson) {
            throw new Error(`Lesson with ID ${id} not found`);
        }

        // Kiểm tra khóa ngoại không bị thay đổi
        if (existingLesson.chapterId.toString() !== chapterId) {
            throw new Error(`Cannot change chapterId for Lesson ID ${id}`);
        }

        // Lấy danh sách các lesson từ Chapter có chapterId tương ứng
        const chapter = await Chapter.findById(chapterId).populate('lessonInfo');
        if (!chapter) {
            throw new Error(`Chapter with ID ${chapterId} not found`);
        }

        // Chuyển lesson name hiện tại và tên mới thành chữ in hoa
        const existingNamesUpper = chapter.lessonInfo.map((ls) => ls.name.toUpperCase());
        const newNameUpper = name.toUpperCase();

        // Kiểm tra xem name mới có trùng lặp không
        if (newNameUpper !== existingLesson.name.toUpperCase() && existingNamesUpper.includes(newNameUpper)) {
            throw new Error(`Duplicate lesson name: ${name} already exists in chapter ${chapterId}`);
        }

        // Cập nhật lesson nếu các điều kiện trên thỏa mãn
        existingLesson.name = name;
        await existingLesson.save();
        updatedLessons.push(existingLesson);
    }
    return updatedLessons;
}
const deleteLessonService = async (id) => {
    try {
        let lesson = await Lesson.findById(id);
        let result = await Lesson.deleteById(id);
        await Chapter.findByIdAndUpdate(lesson.chapterId, {
            $pull: { lessonInfo: id }
        });
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyLesson = async (arrId) => {
    try {
        let result = await Lesson.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}

module.exports = {
    createLessonService, updateLessonService, getAllLessonService,
    deleteLessonService, deleteManyLesson, createManyLessonService,
    updateManyLessonService
}
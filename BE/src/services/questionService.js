const Question = require('../models/question');
const Lesson = require('../models/lesson');
const Test = require('../models/test');
const { json } = require('express');
const { default: aqp } = require('api-query-params');

const getAllQuestionService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit, population } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Question.find(filter)
        .populate(population)
        .skip(offset)
        .limit(limit)
        .exec();
    return result;
}



const createQuestionForLessonService = async (questions) => {
    const savedQuestions = [];
    const lessonUpdates = {};

    for (const questionData of questions) {
        const { lessonId, name, type, description, translation, wordBank } = questionData;

        // Kiểm tra lesson có tồn tại không
        const lesson = await Lesson.findById(lessonId).populate('questionInfo');
        if (!lesson) throw new Error(`Lesson with Id ${lessonId} not found`);

        // Kiểm tra trùng lặp tên câu hỏi (case-insensitive)
        const existingNamesUpper = lesson.questionInfo.map((qs) => qs.name.toUpperCase());
        const newQuestionNameUpper = name.toUpperCase();
        if (existingNamesUpper.includes(newQuestionNameUpper)) continue;

        // Kiểm tra và xử lý theo loại câu hỏi
        if (type === 'multiple_choice') {
            if (!description) throw new Error('Multiple choice questions must have a description.');
        } else if (type === 'word_order') {
            if (!description) throw new Error('Word order questions must have a description.');
            if (!translation || !wordBank || wordBank.length === 0) {
                throw new Error('Word order questions must have translation and word bank.');
            }
        } else if (type === 'toeic') {
            if (!description) {
                throw new Error('Toeic questions must have a description.');
            }
        }
        else {
            throw new Error(`Unsupported question type: ${type}`);
        }

        // Tạo câu hỏi mới
        const newQuestion = new Question(questionData);
        const savedQuestion = await newQuestion.save();
        savedQuestions.push(savedQuestion);

        // Ghi nhận câu hỏi vào lesson updates
        if (!lessonUpdates[lessonId]) {
            lessonUpdates[lessonId] = [];
        }
        lessonUpdates[lessonId].push(savedQuestion._id);
    }

    // Cập nhật danh sách câu hỏi vào các lesson tương ứng
    for (const [lessonId, questionIds] of Object.entries(lessonUpdates)) {
        await Lesson.findByIdAndUpdate(lessonId, {
            $push: { questionInfo: { $each: questionIds } }
        });
    }

    return savedQuestions;
}
const createQuestionForTestService = async (questions) => {
    const savedQuestions = []
    const testUpdates = {}
    for (const questionData of questions) {
        const { testId, name } = questionData
        const test = await Test.findById(testId).populate('questionInfo')
        if (!test)
            throw new Error(`Test with ID ${testId} not found`)

        const existingNamesUpper = test.questionInfo.map((qs) => qs.name.toUpperCase())
        const newQuestionNameUpper = name.toUpperCase()

        if (existingNamesUpper.includes(newQuestionNameUpper))
            continue

        const newQuestion = new Question(questionData)
        const savedQuestion = await newQuestion.save()
        savedQuestions.push(savedQuestion)

        if (!testUpdates[testId])
            testUpdates[testId] = []

        testUpdates[testId].push(savedQuestion._id)
    }
    for (const [testId, questionIds] of Object.entries(testUpdates)) {
        await Test.findByIdAndUpdate(testId, {
            $push: { questionInfo: { $each: questionIds } }
        })
    }
    return savedQuestions
}

const updateQuestionService = async (data) => {
    try {
        let result = await Question.updateOne({ _id: data.id }, { ...data });
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const updateManyQuestionOnLessonService = async (questions) => {
    const updatedQuestions = [];
    for (const question of questions) {
        const { id, name, description, type, translation, wordBank, lessonId } = question;

        // Tìm câu hỏi hiện tại
        const existingQuestion = await Question.findById(id);
        if (!existingQuestion)
            throw new Error(`Question with Id ${id} not found`);

        if (existingQuestion.lessonId.toString() !== lessonId)
            throw new Error(`Cannot change lessonId for Question Id ${id}`);

        // Tìm bài học liên quan
        const lesson = await Lesson.findById(lessonId).populate('questionInfo');
        if (!lesson) {
            throw new Error(`Lesson with ID ${lessonId} not found`);
        }

        // Kiểm tra tên câu hỏi có trùng lặp hay không
        const existingNamesUpper = lesson.questionInfo.map((qs) => qs.name.toUpperCase());
        const newNameUpper = name.toUpperCase();

        if (
            newNameUpper !== existingQuestion.name.toUpperCase() &&
            existingNamesUpper.includes(newNameUpper)
        ) {
            throw new Error(`Duplicate question name: ${name} already exists in lesson ${lessonId}`);
        }

        // Xác thực và cập nhật trường `wordBank`
        if (!Array.isArray(wordBank)) {
            throw new Error(`wordBank must be an array for Question Id ${id}`);
        }
        existingQuestion.wordBank = wordBank;

        // Cập nhật các trường khác
        existingQuestion.name = name;
        existingQuestion.description = description;
        existingQuestion.type = type;
        existingQuestion.translation = translation;

        // Lưu lại câu hỏi
        await existingQuestion.save();
        updatedQuestions.push(existingQuestion);
    }
    return updatedQuestions;
};


const updateManyQuestionOnTestService = async (questions) => {
    const updatedQuestions = []

    for (const question of questions) {
        const { id, name, description, testId } = question

        const existingQuestion = await Question.findById(id)
        if (!existingQuestion)
            throw new Error(`Question with Id ${id} not found`)

        if (existingQuestion.testId.toString() !== testId)
            throw new Error(`Cannot change testId for Question Id ${id}`)

        const test = await Test.findById(testId).populate('questionInfo')
        if (!test) {
            throw new Error(`Test with ID ${testId} not found`)
        }

        const existingNamesUpper = test.questionInfo.map((qs) => qs.name.toUpperCase())
        const newNameUpper = name.toUpperCase()

        if (newNameUpper !== existingQuestion.name.toUpperCase() && existingNamesUpper.includes(newNameUpper))
            throw new Error(`Duplicate question name: ${name} already exists in test ${id}`)

        existingQuestion.name = name
        existingQuestion.description = description
        await existingQuestion.save()
        updatedQuestions.push(existingQuestion)
    }
    return updatedQuestions
}


const deleteQuestionService = async (id) => {
    try {
        let question = await Question.findById(id);
        let result = await Question.deleteById(id);
        await Lesson.findByIdAndUpdate(question.lessonId, {
            $pull: { questionInfo: id }
        });
        await Test.findByIdAndUpdate(question.testId, {
            $pull: { questionInfo: id }
        });
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyQuestion = async (arrId) => {
    try {
        let result = await Question.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}

module.exports = {
    createQuestionForLessonService, createQuestionForTestService, updateQuestionService,
    getAllQuestionService, deleteQuestionService, deleteManyQuestion,
    updateManyQuestionOnLessonService, updateManyQuestionOnTestService
}

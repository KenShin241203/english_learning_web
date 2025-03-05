const Question = require('../models/question');
const Answer = require('../models/answer');
const { json } = require('express');
const { default: aqp } = require('api-query-params');

const getAllAnswerService = async (queryString) => {
    const page = queryString.page;
    let { filter, limit, population } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await Answer.find(filter)
        .populate(population)
        .skip(offset)
        .limit(limit)
        .exec();
    return result;
}


const createAnswerService = async (data) => {
    try {
        let question = await Question.findById({ _id: data.questionId });
        let result = await Answer.create(data);
        if (!question) {
            return new Error('Question not found');
        }
        question.answerInfo.push(result);
        await question.save();
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const createManyAnswerService = async (answerArr) => {
    const savedAnswerArr = []
    const questionUpdates = {}

    for (const answerData of answerArr) {
        const { name, questionId } = answerData
        const question = await Question.findById(questionId).populate('answerInfo')
        if (!question)
            throw new Error(`Question with Id ${questionId} not found`)

        const existingNamesUpper = question.answerInfo.map((as) => as.name.toUpperCase())
        const newAnswerNameUpper = name.toUpperCase()

        if (existingNamesUpper.includes(newAnswerNameUpper))
            continue

        const newAnswer = new Answer(answerData)
        const saveAnswer = await newAnswer.save()
        savedAnswerArr.push(saveAnswer)

        if (!questionUpdates[questionId]) {
            questionUpdates[questionId] = [];
        }
        questionUpdates[questionId].push(saveAnswer._id)
    }
    for (const [questionId, answerIds] of Object.entries(questionUpdates)) {
        await Question.findByIdAndUpdate(questionId, {
            $push: { answerInfo: { $each: answerIds } }
        })
    }
    return savedAnswerArr
}

const updateManyAnswerService = async (answerArr) => {
    const updatedAnswerArr = []
    for (const answer of answerArr) {
        const { id, name, description, questionId } = answer

        const existingAnswer = await Answer.findById(id)
        if (!existingAnswer)
            throw new Error(`Answer with Id ${id} not found`)

        if (existingAnswer.questionId.toString() !== questionId)
            throw new Error(`Cannot change questionId for Answer Id ${id}`)

        const question = await Question.findById(questionId).populate('answerInfo')
        if (!question) {
            throw new Error(`Question with ID ${questionId} not found`)
        }

        const existingNamesUpper = question.answerInfo.map((as) => as.name.toUpperCase())
        const newNameUpper = name.toUpperCase()

        if (newNameUpper !== existingAnswer.name.toUpperCase() && existingNamesUpper.includes(newNameUpper))
            throw new Error(`Duplicate answer name: ${name} already exists in question ${id}`)

        existingAnswer.name = name
        existingAnswer.description = description
        await existingAnswer.save()
        updatedAnswerArr.push(existingAnswer)
    }
    return updatedAnswerArr
}
const updateAnswerService = async (data) => {
    try {
        let result = await Answer.updateOne({ _id: data.id }, { ...data });
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}



const deleteAnswerService = async (id) => {
    try {
        let answer = await Answer.findById(id);
        let result = await Answer.deleteById(id);
        await Question.findByIdAndUpdate(answer.questionId, {
            $pull: { answerInfo: id }
        });
        return result;
    } catch (error) {
        return error;
    }
}

const deleteManyAnswer = async (arrId) => {
    try {
        let result = await Answer.delete({ _id: { $in: arrId } });
        return result;
    } catch (error) {
        console.log('Error: ', error);
        return error;
    }
}

module.exports = {
    createAnswerService, updateAnswerService, getAllAnswerService,
    deleteAnswerService, deleteManyAnswer, createManyAnswerService,
    updateManyAnswerService
}
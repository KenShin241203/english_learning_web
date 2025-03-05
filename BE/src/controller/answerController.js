const { createAnswerService, updateAnswerService, getAllAnswerService, deleteAnswerService, deleteManyAnswer, createManyAnswerService, updateManyAnswerService } = require('../services/answerService');

const getAnswersApi = async (req, res) => {
    let result = await getAllAnswerService(req.query);
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: result
        })
    }
}

const postCreateManyAnswerApi = async (req, res) => {
    try {
        let result = await createManyAnswerService(req.body.answers);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const postCreateAnswerApi = async (req, res) => {
    let result = await createAnswerService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const updateManyAnswerApi = async (req, res) => {
    const answerArr = req.body.answers
    if (!Array.isArray(answerArr)) {
        return res.status(400).json({ success: false, message: "AnswerArr must be an array" });
    }

    try {
        const updatedAnswers = await updateManyAnswerService(answerArr);
        return res.status(200).json({ success: true, message: "Answers updated successfully", data: updatedAnswers });
    } catch (error) {
        console.error("Error updating Answers:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateAnswerApi = async (req, res) => {
    let result = await updateAnswerService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteAnswerApi = async (req, res) => {
    let result = await deleteAnswerService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyAnswerApi = async (req, res) => {
    let result = await deleteManyAnswer(req.body.answerArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = {
    getAnswersApi, postCreateAnswerApi, updateAnswerApi,
    deleteAnswerApi, deleteManyAnswerApi, postCreateManyAnswerApi,
    updateManyAnswerApi
}
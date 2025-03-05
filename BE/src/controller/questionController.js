const { createQuestionForLessonService, createQuestionForTestService, updateQuestionService, getAllQuestionService, deleteQuestionService, deleteManyQuestion, updateManyQuestionOnLessonService, updateManyQuestionOnTestService } = require('../services/questionService');
const Question = require('../models/question')
const translate = require('@vitalets/google-translate-api');

const translateDescriptionApi = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ success: false, message: 'Description is required' });
        }

        // Sử dụng thư viện để dịch
        const result = await translate(description, { from: 'vi', to: 'en' });

        // Trả về kết quả dịch
        res.status(200).json({ success: true, translation: result.text });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getQuestionsApi = async (req, res) => {
    let result = await getAllQuestionService(req.query);
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: result
        })
    }
}
const getQuestionsByLessonId = async (req, res) => {
    const { lessonId } = req.params;  // Lấy lessonId từ params

    try {
        const questions = await Question.find({ lessonId })
            .populate('answerInfo') // Populate trường answerInfo trong mỗi câu hỏi
            .exec();

        if (questions.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài học này' });
        }

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy câu hỏi' });
    }
};


const getQuestionsByTestId = async (req, res) => {
    const { testId } = req.params;  // Lấy testId từ params

    try {
        const questions = await Question.find({ testId })
            .populate('answerInfo') // Populate trường answerInfo trong mỗi câu hỏi
            .exec();

        if (questions.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài học này' });
        }

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy câu hỏi' });
    }
};
const getQuestionByIdApi = async (req, res) => {
    try {
        let result = await Question.findById(req.params.id).populate({
            path: 'answerInfo',
            select: 'name && description && correct'
        })

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
const postCreateQuestionForLessonApi = async (req, res) => {
    try {
        let result = await createQuestionForLessonService(req.body.questions);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const postCreateQuestionForTestApi = async (req, res) => {
    try {
        let result = await createQuestionForTestService(req.body.questions);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const updateQuestionApi = async (req, res) => {
    let result = await updateQuestionService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const updateManyQuestionOnLessonApi = async (req, res) => {
    const questions = req.body.questions
    if (!Array.isArray(questions)) {
        return res.status(400).json({ success: false, message: "Questions must be an array" });
    }

    try {
        const updatedQuestions = await updateManyQuestionOnLessonService(req.body.questions);
        return res.status(200).json({ success: true, message: "Questions updated successfully", data: updatedQuestions });
    } catch (error) {
        console.error("Error updating Questions:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateManyQuestionOnTestApi = async (req, res) => {
    const questions = req.body.questions
    if (!Array.isArray(questions)) {
        return res.status(400).json({ success: false, message: "Questions must be an array" });
    }

    try {
        const updatedQuestions = await updateManyQuestionOnTestService(req.body.questions);
        return res.status(200).json({ success: true, message: "Questions updated successfully", data: updatedQuestions });
    } catch (error) {
        console.error("Error updating Questions:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteQuestionApi = async (req, res) => {
    let result = await deleteQuestionService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyQuestionApi = async (req, res) => {
    let result = await deleteManyQuestion(req.body.chapterArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = {
    getQuestionsApi, postCreateQuestionForLessonApi, postCreateQuestionForTestApi,
    updateQuestionApi, deleteQuestionApi, deleteManyQuestionApi,
    updateManyQuestionOnLessonApi, updateManyQuestionOnTestApi, getQuestionByIdApi,
    getQuestionsByLessonId, getQuestionsByTestId, translateDescriptionApi
}
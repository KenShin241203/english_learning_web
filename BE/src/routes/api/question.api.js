const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');
//Question controller
const { getQuestionsApi, postCreateQuestionForLessonApi, postCreateQuestionForTestApi, updateQuestionApi, deleteQuestionApi, deleteManyQuestionApi,
    updateManyQuestionOnLessonApi, updateManyQuestionOnTestApi, getQuestionByIdApi,
    getQuestionsByLessonId,
    translateDescriptionApi } = require('../../controller/questionController');
//Validate Question
const validateQuestion = require('../../middleware/validate/validateQuestion');

//Question Api
routerApi.get('/questions', getQuestionsApi);
routerApi.get('/questions/:id', getQuestionByIdApi);
routerApi.get('/:lessonId/questions', verifyToken, getQuestionsByLessonId)
routerApi.post('/questions_lesson', verifyToken, authorizeRoles("admin"), postCreateQuestionForLessonApi);
routerApi.post('/questions_test', verifyToken, authorizeRoles("admin"), postCreateQuestionForTestApi);
routerApi.post('/translate_description', verifyToken, authorizeRoles("admin"), translateDescriptionApi)
routerApi.put('/questions', verifyToken, authorizeRoles("admin"), updateQuestionApi);
routerApi.put('/questions_lesson', verifyToken, authorizeRoles("admin"), updateManyQuestionOnLessonApi);
routerApi.put('/questions_test', verifyToken, authorizeRoles("admin"), updateManyQuestionOnTestApi);
routerApi.delete('/questions/:id', verifyToken, authorizeRoles("admin"), deleteQuestionApi);
routerApi.delete('/many_question', verifyToken, authorizeRoles("admin"), deleteManyQuestionApi);

module.exports = routerApi;
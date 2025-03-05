const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');

//Answer controller
const { getAnswersApi, postCreateAnswerApi, updateAnswerApi, deleteAnswerApi,
    deleteManyAnswerApi, postCreateManyAnswerApi, updateManyAnswerApi } = require('../../controller/answerController');

//Validate Answer
const validateAnswer = require('../../middleware/validate/validateAnswer');


//Answer Api
routerApi.get('/answers', getAnswersApi);
routerApi.post('/many_answer', verifyToken, authorizeRoles("admin"), postCreateManyAnswerApi);
routerApi.post('/answers', validateAnswer, verifyToken, authorizeRoles("admin"), postCreateAnswerApi);
routerApi.put('/answers', verifyToken, authorizeRoles("admin"), updateAnswerApi);
routerApi.put('/many_answer', verifyToken, authorizeRoles("admin"), updateManyAnswerApi);
routerApi.delete('/answers/:id', verifyToken, authorizeRoles("admin"), deleteAnswerApi);
routerApi.delete('/many_answer', verifyToken, authorizeRoles("admin"), deleteManyAnswerApi);

module.exports = routerApi;
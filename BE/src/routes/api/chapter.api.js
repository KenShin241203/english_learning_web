const express = require('express');
const routerApi = express.Router();
//Chapter controller
const { getChaptersApi, postCreateChapterApi, updateChapterApi, deleteChapterApi, deleteManyChapterApi, postCreateManyChapterApi,
    updateManyChapterApi, getChaptersWithCourseApi, getChapterWithLessonAndTestApi,
    unlockChapterApi } = require('../../controller/chapterController');
//Validate Chapter
const validateChapter = require('../../middleware/validate/validateChapter');

//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');
//Chapter Api
routerApi.get('/chapters', getChaptersApi);
routerApi.get('/chapters_course', getChaptersWithCourseApi);
routerApi.get('/chapter_less_test/:id', getChapterWithLessonAndTestApi);
routerApi.post('/chapters', validateChapter, verifyToken, authorizeRoles("admin"), postCreateChapterApi);
routerApi.post('/many_chapter', verifyToken, authorizeRoles("admin"), postCreateManyChapterApi);
routerApi.post('/unlock_chapter', verifyToken, unlockChapterApi);
routerApi.put('/chapters', verifyToken, authorizeRoles("admin"), updateChapterApi);
routerApi.put('/many_chapter', verifyToken, authorizeRoles("admin"), updateManyChapterApi);
routerApi.delete('/chapters/:id', verifyToken, authorizeRoles("admin"), deleteChapterApi);
routerApi.delete('/many_chapter', verifyToken, authorizeRoles("admin"), deleteManyChapterApi);

module.exports = routerApi;
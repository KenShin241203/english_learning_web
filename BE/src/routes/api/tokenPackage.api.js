const express = require('express');
const routerApi = express.Router();
//auth middleware 
const authorizeRoles = require('../../middleware/jwt/roleMiddleware')
const verifyToken = require('../../middleware/jwt/authMiddleware');


const { getTokenPackageApi, getTokenPackageByIdApi, deleteTokenPackageApi,
    updateTokenPackageApi, postCreateTokenPackageApi,
    getTokenPackWithoutPagination } = require('../../controller/tokenPackageController');

routerApi.get('/tokenPackage', verifyToken, getTokenPackageApi);
routerApi.get('/tokenPackage/:id', verifyToken, getTokenPackageByIdApi);
routerApi.get('/tokenPackage_without_pagin', verifyToken, getTokenPackWithoutPagination);
routerApi.post('/tokenPackage', verifyToken, authorizeRoles('admin'), postCreateTokenPackageApi);
routerApi.delete('/tokenPackage/:id', verifyToken, authorizeRoles('admin'), deleteTokenPackageApi);
routerApi.put('/tokenPackage', verifyToken, authorizeRoles('admin'), updateTokenPackageApi);

module.exports = routerApi;

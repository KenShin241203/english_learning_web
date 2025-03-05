const { getAllTokenPackageService, createTokenPackageService, deleteTokenPackageService,
    updateTokenPackageService, getTokenByIdService } = require('../services/tokenPackageService');
const TokenPackage = require('../models/tokenPackage');

const getTokenPackageApi = async (req, res) => {
    const totalDocuments = await TokenPackage.countDocuments();
    let current = req.query.page
    let limit = req.query.limit
    const totalPages = Math.ceil(totalDocuments / limit)
    let result = await getAllTokenPackageService(req.query);
    if (result) {
        return res.status(200).json({
            data: {
                meta: {
                    currentPage: current,
                    pageSize: limit,
                    totalPages: totalPages,
                    totalEntity: totalDocuments
                },
                result
            }
        })
    }
}
const getTokenPackWithoutPagination = async (req, res) => {
    let result = await TokenPackage.find();
    if (result) {
        return res.status(200).json({
            data: result
        })
    }
}

const getTokenPackageByIdApi = async (req, res) => {
    try {
        const result = await getTokenByIdService(req.params.id)
        res.status(200).json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const postCreateTokenPackageApi = async (req, res) => {
    let result = await createTokenPackageService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteTokenPackageApi = async (req, res) => {
    let result = await deleteTokenPackageService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const updateTokenPackageApi = async (req, res) => {
    let result = await updateTokenPackageService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = {
    getTokenPackageApi, postCreateTokenPackageApi, deleteTokenPackageApi,
    updateTokenPackageApi, getTokenPackageByIdApi, getTokenPackWithoutPagination
};
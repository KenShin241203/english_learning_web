
const { createPackageService, createManyPackageService, updatePackageService, getAllPackageService, deletePackageService, deleteManyPackageService } = require('../services/packageService');

const getPackagesApi = async (req, res) => {

    let result = await getAllPackageService(req.query);
    if (result) {
        return res.status(200).json({
            EC: 0,
            data: result
        })
    }
}

const postCreatePackageApi = async (req, res) => {
    let result = await createPackageService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const postCreateManyPackageApi = async (req, res) => {
    let result = await createManyPackageService(req.body.users);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const updatePackageApi = async (req, res) => {
    let result = await updatePackageService(req.body);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deletePackageApi = async (req, res) => {
    let result = await deletePackageService(req.params.id);
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const deleteManyPackageApi = async (req, res) => {
    let result = await deleteManyPackageService(req.body.packageArrIds)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

module.exports = { getPackagesApi, postCreatePackageApi, postCreateManyPackageApi, updatePackageApi, deletePackageApi, deleteManyPackageApi }
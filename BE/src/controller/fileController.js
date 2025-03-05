const { UploadSingleFile, UploadMultipleFile } = require('../services/fileService')

const postUploadSingleFileApi = async (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let result = await UploadSingleFile(req.files.image, req.headers)
    return res.status(200).json({
        errCode: 0,
        data: result
    })
}

const postUploadMultipleFileApi = async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No file were uploaded.')
    }

    if (Array.isArray(req.files.image)) {
        let result = await UploadMultipleFile(req.files.image);
        return res.status(200).json({
            errCode: 0,
            data: result
        })
    } else {
        return await UploadSingleFile(req, res)
    }
}

module.exports = { postUploadSingleFileApi, postUploadMultipleFileApi }

const path = require('path')
const UploadSingleFile = async (fileObject, headers) => {

    let uploadPath = path.resolve(__dirname, `../public/images/${headers.type}`);
    let extName = path.extname(fileObject.name);
    let baseName = path.basename(fileObject.name, extName);

    let finalName = `${baseName}-${Date.now()}${extName}`;
    let finalPath = `${uploadPath}/${finalName}`;
    try {
        await fileObject.mv(finalPath);
        return {
            status: 'success',
            path: finalName,
            error: null
        }
    } catch (error) {
        console.log(">>>check err:", error)
        return {
            status: 'failed',
            path: null,
            error: JSON.stringify(error)
        }
    }
}

const UploadMultipleFile = async (filesArr) => {
    try {
        let uploadPath = path.resolve(__dirname, "../public/images/avatar");
        let resultArr = [];
        let countSuccess = 0;
        for (i = 0; i < filesArr.length; i++) {
            let extName = path.extname(filesArr[i].name);
            let baseName = path.basename(filesArr[i].name, extName);

            let finalName = `${baseName}-${Date.now()}${extName}`;
            let finalPath = `${uploadPath}/${finalName}`;
            try {
                await filesArr[i].mv(finalPath);
                resultArr.push({
                    status: 'success',
                    path: finalName,
                    fileName: filesArr[i].name,
                    error: null
                });
                countSuccess++;
            } catch (error) {
                resultArr.push({
                    status: 'failed',
                    path: null,
                    fileName: filesArr[i].name,
                    error: JSON.stringify(error)
                })
            }
        }
        return {
            countSuccess: countSuccess,
            detail: resultArr
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = { UploadSingleFile, UploadMultipleFile }
const joi = require('joi')


const chapterSchema = joi.object({
    name: joi.string()
        .min(3)
        .max(30)
        .required(),
    totalLesson: joi.string(),
    totalTest: joi.string(),
    courseId: joi.string(),
    numOrder: joi.number()
})

const validateChapter = (req, res, next) => {
    const { error } = chapterSchema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.details.map(i => i.message),
            statusCode: error.statusCode
        })
    }
    next()
}

module.exports = validateChapter
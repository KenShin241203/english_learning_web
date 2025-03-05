const joi = require('joi')

const questionSchema = joi.object({
    name: joi.string()
        .min(3)
        .max(30)
        .required(),
    description: joi.string(),
    lessonId: joi.string(),
    testId: joi.string()
})

const validateQuestion = (req, res, next) => {
    const { error } = questionSchema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.details.map(i => i.message),
            statusCode: 400
        })
    }
    next()
}

module.exports = validateQuestion
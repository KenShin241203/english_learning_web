const joi = require('joi')

const testSchema = joi.object({
    name: joi.string()
        .min(3)
        .max(30)
        .required(),
    test_Time: joi.string().required(),
    total_Question: joi.string().required(),
    chapterId: joi.string().required()
})

const validateTest = (req, res, next) => {
    const { error } = testSchema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.details.map(i => i.message),
            statusCode: 400
        })
    }
    next()
}

module.exports = validateTest
const joi = require('joi')

const answerSchema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    correct: joi.boolean().required(),
    questionId: joi.string().required()
})

const validateAnswer = (req, res, next) => {
    const { error } = answerSchema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.details.map(i => i.message),
            statusCode: 400
        })
    }
    next()
}

module.exports = validateAnswer
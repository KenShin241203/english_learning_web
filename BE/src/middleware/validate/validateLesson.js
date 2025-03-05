const joi = require('joi')

const lessonSchema = joi.object({
    name: joi.string()
        .min(3)
        .max(30)
        .required().messages({
            'string.base': `Name should be a type of 'text'`,
            'string.empty': `Name cannot be an empty field`,
            'any.required': `Name is a required field`
        }),
    total_Question: joi.string().required().messages({
        'string.base': `total_Question should be a type of 'text'`,
        'string.empty': `total_Question cannot be an empty field`,
        'any.required': `total_Question is a required field`
    }),
    chapterId: joi.string()
}).options({ abortEarly: false })

const lessonValidate = (req, res, next) => {
    const { error } = lessonSchema.validate(req.body)
    if (error) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.details.map(i => i.message),
            statusCode: 400
        })
    }
    next()
}

module.exports = lessonValidate
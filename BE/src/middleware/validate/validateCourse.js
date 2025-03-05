const joi = require('joi')

const courseSchema = joi.object({
    type: joi.string(),
    name: joi.string()
        .min(3)
        .max(30)
        .required(),
    totalTime: joi.string().required(),
    totalChapter: joi.string(),
    totalStudent: joi.string(),
    totalStar: joi.number(),
    avatar: joi.string(),
    price: joi.number()
})

const validateCourse = (req, res, next) => {
    const { error } = courseSchema.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400).json({
            error: "Bad Request",
            message: error.message,
            statusCode: 400
        })
    }
    next()
}

module.exports = validateCourse
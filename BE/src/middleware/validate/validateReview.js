const joi = require("joi")

const reviewSchema = joi.object({
    userId: joi.string().required(),
    numberStar: joi.number().required(),
    content: joi.string().required()
})

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, { abortEarly: false });
    if (error) {

        return res.status(400).json(
            {
                error: "Bad Request",
                message: error.details.map(i => i.message),
                statusCode: 400
            }
        )
    }
    next()
}
module.exports = validateReview
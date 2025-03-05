const joi = require("joi")

const packageSchema = joi.object({
    type: joi.string().required(),
    name: joi.string()
        .min(3)
        .max(30)
        .required(),
    price: joi.string().required(),
    description: joi.string(),
    startDate: joi.date().greater('now').required(),
    endDate: joi.date().greater(joi.ref('startDate')).required()
})

const validatePackage = (req, res, next) => {
    const { error } = packageSchema.validate(req.body, { abortEarly: false });
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
module.exports = validatePackage
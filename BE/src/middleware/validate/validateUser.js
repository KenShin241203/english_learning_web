const joi = require("joi")

const userSchema = joi.object({
    name: joi.string()
        .min(3)
        .max(30)
        .required(),
    password: joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: joi.ref('password'),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    address: joi.string(),
    phone: joi.string().required().pattern(new RegExp('^[0-9]{10,11}$')),
    avatar: joi.string()
})

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
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
module.exports = validateUser

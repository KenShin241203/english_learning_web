const User = require('../models/user')

const jwt = require('jsonwebtoken')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const login = async (email, password, ms) => {
    await delay(ms);
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Email not found!!!')
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new Error('Invalid Password')
    }
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return { accessToken, user }
}

module.exports = { login }
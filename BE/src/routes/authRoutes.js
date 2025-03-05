const express = require('express')
const route = express.Router()
const { register, login, verifyCode, forgotPassword, resetPassword } = require("../controller/authController")
//middleware
const verifyToken = require('../middleware/jwt/authMiddleware')
const validateUser = require('../middleware/validate/validateUser')



route.post("/register", validateUser, register)
route.post("/verify_code", verifyCode)
route.post("/login", login)

route.post('/forgot_password', forgotPassword)
route.post('/reset_password', resetPassword)

//getAccount Api
route.get('/get_account', verifyToken, (req, res) => {
    const user = req.user
    res.status(200).json({ success: true, data: user });
})

// //logoutApi
route.post('/logout', (req, res) => {
    return res.status(200).json({
        statusCode: 200,
        data: "Logout success"
    })
})
module.exports = route
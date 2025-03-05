const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const PendingUser = require('../models/pendingUser')
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Kiểm tra nếu email đã tồn tại trong PendingUser hoặc User
        const existingPendingUser = await PendingUser.findOne({ email });
        if (existingPendingUser) {
            return res.status(400).json({ message: 'Email is already pending verification' });
        }

        // Tạo mã xác nhận
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút hết hạn

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu thông tin tạm thời vào PendingUser
        const pendingUser = new PendingUser({
            name,
            email,
            password: hashedPassword,
            phone,
            verificationCode,
            verificationCodeExpires,
        });

        await pendingUser.save();


        // Gửi mã xác nhận qua email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dntv2412@gmail.com', // Email của bạn
                pass: 'xxnm blml xeym ycln', // Mật khẩu email
            },
        });

        const mailOptions = {
            from: 'dntv2412@gmail.com',
            to: email,
            subject: 'Email Verification Code',
            text: `Your verification code is: ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Verification code sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Tìm người dùng với email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo mã xác nhận
        const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const resetCodeExpires = new Date(Date.now() + 60 * 1000); // 60 giây hết hạn

        // Cập nhật thông tin người dùng với mã xác nhận
        user.resetCode = resetCode;
        user.resetCodeExpires = resetCodeExpires;
        await user.save();

        // Gửi mã xác nhận qua email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dntv2412@gmail.com',
                pass: 'xxnm blml xeym ycln',
            },
        });

        const mailOptions = {
            from: 'dntv2412@gmail.com',
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetCode}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset code sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        // Tìm người dùng với email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra mã xác nhận
        if (user.resetCode !== resetCode) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (new Date() > user.resetCodeExpires) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


const verifyCode = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Tìm thông tin đăng ký tạm thời
        const pendingUser = await PendingUser.findOne({ email });
        if (!pendingUser) {
            return res.status(404).json({ message: 'No pending registration found for this email' });
        }

        // Kiểm tra mã xác nhận
        if (pendingUser.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (new Date() > pendingUser.verificationCodeExpires) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        // Tạo tài khoản chính thức
        const newUser = new User({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phone: pendingUser.phone,
            role: 'user', // Mặc định role là user
        });

        await newUser.save();

        // Xóa bản ghi trong PendingUser
        await PendingUser.deleteOne({ email });

        res.status(201).json({ message: 'Account verified and created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} not found`
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentails'
            })
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN })
        res.status(201).json({
            accessToken: token,
            data: user
        })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }

}
module.exports = { register, verifyCode, login, forgotPassword, resetPassword }
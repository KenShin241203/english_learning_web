
const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const bcrypt = require('bcryptjs');
const userScheme = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: { type: String, required: true },
    address: String,
    phone: String,
    avatar: { type: String, default: 'anonymous.jpg' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    courseInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course', default: [] }],
    reviewInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review', default: [] }],
    likedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review', default: [] }],
    dislikedReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review', default: [] }],
    tokens: { type: Number, default: 0 },
    resetCode: String,
    resetCodeExpires: Date,
}, { timestamps: true })

// userScheme.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// userScheme.methods.comparePassword = function (password) {
//     if (!password || !this.password) {
//         throw new Error("Password missing for comparison");
//     }
//     return bcrypt.compare(password, this.password);
// }

userScheme.plugin(mongoose_delete, { overrideMethods: 'all' });
const User = mongoose.model('user', userScheme);
module.exports = User;
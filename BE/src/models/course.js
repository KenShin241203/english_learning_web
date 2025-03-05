const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

const courseScheme = new mongoose.Schema({
    name: String,
    totalTime: String,
    totalChapter: String,
    totalStudent: String,
    totalStar: Number,
    avatar: {
        type: String,
        default: 'unvailable.jpg'
    },
    userInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    chapterInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chapter', default: [] }],
    reviewInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review', default: [] }],
    price: { type: Number, default: 0 }
}, { timestamps: true })

courseScheme.plugin(mongoose_delete, { overrideMethods: 'all' });
const Course = mongoose.model('course', courseScheme);
module.exports = Course;
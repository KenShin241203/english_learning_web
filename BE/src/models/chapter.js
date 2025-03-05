const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const chapterSchema = new mongoose.Schema({
    name: String,
    totalLesson: String,
    totalTest: String,
    numOrder: Number,
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    testInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'test', default: [] }],
    lessonInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'lesson', default: [] }]
}, { timestamps: true })

chapterSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Chapter = mongoose.model('chapter', chapterSchema);
module.exports = Chapter;
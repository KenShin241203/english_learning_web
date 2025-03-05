const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const lessonSchema = new mongoose.Schema({
    name: String,
    total_Question: String,
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'chapter' },
    questionInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'question' }]
}, { timestamps: true })

lessonSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Lesson = mongoose.model('lesson', lessonSchema);
module.exports = Lesson;
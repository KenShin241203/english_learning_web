const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

const questionSchema = new mongoose.Schema({
    name: String,
    description: String,
    translation: String,
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'lesson' },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'test' },
    type: { type: String, enum: ['multiple_choice', 'word_order', 'toeic'], default: 'multiple_choice' }, // Loại câu hỏi
    wordBank: { type: [String], default: [] },
    answerInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'answer' }]
})

questionSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Question = mongoose.model('question', questionSchema);
module.exports = Question;
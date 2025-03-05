const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const Question = require('./question');
const { name } = require('ejs');

const answerSchema = new mongoose.Schema({
    name: String,
    description: String,
    correct: Boolean,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' }
})

answerSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Answer = mongoose.model('answer', answerSchema);
module.exports = Answer;
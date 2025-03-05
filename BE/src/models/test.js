const { name } = require('ejs');
const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const testSchema = new mongoose.Schema({
    name: String,
    test_Time: String,
    total_Question: String,
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'chapter' },
    questionInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'question' }]
}, { timestamps: true })

testSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Test = mongoose.model('test', testSchema);
module.exports = Test;
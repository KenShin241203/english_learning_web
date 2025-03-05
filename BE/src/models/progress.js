const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
    chapterProgress: [
        {
            chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'chapter' },
            completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'lesson' }]
        }
    ],
    lastUpdated: { type: Date, default: Date.now }
});

progressSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Progress = mongoose.model('progress', progressSchema);
module.exports = Progress;
const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    rating: { type: Number, default: 0 },
    content: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    adminResponse: { type: String, default: '' }
}, { timestamps: true })

reviewSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
const Review = mongoose.model('review', reviewSchema);
module.exports = Review;
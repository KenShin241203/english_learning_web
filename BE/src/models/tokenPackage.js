const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

const tokenPackageScheme = new mongoose.Schema({
    name: String,
    price: { type: Number, default: 0 },
    token: Number
}, { timestamps: true })

tokenPackageScheme.plugin(mongoose_delete, { overrideMethods: 'all' });
const TokenPackage = mongoose.model('tokenPackage', tokenPackageScheme);
module.exports = TokenPackage;
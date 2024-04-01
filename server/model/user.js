const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');
const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        sdt: { type: String, required: true, unique: true },
        date: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
    },
    { timestamps: true },
);
UserSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
module.exports = mongoose.model('User', UserSchema);

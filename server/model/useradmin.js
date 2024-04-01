const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');
const UseradSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true },
);
UseradSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
module.exports = mongoose.model('Userad', UseradSchema);

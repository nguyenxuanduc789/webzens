const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

const DiscountCodeSchema = new Schema(
    {
        discountCode: { type: String, default: null },
        ischeck: {
            type: Boolean,
            default: false,
        },
        nameproduct: [
            {
                username: { type: String, default: null },
                name: [{ type: String, required: true }],
            },
        ],
        pricecound: { type: Number, required: true },
        quantity: { type: Number, required: true },
    },
    { timestamps: true },
);

DiscountCodeSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Discount', DiscountCodeSchema);

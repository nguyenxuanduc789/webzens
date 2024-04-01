const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

const PriceSchema = new Schema({
    size: { type: String, required: true },
    price: { type: Number, required: true },
});

const ProductSchema = new Schema({
    name: { type: String, required: true },
    prices: { type: [PriceSchema], required: true },
    image: { type: String, required: true },
    rating: { type: Number, required: true },
    description: { type: String, required: true },
    included: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
    categoryId: { type: Number, required: true },
});

ProductSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Product', ProductSchema);

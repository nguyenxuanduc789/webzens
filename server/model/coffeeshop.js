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
    description: { type: String, required: true },
    included: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});
const CoffeeshopSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        usernameshop: { type: String, required: true, unique: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        total: { type: Number, required: true },
        products: { type: [ProductSchema], required: true },
    },
    { timestamps: true },
);

CoffeeshopSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
module.exports = mongoose.model('Coffeeshop', CoffeeshopSchema);

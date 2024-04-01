const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');

// Define the product schema
const productSchema = new Schema({
    username: { type: String, default: '', unique: true }, // Set default value to an empty string
    nameproduct: [
        {
            name: { type: String, required: true },
            size: [{ type: String, required: true }],
            price: { type: Number, required: true },
        },
    ],
    totalproduct: { type: Number, required: true },
    categoryId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    img: [{ type: String, required: true }],
    age: { type: Number, required: true },
    gender: { type: String, required: true },
});

// Define the order schema with productSchema as a nested schema
const OrderSchema = new Schema(
    {
        total: { type: Number, required: true },
        products: [productSchema],
        tablenumber: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        img: { type: String, required: true },
        broughtout: { type: Boolean },
        floor: { type: Number, required: true },
        imgqr: { type: String, required: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

// Add mongoose-delete plugin to enable soft deletes
OrderSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });

// Create and export the Order model
module.exports = mongoose.model('Order', OrderSchema);

const Product = require('../model/product');
const Comment = require('../model/product');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');
exports.destroy = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await Product.findByIdAndRemove({ _id: formattedId });

        if (result.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Product restored successfully',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Error restoring product',
        });
    }
};

exports.GetProductdelete = async (req, res) => {
    try {
        const deletedProducts = await Product.findDeleted();
        res.json(deletedProducts);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deleted products',
        });
    }
};
exports.RestoreProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await Product.restore({ _id: formattedId });

        if (result.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Product restored successfully',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Error restoring product',
        });
    }
};

exports.DeleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();
        const deletedAt = new Date();
        // Use updateMany to mark the product as deleted
        const result = await Product.updateMany(
            { _id: formattedId },
            { $set: { deleted: true, deletedAt: deletedAt } },
        );
        console.log(deletedAt);
        if (result.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting product',
        });
    }
};

exports.LikeProduct = async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 }, updateAt: Date.now() }, { new: true }).catch(
        (err) => {
            return res.status(400).json({
                success: false,
                message: 'error updating likes',
            });
        },
    );
};
exports.getLike = async (req, res) => {
    const data = await Product.find();
    res.json({
        success: true,
        data: data.map((product) => ({
            _id: product._id,
            name: product.name,
            img: product.img,
            likes: product.likes,
            updateAt: product.updateAt,
            status: product.status,
        })),
    });
};

exports.PostProduct = async (req, res) => {
    const { name, prices, image, rating, description, included, categoryId } = req.body;

    // Check if prices is an array and each item has size and price properties
    if (!Array.isArray(prices) || prices.some((item) => !item.size || !item.price)) {
        return res.status(400).json({ error: 'Prices array is invalid' });
    }

    // Create a new product instance
    const newProduct = new Product({
        name,
        prices,
        image,
        rating: 3, // You may want to use the provided rating value
        description,
        included,
        categoryId,
    });

    try {
        // Save the product to the database
        const savedProduct = await newProduct.save();
        // Respond with the saved product data
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.GetProduct = async (req, res) => {
    const data = await Product.find();
    res.json(data);
};

exports.Searchproduct = async (req, res) => {
    try {
        const searchQuery = req.query.q; // Get the search query from the URL parameters
        if (!searchQuery) {
          return res.status(400).json({ error: 'Search query is required.' });
        }
    
        // Use a case-insensitive regular expression to search for products by name
        const regex = new RegExp(searchQuery, 'i');
        const products = await Product.find({ name: regex });
    
        res.json({ results: products });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
      }
};
exports.GetProductid = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
};

exports.EditProduct = async (req, res) => {
    try {
        const data = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.AddCMproduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).exec();
        if (!req.body.content) {
            res.status(400).send({ message: 'Content is required.' });
        } else {
            product.comments.push({
                author: req.body.author,
                content: req.body.content,
            });

            const savedProduct = await product.save();
            res.send(savedProduct);
        }
    } catch (err) {
        res.status(500).send(err);
    }
};
exports.getCMproduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate('comments');
        res.json(product.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

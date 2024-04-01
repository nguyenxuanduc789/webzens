const router = require('express').Router();
const User = require('../model/user');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const secret = 'mysecret';
const Discount = require('../model/discount');
const paypal = require('paypal-rest-sdk');
const moment = require('moment-timezone');
paypal.configure({
    mode: 'sandbox', // Chế độ sandbox cho môi trường phát triển, chuyển thành 'live' trong môi trường sản phẩm thực
    client_id: 'Acoy1LSwh_eUjhKTb2PIBreXCGQEYW39ELKHgve4-AA8C4P23Gm8iPTk0nqBKC-kCwFEylSVuHlV1UpI',
    client_secret: 'EAQXgiFzv9B0_JhBYRiGu1RUeBbaoMgQaYKxL_3v0zUOpaVH04DZw5B_y1BXk1qwqW_0cwP7VJauFT2V',
});
const crypto = require('crypto');
router.post('/create-discount', async (req, res) => {
    try {
        // Extract the username from the authenticated user or session
        // Replace this with your actual logic to get the username

        const { pricecound, quantity } = req.body;

        // Generate a random 4-digit alphanumeric key followed by 3 characters for discountCode
        const discountCode = generateRandomKey(4) + generateRandomCharacters(3);

        const newDiscount = new Discount({
            discountCode,
            ischeck: true,
            pricecound,
            quantity,
        });

        await newDiscount.save();

        res.status(200).json({ message: 'Thêm mã giảm giá thành công.' });
    } catch (error) {
        console.error('Lỗi khi thêm mã giảm giá:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

// Function to generate a random alphanumeric key of a given length
function generateRandomKey(length) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

// Function to generate a random string of alphabetic characters of a given length
function generateRandomCharacters(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

router.post('/update-discount', async (req, res) => {
    try {
        // Extract the username from the authenticated user or session
        const username = 'text'; // Replace this with your actual logic to get the username

        const { discountCode, pricecound, quantity } = req.body;

        // Find the existing discount for the specified username
        const existingDiscount = await Discount.findOne({ username });

        // If the discount doesn't exist, return an error
        if (!existingDiscount) {
            return res.status(404).json({ error: 'Không tìm thấy mã giảm giá.' });
        }

        // Update the discount details
        existingDiscount.discountCode = discountCode;
        existingDiscount.pricecound = pricecound;
        existingDiscount.quantity = quantity;

        // Save the updated discount
        await existingDiscount.save();

        res.status(200).json({ message: 'Cập nhật mã giảm giá thành công.' });
    } catch (error) {
        console.error('Lỗi khi cập nhật mã giảm giá:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});
//Deleteaccount -- thung rac
router.delete('/deleteaccount/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();
        const deletedAt = new Date();
        // Use updateMany to mark the product as deleted
        const result = await Discount.updateMany(
            { _id: formattedId },
            { $set: { deleted: true, deletedAt: deletedAt } },
        );
        console.log(result.nModified);
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
});
// New route for searching discounts by discountCode
router.post('/search-discount', async (req, res) => {
    try {
        const { discountCode } = req.body;

        // Find the discount with the given discountCode
        const foundDiscount = await Discount.findOne({ discountCode });

        if (foundDiscount) {
            // Decrement the quantity field by 1
            foundDiscount.quantity -= 1;

            // Update the nameproduct array (assuming you have the required data in req.body)
            const { username, name } = req.body;
            foundDiscount.nameproduct.push({ username, name });

            // Save the updated discount to the database
            await foundDiscount.save();

            res.status(200).json({ message: 'Mã giảm giá được tìm thấy.', discount: foundDiscount });
        } else {
            res.status(404).json({ error: 'Không tìm thấy mã giảm giá.' });
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm mã giảm giá:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});
//restore
router.post('/restoreuser/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await Discount.restore({ _id: formattedId });

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
});
// delete  vv
router.delete('/deletevv/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await Discount.findByIdAndRemove({ _id: formattedId });

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
});
router.get('/getall', async (req, res) => {
    const data = await Discount.find();
    res.json(data);
});
router.get('/getalldl', async (req, res) => {
    try {
        const deletedProducts = await Discount.findDeleted();
        res.json(deletedProducts);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deleted products',
        });
    }
});
module.exports = router;

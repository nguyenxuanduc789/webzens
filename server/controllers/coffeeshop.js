const router = require('express').Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Coffeeshop = require('../model/coffeeshop');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const secret = 'mysecret';
const Product = require('../model/product');
const paypal = require('paypal-rest-sdk');
const moment = require('moment-timezone');
// Cấu hình PayPal
paypal.configure({
    mode: 'sandbox',
    client_id: 'Acoy1LSwh_eUjhKTb2PIBreXCGQEYW39ELKHgve4-AA8C4P23Gm8iPTk0nqBKC-kCwFEylSVuHlV1UpI',
    client_secret: 'EAQXgiFzv9B0_JhBYRiGu1RUeBbaoMgQaYKxL_3v0zUOpaVH04DZw5B_y1BXk1qwqW_0cwP7VJauFT2V',
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

// Khởi tạo middleware multer với lưu trữ đã cấu hình
const upload = multer({ storage });

// Route để xử lý yêu cầu tải lên tệp
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }
    res.send('File uploaded successfully.');
});
router.get('/getallimages', (req, res) => {
    const uploadDirectory = 'uploads/';

    fs.readdir(uploadDirectory, (err, files) => {
        if (err) {
            console.error('Error reading upload directory:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const imageUrls = files.map((file) => {
            return `${req.protocol}://${req.get('host')}/${uploadDirectory}${file}`;
        });
        res.json({ success: true, images: imageUrls });
    });
});
router.post('/addproduct', upload.single('image'), async (req, res) => {
    const { usernameshop, product } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        const coffeeShop = await Coffeeshop.findOne({ usernameshop });
        if (!coffeeShop) {
            console.log('Coffee shop not found');
            return res.status(404).json({ success: false, message: 'Coffee shop not found' });
        }
        // Create a new Product object with information from the request
        const newProduct = new Product({
            name: product.name,
            prices: product.prices,
            image: req.file.path, // Save the image URL from the request to the image field of the product
            description: product.description,
            included: product.included,
        });

        // Add the new product to the coffee shop's products array
        coffeeShop.products.push(newProduct);

        // Save the updated coffee shop
        const updatedCoffeeShop = await coffeeShop.save();

        // Define imageUrl as req.file.path
        const imageUrl = req.file.path;

        // Return success message along with the uploaded image URL
        res.json({ success: true, coffeeShop: updatedCoffeeShop, imageUrl });
    } catch (err) {
        console.error('Error:', err); // Log the specific error
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/addshop', async (req, res) => {
    const { usernameshop, latitude, longitude, total } = req.body;
    try {
        const newCoffeeShop = new Coffeeshop({
            usernameshop,
            latitude,
            longitude,
            total: 0,
        });
        const savedCoffeeShop = await newCoffeeShop.save();

        res.json({ success: true, coffeeShop: savedCoffeeShop });
    } catch (err) {
        res.status(500).json(err);
    }
});

//login shop
router.post('/login', async (req, res) => {
    try {
        const user = await Coffeeshop.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: 'Email or password is incorrect1' });

        // Check password
        const pass = await Coffeeshop.findOne({ password: req.body.password });
        if (!pass) return res.status(400).json({ message: 'Email or password is incorrect 2' });
        console.log(user.isAdmin);
        if (!user.isAdmin) {
            // const { age, gender } = user;
            return res.json({ message: 'thanh cong 1', age, gender });
        } else {
            res.json('thanh cong 2');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Route to update usernameshop by usernameshop
router.put('/edits/:usernameshop/usernameshop', async (req, res) => {
    try {
        const { usernameshop } = req.params;
        const { newUsernameShop } = req.body;
        console.log(usernameshop);
        console.log(newUsernameShop);
        // Find the Coffeeshop by usernameshop and update the usernameshop
        const updatedCoffeeshop = await Coffeeshop.findOneAndUpdate(
            { usernameshop },
            { usernameshop: newUsernameShop },
            { new: true },
        );
        if (!updatedCoffeeshop) {
            return res.status(404).json({ message: 'Coffeeshop not found' });
        }

        return res.json(updatedCoffeeshop);
    } catch (error) {
        console.error('Error updating usernameshop:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update latitude and longitude by usernameshop
router.put('/editlocation/:usernameshop/location', async (req, res) => {
    try {
        const { usernameshop } = req.params;
        const { latitude, longitude } = req.body;

        // Find the Coffeeshop by usernameshop and update the latitude and longitude
        const updatedCoffeeshop = await Coffeeshop.findOneAndUpdate(
            { usernameshop },
            { latitude, longitude },
            { new: true },
        );

        if (!updatedCoffeeshop) {
            return res.status(404).json({ message: 'Coffeeshop not found' });
        }

        return res.json(updatedCoffeeshop);
    } catch (error) {
        console.error('Error updating location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getall', async (req, res) => {
    const data = await Coffeeshop.find();
    res.json(data);
});
module.exports = router;

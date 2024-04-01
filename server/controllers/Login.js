const router = require('express').Router();
const User = require('../model/user');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const secret = 'mysecret';
const Product = require('../model/product');
const paypal = require('paypal-rest-sdk');
const moment = require('moment-timezone');
paypal.configure({
    mode: 'sandbox', // Chế độ sandbox cho môi trường phát triển, chuyển thành 'live' trong môi trường sản phẩm thực
    client_id: 'Acoy1LSwh_eUjhKTb2PIBreXCGQEYW39ELKHgve4-AA8C4P23Gm8iPTk0nqBKC-kCwFEylSVuHlV1UpI',
    client_secret: 'EAQXgiFzv9B0_JhBYRiGu1RUeBbaoMgQaYKxL_3v0zUOpaVH04DZw5B_y1BXk1qwqW_0cwP7VJauFT2V',
});
const Coffeeshop = require('../model/coffeeshop');
//REGISTER ADMIN
router.post('/registeradmin', async (req, res) => {
    const { username, email, password } = req.body;
    const Users = new User({
        username,
        email,
        password,
        isAdmin: true,
        checkpayment: false,
    });
    try {
        const data = await Users.save();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
//LOGIN ADMIN
router.post('/loginadmin', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: 'Email or password is incorrect' });

        // Check password
        const pass = await User.findOne({ password: req.body.password });
        if (!pass) return res.status(400).json({ message: 'Email or password is incorrect' });
        if (user.isAdmin) {
            return res.status(401).json({ message: 'You do not have access' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(500).json(err);
    }
});

//REGISTER USER
router.post('/register', async (req, res) => {
    const { username, sdt, password, gender, age } = req.body;
    const Users = new User({
        username,
        email: 'a',
        password,
        sdt,
        gender,
        age,
        isAdmin: false,
    });
    try {
        const data = await Users.save();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

//LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: 'Email or password is incorrect1' });

        // Check password
        const pass = await User.findOne({ password: req.body.password });
        if (!pass) return res.status(400).json({ message: 'Email or password is incorrect 2' });
        console.log(user.isAdmin);
        // if (!user.isAdmin) {
        //     const { age, gender } = user;
        //     return res.json({ message: 'thanh cong 1', age, gender });
        // } else {
        //     res.json('thanh cong 2');
        // }
        if (user.isAdmin) {
            const coffeeshop = await Coffeeshop.find({ username: user.username });
            if (coffeeshop.length === 0) {
                return res.status(404).json({ message: 'No products found for the admin user' });
            } else {
                const coffeeshopnames = coffeeshop.map((coffeeshop) => coffeeshop.usernameshop).join(', ');
                const latitudes = coffeeshop.map((coffeeshop) => coffeeshop.latitude).join(', ');
                const longitudes = coffeeshop.map((coffeeshop) => coffeeshop.longitude).join(', ');
                console.log('Coffeeshop Names:', coffeeshopnames, latitudes, longitudes);
                return res.json({ isAdmin: true, coffeeshopnames, latitudes, longitudes, message: 'thanh cong 2' });
            }
        } else {
            const { age, gender } = user;
            return res.json({ message: 'thanh cong 1', age, gender });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
// put account
router.post('/postusers/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updateUserData = req.body;
        if (updateUserData.password) {
            delete updateUserData.password;
        }

        // Lấy thời gian hiện tại theo múi giờ của Việt Nam (GMT+7)
        const vietnamTime = moment().tz('Asia/Ho_Chi_Minh');

        // Cập nhật thời gian cho đối tượng `updateUserData` (ví dụ: `updateUserData.updatedAt`)
        updateUserData.updatedAt = vietnamTime.toDate();

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateUserData }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// get thung rac
router.get('/user', async (req, res) => {
    try {
        const deletedProducts = await User.findDeleted();
        res.json(deletedProducts);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching deleted products',
        });
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
        const result = await User.updateMany({ _id: formattedId }, { $set: { deleted: true, deletedAt: deletedAt } });
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
//restoreuser
router.post('/restoreuser/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await User.restore({ _id: formattedId });

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
// delete user vv
router.delete('/deletevv/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await User.findByIdAndRemove({ _id: formattedId });

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
    const data = await User.find();
    res.json(data);
});
module.exports = router;

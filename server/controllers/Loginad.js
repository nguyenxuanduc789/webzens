const router = require('express').Router();
const Userad = require('../model/useradmin');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const secret = 'mysecret';
const moment = require('moment-timezone');
//REGISTER USER
// router.post('/register', async (req, res) => {
//     const { username, sdt, password, gender, age } = req.body;
//     const Users = new User({
//         username,
//         email: 'a',
//         password,
//         sdt,
//         gender,
//         age,
//         isAdmin: false,
//     });
//     try {
//         const data = await Users.save();
//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

//LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const user = await Userad.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: 'Email or password is incorrect1' });

        // Check password
        const pass = await Userad.findOne({ password: req.body.password });
        if (!pass) return res.status(400).json({ message: 'Email or password is incorrect 2' });
        return res.status(200).json({
            success: true,
            message: 'successfully',
        });
    } catch (err) {
        res.status(500).json(err);
    }
});
module.exports = router;

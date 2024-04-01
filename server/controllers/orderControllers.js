const router = require('express').Router();
const Order = require('../model/order');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
router.post('/checkpayment', async function (req, res) {
    const { username, products, total, tablenumber, img, broughtout } = req.body;
    const order = new Order({
        username,
        total,
        products,
        tablenumber,
        img: 'https://i.imgur.com/vm6BHNo.png',
        broughtout: false,
    });
    try {
        const data = await order.save();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/add-product/:tablenumber', async (req, res) => {
    const tablenumber = req.params.tablenumber;
    console.log('Received request for tablenumber:', tablenumber);

    const { username, totalproduct, categoryId, img, age, gender, nameproduct } = req.body;

    try {
        // Find the order based on tablenumber
        const order = await Order.findOne({ tablenumber });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Iterate through each product in nameproduct array and validate before adding to the order
        const productArray = [];
        for (const product of nameproduct) {
            if (!product.name || !product.size || !product.price) {
                return res.status(400).json({ error: 'Invalid product details' });
            }

            const productDetails = {
                name: product.name,
                size: product.size,
                price: product.price,
            };

            productArray.push(productDetails);
        }

        const productDetails = {
            username,
            nameproduct: productArray,
            totalproduct,
            categoryId,
            img,
            age,
            gender,
        };

        // Push the product details to the order's products array
        order.products.push(productDetails);

        order.updatedAt = Date.now();
        await order.save();

        res.json({ message: 'Product(s) added to order successfully', order });
    } catch (error) {
        console.error('Error adding product to order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/checkpayment1/:_id', async function (req, res) {
    const _id = req.params._id; // Lấy ID từ tham số URL
    const { broughtout } = req.body;

    // Tìm đối tượng dựa trên ID
    try {
        const order = await Order.findById(_id);

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đối tượng.' });
        }

        // Cập nhật trường 'broughtout' bằng giá trị ngược
        order.broughtout = !order.broughtout;

        // Lưu cập nhật vào cơ sở dữ liệu
        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ');
    }
});

router.get('/danhthutuan', async (req, res) => {
    try {
        const dailyRevenue = await Order.aggregate([
            {
                $addFields: {
                    createdAt: { $toDate: '$createdAt' }, // Convert 'createdAt' to a date type.
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalRevenue: { $sum: '$total' },
                },
            },
            {
                $sort: { _id: 1 }, // Sort by date in ascending order
            },
        ]);

        res.json(dailyRevenue);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/tang1', async (req, res) => {
    try {
        const data = await Order.find({ floor: 1 }) // Add your filter conditions here, if needed
            .sort({ createdAt: 1 }) // Sort by 'createdAt' in ascending order
            .select(
                'img tablenumber broughtout products.username products.nameproduct products.totalproduct products.createdAt',
            ); // Select specific fields

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/tang2', async (req, res) => {
    try {
        const data = await Order.find({ floor: 2 }) // Add your filter conditions here, if needed
            .sort({ createdAt: 1 }) // Sort by 'createdAt' in ascending order
            .select(
                'img tablenumber broughtout products.username products.nameproduct products.totalproduct products.createdAt',
            ); // Select specific fields

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/tang3', async (req, res) => {
    try {
        const data = await Order.find({ floor: 3 }) // Add your filter conditions here, if needed
            .sort({ createdAt: 1 }) // Sort by 'createdAt' in ascending order
            .select(
                'img tablenumber broughtout products.username products.nameproduct products.totalproduct products.createdAt',
            ); // Select specific fields

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/table', async (req, res) => {
    try {
        // Extract data from the request body
        const { tablenumber, img, broughtout, floor } = req.body;

        // Tạo đường dẫn để lưu trữ QR code
        const qrCodePath = path.join(__dirname, 'path', 'to', 'save', tablenumber + '.png');

        // Kiểm tra xem thư mục tồn tại chưa, nếu không thì tạo mới
        const qrCodeDirectory = path.dirname(qrCodePath);
        if (!fs.existsSync(qrCodeDirectory)) {
            fs.mkdirSync(qrCodeDirectory, { recursive: true });
        }
        await QRCode.toFile(qrCodePath, tablenumber.toString());
        const newOrder = new Order({
            total: 0,
            products: [],
            tablenumber,
            img: 'https://i.imgur.com/vm6BHNo.png', // You can customize the image URL
            broughtout: false,
            floor,
            imgqr: qrCodePath, // Lưu đường dẫn file QR code
        });

        const savedOrder = await newOrder.save();
        console.log(savedOrder.imgqr);

        // Return the saved order with imgqr
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/user', async (req, res) => {
    try {
        const deletedProducts = await Order.findDeleted();
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
        const result = await Order.updateMany({ _id: formattedId }, { $set: { deleted: true, deletedAt: deletedAt } });
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
//edit table admin
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

        const updatedUser = await Order.findByIdAndUpdate(userId, { $set: updateUserData }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//restoreuser
router.post('/restoreuser/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove any leading colon from the ID and trim whitespace
        const formattedId = id.replace(':', '').trim();

        // Use the restore method to mark the product as restored
        const result = await Order.restore({ _id: formattedId });

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
        const result = await Order.findByIdAndRemove({ _id: formattedId });

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

//AL getproductuser
router.get('/getproductuser', async (req, res) => {
    try {
        const orders = await Order.find();

        // Extracting only the required fields from each product
        const extractedData = orders.flatMap((order) =>
            order.products.map((product) => ({
                username: product.username,
                nameproduct: product.nameproduct,
                age: product.age,
                gender: product.gender,
                totalproduct: product.totalproduct,
                updatedAt: product.updatedAt,
            })),
        );

        res.status(200).json(extractedData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getproductuser1', async (req, res) => {
    try {
        const orders = await Order.find();
        // Extracting only the "name" field from each product in the "nameproduct" array
        const extractedData = orders.flatMap((order) =>
            order.products.map((product) => ({
                name: product.nameproduct.map((item) => item.name), // Extracting only the "name" field
                age: product.age,
                gender: product.gender,
            })),
        );

        res.status(200).json(extractedData);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/', async (req, res) => {
    const data = await Order.find();
    res.json(data);
});

module.exports = router;

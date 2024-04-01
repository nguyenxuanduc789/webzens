const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const connectDb = () => {
    const mongoURI = process.env.MONGODB_URI;

    mongoose
        .connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Kết nối MongoDB  thành công');
        })
        .catch((err) => {
            console.error('Lỗi kết nối MongoDB:', err);
        });
};
module.exports = connectDb;

// const concentDb = () => {
//     mongoose
//         .connect('mongodb://127.0.0.1:27017/Coffee')
//         .then(() => {
//             console.log('ket noi thanh cong');
//         })
//         .catch((err) => console.log('ket noi that bai'));
// };
// module.exports = concentDb;

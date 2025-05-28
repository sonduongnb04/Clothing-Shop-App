const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

// Cấu hình biến môi trường
dotenv.config();

// Kết nối đến MongoDB
connectDB();

// Khởi tạo Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ hình ảnh từ thư mục assets/images và các thư mục con
app.use('/images', express.static(path.join(__dirname, '../assets/images')));
app.use('/images/áo', express.static(path.join(__dirname, '../assets/images/áo')));
app.use('/images/quần', express.static(path.join(__dirname, '../assets/images/quần')));
app.use('/images/váy', express.static(path.join(__dirname, '../assets/images/váy')));
app.use('/images/phụ kiện', express.static(path.join(__dirname, '../assets/images/phụ kiện')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Route kiểm tra API
app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

// Cổng và khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
  console.log(`Có thể truy cập từ: http://192.168.0.104:${PORT}`);
});

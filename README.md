# 👗 Ứng Dụng Bán Quần Áo - Clothing Shop App

Ứng dụng mua sắm thời trang di động được xây dựng với React Native và Expo.

## 🚀 Tính năng chính

### ✨ Tính Năng Chính

#### 🔐 **Xác Thực Người Dùng**
- **Đăng ký tài khoản** với thông tin đầy đủ
- **Đăng nhập/Đăng xuất** an toàn
- **Quản lý hồ sơ cá nhân** và thông tin người dùng
- **Đổi mật khẩu** với xác thực bảo mật

#### 🛍️ **Mua Sắm**
- **Danh sách sản phẩm** với hình ảnh chất lượng cao
- **Tìm kiếm và lọc** sản phẩm theo danh mục
- **Chi tiết sản phẩm** với thông tin đầy đủ
- **Sản phẩm nổi bật** và **khuyến mãi đặc biệt**
- **Giỏ hàng** với quản lý số lượng và size/màu sắc

#### 📦 **Quản Lý Đơn Hàng**
- **Tạo đơn hàng** với thông tin giao hàng
- **Theo dõi trạng thái** đơn hàng (Chờ xử lý, Đang chuẩn bị, Đang giao, Đã giao)
- **Hủy đơn hàng** khi cần thiết
- **Lịch sử đơn hàng** với bộ lọc và tìm kiếm
- **Chi tiết đơn hàng** với hình ảnh sản phẩm

#### 📍 **Quản Lý Địa Chỉ**
- **Thêm địa chỉ mới** với thông tin đầy đủ
- **Chỉnh sửa địa chỉ** hiện có
- **Đặt địa chỉ mặc định** cho việc giao hàng
- **Xóa địa chỉ** không sử dụng

#### 💳 **Thanh Toán**
- **Thanh toán khi nhận hàng (COD)**
- **Ví điện tử** (MoMo, ZaloPay)
- **Chuyển khoản ngân hàng**
- **Thẻ ATM/Debit**

#### 🎨 **Giao Diện**
- **Thiết kế hiện đại** và thân thiện với người dùng
- **Responsive** trên nhiều kích thước màn hình
- **Dark/Light mode** tự động
- **Animations** mượt mà với Reanimated
- **Icons** đẹp mắt từ Expo Vector Icons

## 🛠️ Công Nghệ Sử Dụng

### Frontend (React Native)
- **React Native** 0.76.9 - Framework chính
- **Expo** ~52.0.46 - Platform phát triển
- **Expo Router** ~4.0.20 - Navigation system
- **TypeScript** 5.3.3 - Type safety
- **React Native Reanimated** - Animations
- **AsyncStorage** - Local storage
- **Axios** - HTTP client

### Backend (Node.js)
- **Express.js** 5.1.0 - Web framework
- **MongoDB** 6.16.0 - Database
- **Mongoose** 8.13.2 - ODM cho MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Yêu Cầu Hệ Thống

### Phát Triển
- **Node.js** >= 18.0.0
- **npm** hoặc **yarn**
- **Expo CLI**
- **Android Studio** (cho Android)
- **Xcode** (cho iOS, chỉ trên macOS)

### Chạy Ứng Dụng
- **iOS** 13.0+
- **Android** 6.0+ (API level 23+)
- **Web browser** hiện đại

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository
```bash
git clone https://github.com/your-username/clothing-shop-app.git
cd clothing-shop-app
```

### 2. Cài Đặt Dependencies

#### Frontend
```bash
# Cài đặt packages cho frontend
npm install

# Hoặc sử dụng yarn
yarn install
```

#### Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt packages cho backend
npm install

# Quay lại thư mục gốc
cd ..
```

### 3. Cấu Hình Environment

#### Backend Environment
Tạo file `.env` trong thư mục `backend/`:
```env
MONGODB_URI=mongodb://localhost:27017/clothing-shop
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

#### Frontend Configuration
Cập nhật base URL trong `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:5000/api';
```

### 4. Khởi Tạo Database
```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy script khởi tạo dữ liệu
node init-categories.js

# Thêm dữ liệu mẫu (tùy chọn)
node add-more-categories.js
```

## 🏃‍♂️ Chạy Ứng Dụng

### 1. Khởi Động Backend
```bash
cd backend
npm start
```

### 2. Khởi Động Frontend
```bash
# Ở thư mục gốc
npm start

# Hoặc chạy trên platform cụ thể
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

### 3. Mở Ứng Dụng
- **Android**: Quét QR code bằng Expo Go app
- **iOS**: Quét QR code bằng Camera app hoặc Expo Go
- **Web**: Mở browser tại `http://localhost:8081`

## 📂 Cấu Trúc Dự Án

```
clothing-shop-app/
├── app/                          # Screen components (Expo Router)
│   ├── (tabs)/                   # Bottom tab navigation
│   │   ├── index.tsx             # Trang chủ
│   │   ├── search.tsx            # Tìm kiếm
│   │   ├── cart.tsx              # Giỏ hàng
│   │   └── profile.tsx           # Hồ sơ
│   ├── address/                  # Quản lý địa chỉ
│   ├── orders/                   # Quản lý đơn hàng
│   ├── product/                  # Chi tiết sản phẩm
│   ├── profile/                  # Cài đặt hồ sơ
│   ├── login.tsx                 # Đăng nhập
│   ├── register.tsx              # Đăng ký
│   ├── checkout.tsx              # Thanh toán
│   └── _layout.tsx               # Root layout
├── src/
│   ├── services/                 # API services
│   │   ├── api.js                # HTTP client config
│   │   ├── userService.js        # User API calls
│   │   ├── productService.js     # Product API calls
│   │   ├── cartService.js        # Cart management
│   │   └── orderService.js       # Order management
│   └── types/                    # TypeScript type definitions
├── components/                   # Reusable components
│   ├── ThemedView.tsx            # Themed container
│   ├── ThemedText.tsx            # Themed text
│   └── ...
├── constants/                    # App constants
├── assets/                       # Images, fonts, etc.
├── backend/                      # Node.js backend
│   ├── controllers/              # Request handlers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   ├── config/                   # Database config
│   └── server.js                 # Entry point
└── README.md                     # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `GET /api/categories` - Lấy danh sách danh mục

### Orders
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng

### Users
- `PUT /api/users/change-password` - Đổi mật khẩu
- `GET /api/users/addresses` - Lấy danh sách địa chỉ
- `POST /api/users/addresses` - Thêm địa chỉ mới
- `PUT /api/users/addresses/:id` - Cập nhật địa chỉ
- `DELETE /api/users/addresses/:id` - Xóa địa chỉ

## 🎯 Tính Năng Nổi Bật

### 🔄 Offline Support
- Lưu trữ local với AsyncStorage
- Đồng bộ khi có kết nối internet
- Xử lý graceful khi mất kết nối

### 🎨 Modern UI/UX
- Material Design principles
- Smooth animations
- Responsive layout
- Intuitive navigation

### 🛡️ Security
- JWT authentication
- Password hashing với bcrypt
- Input validation
- XSS protection

### ⚡ Performance
- Lazy loading
- Image optimization
- Efficient state management
- Minimal re-renders

## 🧪 Testing

```bash
# Chạy unit tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Chạy linting
npm run lint
```

## 📱 Screenshots

<!-- Thêm screenshots của ứng dụng ở đây -->

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request


**Made with ❤️ in Vietnam** 
# 🔄 Chi Tiết Cách Thức Hoạt Động API Frontend ↔ Backend

## 📋 Tổng Quan Kiến Trúc

```
┌─────────────────┐    HTTP Requests     ┌─────────────────┐
│   FRONTEND      │ ←─────────────────→  │    BACKEND      │
│  (React Native) │                      │   (Node.js)     │
│                 │    JSON Responses    │                 │
└─────────────────┘                      └─────────────────┘
        │                                        │
        ▼                                        ▼
┌─────────────────┐                      ┌─────────────────┐
│  AsyncStorage   │                      │   MongoDB       │
│ (Local Storage) │                      │  (Database)     │
└─────────────────┘                      └─────────────────┘
```

## 🏗️ Cấu Trúc API Layer

### 1. **HTTP Client Configuration (Frontend)**

#### File: `services/api.js`
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tạo instance axios với cấu hình cơ bản
const API = axios.create({
  baseURL: 'http://192.168.0.104:5000/api', // Base URL của backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout 10 giây
});

// Interceptor tự động thêm token vào header
API.interceptors.request.use(
  async (config) => {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Thêm token vào Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Giải thích:**
- **Axios Instance**: Tạo một instance axios với cấu hình chung
- **Base URL**: Tất cả requests sẽ có prefix `http://192.168.0.104:5000/api`
- **Request Interceptor**: Tự động thêm JWT token vào header cho mọi request
- **Timeout**: Tự động hủy request sau 10 giây

---

### 2. **Service Layer (Frontend)**

#### File: `services/authService.js`
```javascript
import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm đăng nhập
export const login = async (email, password) => {
  try {
    // 1. Gửi POST request đến backend
    const response = await API.post('/users/login', { 
      email, 
      password 
    });
    
    // 2. Lưu token vào AsyncStorage
    await AsyncStorage.setItem('userToken', response.data.token);
    
    // 3. Lưu thông tin user
    const userData = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      // ... other fields
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    // 4. Trả về kết quả
    return {
      token: response.data.token,
      user: userData
    };
  } catch (error) {
    // 5. Xử lý lỗi
    if (error.response) {
      // Server trả về lỗi (400, 401, 500, etc.)
      throw new Error(error.response.data.message || 'Email hoặc mật khẩu không đúng');
    } else if (error.request) {
      // Không nhận được response từ server
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Lỗi khác
      throw new Error('Đã xảy ra lỗi khi gửi yêu cầu.');
    }
  }
};
```

**Luồng hoạt động:**
1. **Frontend gọi hàm** → `login(email, password)`
2. **Service gửi HTTP POST** → `POST /api/users/login`
3. **Backend xử lý** → Kiểm tra email/password trong database
4. **Backend trả về** → JWT token + user info
5. **Frontend lưu local** → AsyncStorage (token + userData)
6. **Trả kết quả** → Về component để update UI

---

### 3. **API Routes (Backend)**

#### File: `backend/routes/userRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (không cần token)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (cần token)
router.route('/profile')
  .get(protect, getUserProfile)    // GET /api/users/profile
  .put(protect, updateUserProfile); // PUT /api/users/profile
```

**Giải thích:**
- **Public Routes**: Đăng ký, đăng nhập không cần xác thực
- **Protected Routes**: Cần JWT token trong header
- **Middleware `protect`**: Kiểm tra và xác thực token

---

### 4. **Controller Logic (Backend)**

#### File: `backend/controllers/userController.js`
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Controller xử lý login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user trong database
    const user = await User.findOne({ email });

    // 2. Kiểm tra user và password
    if (user && (await user.matchPassword(password))) {
      // 3. Login thành công → trả về data + token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
        token: generateToken(user._id), // Tạo JWT token
      });
    } else {
      // 4. Login thất bại
      res.status(401).json({ 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }
  } catch (error) {
    // 5. Lỗi server
    res.status(500).json({ message: error.message });
  }
};
```

**Luồng xử lý:**
1. **Nhận request** → Extract email, password từ req.body
2. **Query database** → Tìm user theo email
3. **Kiểm tra password** → So sánh hash
4. **Tạo JWT token** → Encode user ID
5. **Trả response** → JSON với user info + token

---

## 🔐 Authentication Flow Chi Tiết

### **1. Quy Trình Đăng Nhập**

```
Frontend (React Native)          Backend (Node.js)           Database (MongoDB)
       │                               │                           │
       │ 1. User nhập email/password    │                           │
       │────────────────────────────────│                           │
       │                               │                           │
       │ 2. POST /api/users/login       │                           │
       │──────────────────────────────→ │                           │
       │    { email, password }         │                           │
       │                               │                           │
       │                               │ 3. Query user by email    │
       │                               │─────────────────────────→ │
       │                               │                           │
       │                               │ 4. Return user data       │
       │                               │←───────────────────────── │
       │                               │                           │
       │                               │ 5. Compare password hash  │
       │                               │                           │
       │                               │ 6. Generate JWT token     │
       │                               │                           │
       │ 7. Response with token + user  │                           │
       │←────────────────────────────── │                           │
       │                               │                           │
       │ 8. Save token to AsyncStorage │                           │
       │                               │                           │
```

### **2. Quy Trình API Call Có Xác Thực**

```
Frontend                          Backend                       Database
    │                               │                           │
    │ 1. Get token from AsyncStorage│                           │
    │                               │                           │
    │ 2. GET /api/users/profile     │                           │
    │──────────────────────────────→│                           │
    │   Header: Authorization:      │                           │
    │   Bearer eyJhbGciOiJIUzI1...  │                           │
    │                               │                           │
    │                               │ 3. Verify JWT token       │
    │                               │                           │
    │                               │ 4. Extract user ID        │
    │                               │                           │
    │                               │ 5. Query user by ID       │
    │                               │─────────────────────────→ │
    │                               │                           │
    │                               │ 6. Return user data       │
    │                               │←───────────────────────── │
    │                               │                           │
    │ 7. Response with user profile │                           │
    │←──────────────────────────────│                           │
```

---

## 📡 HTTP Methods & Endpoints

### **Authentication Endpoints**
```
POST   /api/users/register  → Đăng ký user mới
POST   /api/users/login     → Đăng nhập user  
GET    /api/users/profile   → Lấy thông tin profile (cần token)
PUT    /api/users/profile   → Cập nhật profile (cần token)
```

### **Product Endpoints**
```
GET    /api/products                    → Lấy tất cả sản phẩm
GET    /api/products/:id               → Lấy sản phẩm theo ID
GET    /api/products/search?q=keyword  → Tìm kiếm sản phẩm
GET    /api/categories                 → Lấy tất cả danh mục
GET    /api/categories/:id/products    → Lấy sản phẩm theo danh mục
```

### **Order Endpoints** (Sẽ có)
```
POST   /api/orders          → Tạo đơn hàng mới (cần token)
GET    /api/orders          → Lấy đơn hàng của user (cần token)
GET    /api/orders/:id      → Lấy chi tiết đơn hàng (cần token)
PUT    /api/orders/:id      → Cập nhật trạng thái đơn hàng
```

---

## 🛠️ Error Handling Strategy

### **Frontend Error Handling**
```javascript
try {
  const response = await API.post('/users/login', { email, password });
  // Success handling
} catch (error) {
  if (error.response) {
    // Server responded with error status (400, 401, 500, etc.)
    const message = error.response.data.message || 'Server error';
    throw new Error(message);
  } else if (error.request) {
    // No response from server (network issue)
    throw new Error('Không thể kết nối đến máy chủ');
  } else {
    // Other errors
    throw new Error('Đã xảy ra lỗi không xác định');
  }
}
```

### **Backend Error Handling**
```javascript
const loginUser = async (req, res) => {
  try {
    // Business logic
  } catch (error) {
    // Log error
    console.error('Login error:', error);
    
    // Return appropriate error response
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

---

## 🔄 Data Flow Examples

### **Example 1: User Login**
```javascript
// 1. Component gọi login
const handleLogin = async () => {
  try {
    setLoading(true);
    const result = await login(email, password);
    
    // 2. Update global state
    setUser(result.user);
    setIsAuthenticated(true);
    
    // 3. Navigate to main app
    router.replace('/(tabs)');
  } catch (error) {
    Alert.alert('Lỗi', error.message);
  } finally {
    setLoading(false);
  }
};
```

### **Example 2: Fetch Products**
```javascript
// 1. Component mount → fetch products
useEffect(() => {
  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getAllProducts();
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  
  loadProducts();
}, []);
```

### **Example 3: Add to Cart**
```javascript
// 1. User click "Add to Cart"
const handleAddToCart = async () => {
  try {
    // 2. Validate selection
    if (!selectedSize || !selectedColor) {
      Alert.alert('Lưu ý', 'Vui lòng chọn size và màu sắc');
      return;
    }
    
    // 3. Add to local cart (AsyncStorage)
    await addToCart(product, selectedSize, selectedColor, quantity);
    
    // 4. Update cart count in global state
    updateCartCount();
    
    // 5. Show success message
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
  } catch (error) {
    Alert.alert('Lỗi', error.message);
  }
};
```

---

## 🚀 Optimization Strategies

### **1. Request Caching**
```javascript
// Cache frequently used data
const CACHE_KEY = 'categories_cache';
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const getAllCategories = async () => {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        return data;
      }
    }
    
    // Fetch from API
    const response = await API.get('/categories');
    
    // Update cache
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      data: response.data,
      timestamp: Date.now()
    }));
    
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### **2. Loading States**
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await apiCall();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### **3. Offline Support**
```javascript
// Check network connectivity
import NetInfo from '@react-native-async-storage/async-storage';

const apiCallWithOfflineSupport = async () => {
  const isConnected = await NetInfo.fetch().then(state => state.isConnected);
  
  if (!isConnected) {
    // Return cached data
    const cached = await AsyncStorage.getItem('offline_data');
    if (cached) {
      return JSON.parse(cached);
    }
    throw new Error('Không có kết nối mạng và không có dữ liệu offline');
  }
  
  // Make API call
  const response = await API.get('/endpoint');
  
  // Cache for offline use
  await AsyncStorage.setItem('offline_data', JSON.stringify(response.data));
  
  return response.data;
};
```

---

## 🔧 Development Tips

### **1. API Testing**
```bash
# Test backend endpoints with curl
curl -X POST http://192.168.0.104:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Test with token
curl -X GET http://192.168.0.104:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2. Debug Network Requests**
```javascript
// Add request/response interceptors for debugging
API.interceptors.request.use(request => {
  console.log('🚀 Starting Request:', request.url);
  console.log('📦 Request Data:', request.data);
  return request;
});

API.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.data);
    return response;
  },
  error => {
    console.log('❌ Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### **3. Environment Configuration**
```javascript
// config.js
const config = {
  development: {
    apiUrl: 'http://192.168.0.104:5000/api',
  },
  production: {
    apiUrl: 'https://your-production-api.com/api',
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

---

## 📚 Tổng Kết

### **Quy Trình Hoạt Động Tổng Quát:**

1. **Frontend Component** → Gọi service function
2. **Service Layer** → Chuẩn bị data, gọi API với axios
3. **HTTP Request** → Gửi đến backend qua network
4. **Backend Router** → Route request đến controller
5. **Controller** → Xử lý business logic, query database
6. **Database** → Trả về data
7. **Backend Response** → JSON response về frontend
8. **Frontend** → Xử lý response, update UI và local storage

### **Lợi Ích Của Kiến Trúc Này:**
- ✅ **Separation of Concerns**: Tách biệt UI, business logic, và data
- ✅ **Reusability**: Service functions có thể dùng lại
- ✅ **Error Handling**: Xử lý lỗi tập trung và nhất quán  
- ✅ **Authentication**: JWT token tự động với interceptors
- ✅ **Offline Support**: Cache data locally với AsyncStorage
- ✅ **Scalability**: Dễ dàng thêm endpoints và features mới 
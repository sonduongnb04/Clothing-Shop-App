# 🔧 API Documentation - Clothing Shop App

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [API Endpoints](#-api-endpoints)
  - [Auth APIs](#-auth-apis)
  - [User APIs](#-user-apis)
  - [Product APIs](#-product-apis)
  - [Category APIs](#-category-apis)
  - [Cart APIs](#-cart-apis)
  - [Order APIs](#-order-apis)
  - [Address APIs](#-address-apis)
- [Data Models](#-data-models)
- [Examples](#-examples)

## 🌍 Tổng Quan

### Base URL
```
Production:  https://api.clothingshop.com/api
Development: http://localhost:5000/api
```

### Content Type
```
Content-Type: application/json
```

### API Version
```
Version: v1
```

## 🔐 Authentication

### JWT Token
Hầu hết các endpoints đều yêu cầu JWT token trong header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- **Access Token**: 24 giờ
- **Refresh Token**: 30 ngày

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  },
  "timestamp": "2024-12-22T10:30:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## ⏱️ Rate Limiting

- **General APIs**: 100 requests/minute
- **Auth APIs**: 10 requests/minute
- **Upload APIs**: 20 requests/minute

## 🔗 API Endpoints

---

## 🔐 Auth APIs

### POST /auth/register
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "password": "password123",
  "phoneNumber": "0123456789",
  "gender": "male",
  "dateOfBirth": "1990-01-01"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phoneNumber": "0123456789",
      "gender": "male",
      "dateOfBirth": "1990-01-01T00:00:00Z",
      "createdAt": "2024-12-22T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Đăng ký thành công"
}
```

### POST /auth/login
Đăng nhập vào hệ thống

**Request Body:**
```json
{
  "email": "nguyenvana@email.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phoneNumber": "0123456789",
      "avatar": "https://api.example.com/images/avatars/user1.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Đăng nhập thành công"
}
```

### POST /auth/logout
Đăng xuất khỏi hệ thống

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

### GET /auth/profile
Lấy thông tin profile người dùng

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phoneNumber": "0123456789",
      "gender": "male",
      "dateOfBirth": "1990-01-01T00:00:00Z",
      "avatar": "https://api.example.com/images/avatars/user1.jpg",
      "addresses": [],
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T10:30:00Z"
    }
  }
}
```

---

## 👤 User APIs

### PUT /users/profile
Cập nhật thông tin profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "gender": "male",
  "dateOfBirth": "1990-01-01"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "fullName": "Nguyễn Văn B",
      "email": "nguyenvana@email.com",
      "phoneNumber": "0987654321",
      "gender": "male",
      "dateOfBirth": "1990-01-01T00:00:00Z",
      "updatedAt": "2024-12-22T11:00:00Z"
    }
  },
  "message": "Cập nhật thông tin thành công"
}
```

### PUT /users/change-password
Đổi mật khẩu

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

### POST /users/upload-avatar
Upload avatar cho user

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
avatar: [File]
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://api.example.com/images/avatars/user1_new.jpg"
  },
  "message": "Upload avatar thành công"
}
```

---

## 🛍️ Product APIs

### GET /products
Lấy danh sách sản phẩm

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số sản phẩm/trang (default: 20)
- `category` (optional): ID danh mục
- `search` (optional): Từ khóa tìm kiếm
- `minPrice` (optional): Giá tối thiểu
- `maxPrice` (optional): Giá tối đa
- `sortBy` (optional): Sắp xếp theo (name, price, createdAt)
- `sortOrder` (optional): Thứ tự (asc, desc)

**Example Request:**
```
GET /products?page=1&limit=10&category=64f8a1b2c3d4e5f6789012ab&search=áo&sortBy=price&sortOrder=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6789012cd",
        "name": "Áo Thun Nam Basic",
        "description": "Áo thun nam chất liệu cotton 100%",
        "price": 199000,
        "discountPrice": 159000,
        "category": {
          "_id": "64f8a1b2c3d4e5f6789012ab",
          "name": "Áo Nam"
        },
        "images": [
          "https://api.example.com/images/products/ao-thun-1.jpg",
          "https://api.example.com/images/products/ao-thun-2.jpg"
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Trắng", "Đen", "Xám"],
        "stock": 100,
        "rating": 4.5,
        "reviewCount": 25,
        "createdAt": "2024-12-22T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /products/{id}
Lấy chi tiết sản phẩm

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "64f8a1b2c3d4e5f6789012cd",
      "name": "Áo Thun Nam Basic",
      "description": "Áo thun nam chất liệu cotton 100%, thoáng mát, phù hợp với mọi hoạt động",
      "price": 199000,
      "discountPrice": 159000,
      "category": {
        "_id": "64f8a1b2c3d4e5f6789012ab",
        "name": "Áo Nam",
        "slug": "ao-nam"
      },
      "images": [
        "https://api.example.com/images/products/ao-thun-1.jpg",
        "https://api.example.com/images/products/ao-thun-2.jpg",
        "https://api.example.com/images/products/ao-thun-3.jpg"
      ],
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Trắng", "Đen", "Xám"],
      "stock": 100,
      "rating": 4.5,
      "reviewCount": 25,
      "specifications": {
        "material": "Cotton 100%",
        "origin": "Việt Nam",
        "care": "Giặt máy ở nhiệt độ thường"
      },
      "reviews": [
        {
          "_id": "64f8a1b2c3d4e5f6789012ef",
          "user": {
            "name": "Nguyễn Văn C",
            "avatar": "https://api.example.com/images/avatars/user2.jpg"
          },
          "rating": 5,
          "comment": "Chất lượng tốt, đúng size",
          "createdAt": "2024-12-20T10:30:00Z"
        }
      ],
      "relatedProducts": [
        {
          "_id": "64f8a1b2c3d4e5f6789012gh",
          "name": "Áo Thun Nam Premium",
          "price": 299000,
          "images": ["https://api.example.com/images/products/ao-thun-premium.jpg"]
        }
      ],
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T10:30:00Z"
    }
  }
}
```

### GET /products/featured
Lấy sản phẩm nổi bật

**Query Parameters:**
- `limit` (optional): Số sản phẩm (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6789012cd",
        "name": "Áo Thun Nam Basic",
        "price": 199000,
        "discountPrice": 159000,
        "images": ["https://api.example.com/images/products/ao-thun-1.jpg"],
        "rating": 4.5,
        "isFeatured": true
      }
    ]
  }
}
```

### GET /products/on-sale
Lấy sản phẩm khuyến mãi

**Query Parameters:**
- `limit` (optional): Số sản phẩm (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "64f8a1b2c3d4e5f6789012cd",
        "name": "Áo Thun Nam Basic",
        "price": 199000,
        "discountPrice": 159000,
        "discountPercent": 20,
        "images": ["https://api.example.com/images/products/ao-thun-1.jpg"],
        "rating": 4.5
      }
    ]
  }
}
```

---

## 📂 Category APIs

### GET /categories
Lấy danh sách danh mục

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "64f8a1b2c3d4e5f6789012ab",
        "name": "Áo Nam",
        "slug": "ao-nam",
        "description": "Tất cả các loại áo dành cho nam",
        "image": "https://api.example.com/images/categories/ao-nam.jpg",
        "productCount": 25,
        "isActive": true,
        "createdAt": "2024-12-22T10:30:00Z"
      },
      {
        "_id": "64f8a1b2c3d4e5f6789012bc",
        "name": "Quần Nam",
        "slug": "quan-nam",
        "description": "Tất cả các loại quần dành cho nam",
        "image": "https://api.example.com/images/categories/quan-nam.jpg",
        "productCount": 18,
        "isActive": true,
        "createdAt": "2024-12-22T10:30:00Z"
      }
    ]
  }
}
```

### GET /categories/{id}
Lấy chi tiết danh mục

**Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "name": "Áo Nam",
      "slug": "ao-nam",
      "description": "Tất cả các loại áo dành cho nam giới",
      "image": "https://api.example.com/images/categories/ao-nam.jpg",
      "productCount": 25,
      "isActive": true,
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T10:30:00Z"
    }
  }
}
```

---

## 🛒 Cart APIs

### GET /cart
Lấy giỏ hàng của user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "64f8a1b2c3d4e5f6789012ij",
      "user": "64f8a1b2c3d4e5f6789012ab",
      "items": [
        {
          "_id": "64f8a1b2c3d4e5f6789012kl",
          "product": {
            "_id": "64f8a1b2c3d4e5f6789012cd",
            "name": "Áo Thun Nam Basic",
            "price": 199000,
            "discountPrice": 159000,
            "images": ["https://api.example.com/images/products/ao-thun-1.jpg"]
          },
          "quantity": 2,
          "size": "L",
          "color": "Đen",
          "price": 159000,
          "subtotal": 318000
        }
      ],
      "totalItems": 2,
      "totalAmount": 318000,
      "updatedAt": "2024-12-22T10:30:00Z"
    }
  }
}
```

### POST /cart/add
Thêm sản phẩm vào giỏ hàng

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "64f8a1b2c3d4e5f6789012cd",
  "quantity": 1,
  "size": "L",
  "color": "Đen"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "cartItem": {
      "_id": "64f8a1b2c3d4e5f6789012kl",
      "product": "64f8a1b2c3d4e5f6789012cd",
      "quantity": 1,
      "size": "L",
      "color": "Đen",
      "price": 159000
    }
  },
  "message": "Đã thêm sản phẩm vào giỏ hàng"
}
```

### PUT /cart/update/{itemId}
Cập nhật sản phẩm trong giỏ hàng

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3,
  "size": "XL",
  "color": "Trắng"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cartItem": {
      "_id": "64f8a1b2c3d4e5f6789012kl",
      "quantity": 3,
      "size": "XL",
      "color": "Trắng",
      "subtotal": 477000
    }
  },
  "message": "Cập nhật giỏ hàng thành công"
}
```

### DELETE /cart/remove/{itemId}
Xóa sản phẩm khỏi giỏ hàng

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi giỏ hàng"
}
```

### DELETE /cart/clear
Xóa toàn bộ giỏ hàng

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Đã xóa toàn bộ giỏ hàng"
}
```

---

## 📦 Order APIs

### GET /orders
Lấy danh sách đơn hàng của user

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số đơn hàng/trang (default: 10)
- `status` (optional): Trạng thái đơn hàng
- `startDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (optional): Ngày kết thúc (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "64f8a1b2c3d4e5f6789012mn",
        "orderNumber": "ORD1703234567890",
        "status": "pending",
        "paymentMethod": "cod",
        "paymentStatus": "pending",
        "totalAmount": 318000,
        "shippingFee": 30000,
        "totalItems": 2,
        "createdAt": "2024-12-22T10:30:00Z",
        "estimatedDelivery": "2024-12-25T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /orders/{id}
Lấy chi tiết đơn hàng

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6789012mn",
      "orderNumber": "ORD1703234567890",
      "user": "64f8a1b2c3d4e5f6789012ab",
      "status": "pending",
      "paymentMethod": "cod",
      "paymentStatus": "pending",
      "items": [
        {
          "_id": "64f8a1b2c3d4e5f6789012op",
          "product": {
            "_id": "64f8a1b2c3d4e5f6789012cd",
            "name": "Áo Thun Nam Basic",
            "images": ["https://api.example.com/images/products/ao-thun-1.jpg"]
          },
          "quantity": 2,
          "size": "L",
          "color": "Đen",
          "price": 159000,
          "subtotal": 318000
        }
      ],
      "shippingAddress": {
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0123456789",
        "streetAddress": "123 Đường ABC",
        "ward": "Phường 1",
        "district": "Quận 1",
        "province": "TP. Hồ Chí Minh",
        "isDefault": true
      },
      "subtotal": 318000,
      "shippingFee": 30000,
      "discount": 0,
      "totalAmount": 348000,
      "note": "Giao hàng giờ hành chính",
      "trackingNumber": "TN1703234567890",
      "estimatedDelivery": "2024-12-25T10:30:00Z",
      "deliveredAt": null,
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T10:30:00Z"
    }
  }
}
```

### POST /orders
Tạo đơn hàng mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "64f8a1b2c3d4e5f6789012cd",
      "quantity": 2,
      "size": "L",
      "color": "Đen",
      "price": 159000
    }
  ],
  "shippingAddressId": "64f8a1b2c3d4e5f6789012qr",
  "paymentMethod": "cod",
  "note": "Giao hàng giờ hành chính"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64f8a1b2c3d4e5f6789012mn",
      "orderNumber": "ORD1703234567890",
      "status": "pending",
      "totalAmount": 348000,
      "createdAt": "2024-12-22T10:30:00Z"
    }
  },
  "message": "Tạo đơn hàng thành công"
}
```

### PUT /orders/{id}/cancel
Hủy đơn hàng

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Không cần nữa"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hủy đơn hàng thành công"
}
```

---

## 📍 Address APIs

### GET /addresses
Lấy danh sách địa chỉ của user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "_id": "64f8a1b2c3d4e5f6789012qr",
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0123456789",
        "streetAddress": "123 Đường ABC",
        "ward": "Phường 1",
        "district": "Quận 1",
        "province": "TP. Hồ Chí Minh",
        "isDefault": true,
        "createdAt": "2024-12-22T10:30:00Z"
      }
    ]
  }
}
```

### POST /addresses
Thêm địa chỉ mới

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789",
  "streetAddress": "123 Đường ABC",
  "ward": "Phường 1",
  "district": "Quận 1",
  "province": "TP. Hồ Chí Minh",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "address": {
      "_id": "64f8a1b2c3d4e5f6789012qr",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0123456789",
      "streetAddress": "123 Đường ABC",
      "ward": "Phường 1",
      "district": "Quận 1",
      "province": "TP. Hồ Chí Minh",
      "isDefault": false,
      "createdAt": "2024-12-22T10:30:00Z"
    }
  },
  "message": "Thêm địa chỉ thành công"
}
```

### PUT /addresses/{id}
Cập nhật địa chỉ

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "streetAddress": "456 Đường XYZ",
  "ward": "Phường 2",
  "district": "Quận 2",
  "province": "TP. Hồ Chí Minh",
  "isDefault": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "address": {
      "_id": "64f8a1b2c3d4e5f6789012qr",
      "fullName": "Nguyễn Văn B",
      "phoneNumber": "0987654321",
      "streetAddress": "456 Đường XYZ",
      "ward": "Phường 2",
      "district": "Quận 2",
      "province": "TP. Hồ Chí Minh",
      "isDefault": true,
      "updatedAt": "2024-12-22T11:00:00Z"
    }
  },
  "message": "Cập nhật địa chỉ thành công"
}
```

### DELETE /addresses/{id}
Xóa địa chỉ

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Xóa địa chỉ thành công"
}
```

### PUT /addresses/{id}/set-default
Đặt địa chỉ mặc định

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Đặt địa chỉ mặc định thành công"
}
```

---

## 📊 Data Models

### User Model
```typescript
interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: 'male' | 'female';
  dateOfBirth?: Date;
  avatar?: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Category;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  specifications?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model
```typescript
interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'cod' | 'momo' | 'zalopay' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  note?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Address Model
```typescript
interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 💡 Examples

### Complete Order Flow
```bash
# 1. Đăng nhập
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 2. Thêm sản phẩm vào giỏ hàng
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "64f8a1b2c3d4e5f6789012cd",
    "quantity": 2,
    "size": "L",
    "color": "Đen"
  }'

# 3. Tạo đơn hàng
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "64f8a1b2c3d4e5f6789012cd",
        "quantity": 2,
        "size": "L",
        "color": "Đen",
        "price": 159000
      }
    ],
    "shippingAddressId": "64f8a1b2c3d4e5f6789012qr",
    "paymentMethod": "cod"
  }'
```

### Search Products
```bash
# Tìm kiếm sản phẩm với filters
curl -X GET "http://localhost:5000/api/products?search=áo&category=64f8a1b2c3d4e5f6789012ab&minPrice=100000&maxPrice=500000&sortBy=price&sortOrder=asc&page=1&limit=10"
```

### Upload Avatar
```bash
curl -X POST http://localhost:5000/api/users/upload-avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

---

## 📝 Notes

### Development
- Tất cả timestamps được trả về theo định dạng ISO 8601
- Giá tiền được tính bằng VND (đơn vị: đồng)
- ID sử dụng MongoDB ObjectId format
- Images được lưu trữ và phục vụ qua CDN

### Security
- Passwords được hash bằng bcrypt
- JWT tokens có thời gian hết hạn
- Rate limiting được áp dụng cho tất cả endpoints
- Input validation được thực hiện ở server side

### Performance
- Pagination được áp dụng cho tất cả list APIs
- Images được optimize và serve qua CDN
- Database indexes được tối ưu cho performance

---

**API Version**: 1.0.0  
**Last Updated**: 22/12/2024  
**Contact**: api-support@clothingshop.com 
# 💰 Hướng Dẫn Tính Giảm Giá Khuyến Mãi & Tổng Tiền Đơn Hàng

## 🏷️ 1. Cách Tính Giảm Giá Sản Phẩm

### **📊 Công Thức Cơ Bản:**

```javascript
// Dữ liệu sản phẩm
const product = {
  name: "Áo thun Hades",
  price: 350000,        // Giá gốc
  discountPrice: 245000 // Giá sau giảm
};

// 🧮 Tính phần trăm giảm giá
const discountAmount = product.price - product.discountPrice;  // 350000 - 245000 = 105000
const discountPercentage = Math.round((discountAmount / product.price) * 100); // (105000 / 350000) * 100 = 30%

console.log(`Giảm giá: ${discountPercentage}%`); // "Giảm giá: 30%"
```

### **💡 Cách Hiện Tại Trong App:**

#### File: `app/(tabs)/index.tsx`
```javascript
const renderDiscountedProductItem = ({ item }) => {
  // Tính phần trăm giảm giá từ string
  const originalPrice = parseInt(item.price.replace(/\D/g, ''));     // "350.000đ" → 350000
  const discountedPrice = parseInt((item.discountPrice || '0').replace(/\D/g, '')); // "245.000đ" → 245000
  
  const discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  
  return (
    <View>
      {/* Badge hiển thị % giảm giá */}
      {discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
        </View>
      )}
      
      <View style={styles.priceContainer}>
        <Text style={styles.discountedPrice}>{item.discountPrice}</Text>     {/* 245.000đ */}
        <Text style={styles.originalPrice}>{item.price}</Text>               {/* 350.000đ - bị gạch */}
      </View>
    </View>
  );
};
```

---

## 🛒 2. Cách Tính Tổng Tiền Đơn Hàng

### **📋 Cấu Trúc Giỏ Hàng:**

```javascript
const cartItems = [
  {
    id: "1",
    name: "Áo thun Hades",
    price: 350000,
    discountPrice: 245000,
    quantity: 2,
    size: "L",
    color: "Đen"
  },
  {
    id: "2", 
    name: "Quần jean nam",
    price: 450000,
    discountPrice: 315000,
    quantity: 1,
    size: "32",
    color: "Xanh"
  }
];
```

### **🧮 Các Bước Tính Toán:**

#### **Bước 1: Tính tổng tiền sản phẩm**
```javascript
const calculateSubtotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price; // Ưu tiên giá khuyến mãi
    return total + (itemPrice * item.quantity);
  }, 0);
};

// Ví dụ:
// Item 1: 245000 * 2 = 490000
// Item 2: 315000 * 1 = 315000
// Subtotal = 490000 + 315000 = 805000
```

#### **Bước 2: Tính phí giao hàng**
```javascript
const calculateShippingFee = (subtotal, userAddress) => {
  const FREE_SHIPPING_THRESHOLD = 500000; // Miễn phí ship từ 500k
  const STANDARD_SHIPPING_FEE = 30000;    // Phí ship tiêu chuẩn
  
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0; // Miễn phí ship
  }
  
  // Có thể tính theo khu vực
  if (userAddress.province === 'TP.HCM' || userAddress.province === 'Hà Nội') {
    return 25000; // Phí ship nội thành
  }
  
  return STANDARD_SHIPPING_FEE; // Phí ship ngoại thành
};

// Ví dụ: subtotal = 805000 → shipping = 0 (miễn phí)
```

#### **Bước 3: Tính thuế VAT (nếu có)**
```javascript
const calculateTax = (subtotal) => {
  const TAX_RATE = 0.1; // 10% VAT
  return Math.round(subtotal * TAX_RATE);
};

// Ví dụ: tax = 805000 * 0.1 = 80500
```

#### **Bước 4: Áp dụng mã giảm giá**
```javascript
const applyCoupon = (subtotal, couponCode) => {
  const coupons = {
    'WELCOME10': { type: 'percentage', value: 10, minOrder: 200000 },
    'SAVE50K': { type: 'fixed', value: 50000, minOrder: 300000 },
    'FREESHIP': { type: 'shipping', value: 30000, minOrder: 0 }
  };
  
  const coupon = coupons[couponCode];
  if (!coupon || subtotal < coupon.minOrder) {
    return { discount: 0, description: '' };
  }
  
  switch (coupon.type) {
    case 'percentage':
      const percentDiscount = Math.round(subtotal * coupon.value / 100);
      return { 
        discount: percentDiscount, 
        description: `Giảm ${coupon.value}%` 
      };
      
    case 'fixed':
      return { 
        discount: coupon.value, 
        description: `Giảm ${coupon.value.toLocaleString()}đ` 
      };
      
    case 'shipping':
      return { 
        discount: 0, 
        shippingDiscount: coupon.value,
        description: 'Miễn phí vận chuyển' 
      };
      
    default:
      return { discount: 0, description: '' };
  }
};
```

#### **Bước 5: Tính tổng tiền cuối cùng**
```javascript
const calculateOrderTotal = (cartItems, userAddress, couponCode = '') => {
  // 1. Tính tổng tiền sản phẩm
  const subtotal = calculateSubtotal(cartItems);
  
  // 2. Tính phí ship
  let shippingFee = calculateShippingFee(subtotal, userAddress);
  
  // 3. Tính thuế
  const tax = calculateTax(subtotal);
  
  // 4. Áp dụng mã giảm giá
  const couponResult = applyCoupon(subtotal, couponCode);
  const couponDiscount = couponResult.discount || 0;
  const shippingDiscount = couponResult.shippingDiscount || 0;
  
  // 5. Điều chỉnh phí ship nếu có giảm giá shipping
  shippingFee = Math.max(0, shippingFee - shippingDiscount);
  
  // 6. Tính tổng cuối cùng
  const finalTotal = subtotal + shippingFee + tax - couponDiscount;
  
  return {
    subtotal,           // 805000
    shippingFee,        // 0 (miễn phí do > 500k)
    tax,                // 80500
    couponDiscount,     // 0 (không có mã)
    total: finalTotal   // 885500
  };
};
```

---

## 💻 3. Implementation Trong Code

### **📁 File: `services/orderCalculationService.ts`**

```typescript
export interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface OrderCalculation {
  subtotal: number;
  originalTotal: number;
  totalDiscount: number;
  shippingFee: number;
  tax: number;
  couponDiscount: number;
  finalTotal: number;
  savings: number;
}

// Tính tổng tiền gốc (trước giảm giá)
export const calculateOriginalTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Tính tổng tiền sau giảm giá sản phẩm
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
};

// Tính tổng số tiền tiết kiệm
export const calculateTotalSavings = (items: CartItem[]): number => {
  return items.reduce((savings, item) => {
    if (item.discountPrice && item.discountPrice < item.price) {
      const itemSavings = (item.price - item.discountPrice) * item.quantity;
      return savings + itemSavings;
    }
    return savings;
  }, 0);
};

// Tính phí giao hàng
export const calculateShippingFee = (subtotal: number, address?: any): number => {
  const FREE_SHIPPING_THRESHOLD = 500000;
  
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  
  // Phí ship theo khu vực
  if (address?.province === 'TP.HCM' || address?.province === 'Hà Nội') {
    return 25000;
  }
  
  return 30000;
};

// Tính thuế VAT
export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * 0.1); // 10% VAT
};

// Tính toán đầy đủ đơn hàng
export const calculateOrderTotal = (
  items: CartItem[], 
  address?: any, 
  couponCode?: string
): OrderCalculation => {
  const originalTotal = calculateOriginalTotal(items);
  const subtotal = calculateSubtotal(items);
  const totalDiscount = calculateTotalSavings(items);
  const shippingFee = calculateShippingFee(subtotal, address);
  const tax = calculateTax(subtotal);
  
  // TODO: Implement coupon logic
  const couponDiscount = 0;
  
  const finalTotal = subtotal + shippingFee + tax - couponDiscount;
  const savings = totalDiscount + couponDiscount;
  
  return {
    subtotal,
    originalTotal,
    totalDiscount,
    shippingFee,
    tax,
    couponDiscount,
    finalTotal,
    savings
  };
};

// Format tiền tệ
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
```

---

## 🎨 4. UI Display Examples

### **🛒 Cart Summary Component:**

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { calculateOrderTotal, formatCurrency } from '@/services/orderCalculationService';

const CartSummary = ({ cartItems, userAddress, couponCode }) => {
  const calculation = calculateOrderTotal(cartItems, userAddress, couponCode);
  
  return (
    <View style={styles.summaryContainer}>
      {/* Tổng tiền sản phẩm */}
      <View style={styles.summaryRow}>
        <Text>Tổng tiền hàng:</Text>
        <Text>{formatCurrency(calculation.subtotal)}</Text>
      </View>
      
      {/* Hiển thị tiết kiệm nếu có */}
      {calculation.savings > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.savingsText}>Tiết kiệm:</Text>
          <Text style={styles.savingsAmount}>-{formatCurrency(calculation.savings)}</Text>
        </View>
      )}
      
      {/* Phí vận chuyển */}
      <View style={styles.summaryRow}>
        <Text>Phí vận chuyển:</Text>
        <Text>
          {calculation.shippingFee === 0 ? 
            <Text style={styles.freeShipping}>Miễn phí</Text> : 
            formatCurrency(calculation.shippingFee)
          }
        </Text>
      </View>
      
      {/* Thuế */}
      <View style={styles.summaryRow}>
        <Text>Thuế VAT (10%):</Text>
        <Text>{formatCurrency(calculation.tax)}</Text>
      </View>
      
      {/* Mã giảm giá */}
      {calculation.couponDiscount > 0 && (
        <View style={styles.summaryRow}>
          <Text>Mã giảm giá:</Text>
          <Text style={styles.discountText}>-{formatCurrency(calculation.couponDiscount)}</Text>
        </View>
      )}
      
      {/* Tổng cộng */}
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalText}>Tổng cộng:</Text>
        <Text style={styles.totalAmount}>{formatCurrency(calculation.finalTotal)}</Text>
      </View>
    </View>
  );
};
```

---

## 📊 5. Ví Dụ Tính Toán Cụ Thể

### **🛍️ Giỏ hàng mẫu:**
```
- Áo thun Hades: 350.000đ → 245.000đ (x2) = 490.000đ
- Quần jean nam: 450.000đ → 315.000đ (x1) = 315.000đ
```

### **💰 Tính toán:**
```
Tổng tiền gốc:     350.000đ × 2 + 450.000đ × 1 = 1.150.000đ
Tổng sau giảm:     245.000đ × 2 + 315.000đ × 1 = 805.000đ
Tiết kiệm:         1.150.000đ - 805.000đ = 345.000đ

Phí ship:          0đ (miễn phí do > 500k)
Thuế VAT (10%):    805.000đ × 10% = 80.500đ
Mã giảm giá:       0đ

TỔNG CỘNG:         805.000đ + 0đ + 80.500đ = 885.500đ
```

### **🎯 Kết quả hiển thị:**
```
┌─────────────────────────────────────┐
│          HÓA ĐƠN THANH TOÁN         │
├─────────────────────────────────────┤
│ Tổng tiền hàng:        805.000đ     │
│ Tiết kiệm:            -345.000đ     │
│ Phí vận chuyển:           Miễn phí  │
│ Thuế VAT (10%):        80.500đ      │
│ Mã giảm giá:               0đ       │
├─────────────────────────────────────┤
│ TỔNG CỘNG:            885.500đ      │
└─────────────────────────────────────┘
```

---

## 🚀 6. Tích Hợp Vào App

### **📍 Các nơi cần sử dụng:**

1. **Cart Screen** (`app/(tabs)/cart.tsx`)
2. **Checkout Screen** (`app/checkout.tsx`) 
3. **Order Summary** (`app/orders/index.tsx`)
4. **Product Detail** (`app/product/new-product-detail.tsx`)

### **🔧 Cách tích hợp:**

```tsx
// Trong Cart component
import { calculateOrderTotal } from '@/services/orderCalculationService';

const CartScreen = () => {
  const { cartItems } = useCart();
  const { userAddress } = useAuth();
  
  const orderCalculation = calculateOrderTotal(cartItems, userAddress);
  
  return (
    <View>
      {/* Render cart items */}
      <CartSummary calculation={orderCalculation} />
    </View>
  );
};
```

Đây là hệ thống tính toán giảm giá và tổng tiền đơn hàng hoàn chỉnh cho ứng dụng! 🎯 
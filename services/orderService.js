import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCart } from './cartService';

// Key để lưu trữ đơn hàng trong AsyncStorage
const USER_ORDERS_KEY = 'USER_ORDERS';

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    // Tạo order number duy nhất
    const orderNumber = `ORD${Date.now()}`;

    // Tạo đơn hàng với ID và số hiệu đơn hàng
    const newOrder = {
      _id: Date.now().toString(),
      orderNumber,
      user: orderData.userId || 'guest',
      items: orderData.items.map(item => ({
        product: {
          _id: item.productId || item._id,
          name: item.name,
          images: item.image ? [item.image] : []
        },
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize || null,
        color: item.selectedColor || null
      })),
      shippingAddress: {
        fullName: orderData.shippingInfo.fullName,
        phoneNumber: orderData.shippingInfo.phone,
        province: orderData.shippingInfo.city,
        district: orderData.shippingInfo.district,
        ward: orderData.shippingInfo.ward,
        streetAddress: orderData.shippingInfo.address
      },
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      subtotal: orderData.subtotal,
      shippingFee: orderData.shippingFee || 0,
      total: orderData.total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      note: orderData.shippingInfo.note || ''
    };

    // Lưu đơn hàng vào AsyncStorage
    const userId = orderData.userId || 'guest';
    const existingOrders = await getUserOrdersFromStorage(userId);
    existingOrders.unshift(newOrder); // Thêm đơn hàng mới vào đầu danh sách

    await saveUserOrdersToStorage(userId, existingOrders);

    console.log('Đã tạo đơn hàng thành công:', newOrder);
    return newOrder;
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    throw error;
  }
};

// Lưu đơn hàng của user vào AsyncStorage
const saveUserOrdersToStorage = async (userId, orders) => {
  try {
    await AsyncStorage.setItem(`${USER_ORDERS_KEY}_${userId}`, JSON.stringify(orders));
  } catch (error) {
    console.error('Lỗi khi lưu đơn hàng vào storage:', error);
    throw error;
  }
};

// Lấy đơn hàng của user từ AsyncStorage
const getUserOrdersFromStorage = async (userId) => {
  try {
    const ordersJson = await AsyncStorage.getItem(`${USER_ORDERS_KEY}_${userId}`);
    return ordersJson ? JSON.parse(ordersJson) : [];
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng từ storage:', error);
    return [];
  }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async () => {
  try {
    // Lấy thông tin user hiện tại
    const currentUserData = await AsyncStorage.getItem('userData');
    if (!currentUserData) {
      return [];
    }

    const user = JSON.parse(currentUserData);
    const userId = user._id || 'guest';

    return await getUserOrdersFromStorage(userId);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return [];
  }
};

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = async (orderId) => {
  try {
    // Lấy thông tin user hiện tại
    const currentUserData = await AsyncStorage.getItem('userData');
    if (!currentUserData) {
      return null;
    }

    const user = JSON.parse(currentUserData);
    const userId = user._id || 'guest';

    const orders = await getUserOrdersFromStorage(userId);
    return orders.find(order => order._id === orderId) || null;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin đơn hàng ${orderId}:`, error);
    return null;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    // Lấy thông tin user hiện tại
    const currentUserData = await AsyncStorage.getItem('userData');
    if (!currentUserData) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    const user = JSON.parse(currentUserData);
    const userId = user._id || 'guest';

    const orders = await getUserOrdersFromStorage(userId);
    const updatedOrders = orders.map(order =>
      order._id === orderId
        ? { ...order, status: 'cancelled', updatedAt: new Date().toISOString() }
        : order
    );

    await saveUserOrdersToStorage(userId, updatedOrders);

    return { success: true, message: 'Đã hủy đơn hàng thành công' };
  } catch (error) {
    console.error(`Lỗi khi hủy đơn hàng ${orderId}:`, error);
    throw error;
  }
};

// Lưu đơn hàng gần đây vào AsyncStorage
export const saveRecentOrdersToStorage = async (orders) => {
  try {
    // Chỉ lưu tối đa 10 đơn hàng gần nhất
    const recentOrders = orders.slice(0, 10);
    await AsyncStorage.setItem('recentOrders', JSON.stringify(recentOrders));
  } catch (error) {
    console.error('Lỗi khi lưu đơn hàng gần đây:', error);
  }
};

// Lấy đơn hàng gần đây từ AsyncStorage
export const getRecentOrdersFromStorage = async () => {
  try {
    const recentOrders = await AsyncStorage.getItem('recentOrders');
    return recentOrders ? JSON.parse(recentOrders) : [];
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng gần đây từ storage:', error);
    return [];
  }
};

// Lấy trạng thái đơn hàng dưới dạng text
export const getOrderStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Đang xử lý';
    case 'processing':
      return 'Đang chuẩn bị hàng';
    case 'shipping':
      return 'Đang giao hàng';
    case 'delivered':
      return 'Đã giao hàng';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

// Lấy phương thức thanh toán dưới dạng text
export const getPaymentMethodText = (method) => {
  switch (method) {
    case 'cod':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'momo':
      return 'Ví MoMo';
    case 'zalopay':
      return 'ZaloPay';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    case 'atm_card':
      return 'Thẻ ATM/Debit';
    case 'e_wallet':
      return 'Ví điện tử';
    default:
      return 'Không xác định';
  }
};

// DEVELOPMENT ONLY - Xóa tất cả đơn hàng trong AsyncStorage
export const clearAllOrdersFromStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const orderKeys = keys.filter(key => key.includes('USER_ORDERS') || key.includes('recentOrders'));

    console.log('Tìm thấy các keys đơn hàng:', orderKeys);

    if (orderKeys.length > 0) {
      await AsyncStorage.multiRemove(orderKeys);
      console.log('Đã xóa tất cả đơn hàng từ AsyncStorage');
      return true;
    } else {
      console.log('Không tìm thấy đơn hàng nào trong AsyncStorage');
      return false;
    }
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    return false;
  }
};

// DEVELOPMENT ONLY - Xem tất cả keys trong AsyncStorage
export const debugAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('Tất cả keys trong AsyncStorage:', keys);

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, value);
    }
  } catch (error) {
    console.error('Lỗi khi debug AsyncStorage:', error);
  }
};

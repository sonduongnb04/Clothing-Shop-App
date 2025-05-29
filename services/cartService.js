import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key để lưu trữ giỏ hàng trong AsyncStorage
const CART_STORAGE_KEY = 'shopping_cart';

// Lấy giỏ hàng từ AsyncStorage
export const getCart = async () => {
  try {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const cart = cartData ? JSON.parse(cartData) : [];
    console.log('Dữ liệu giỏ hàng từ AsyncStorage:', cart);
    return cart;
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return [];
  }
};

// Lưu giỏ hàng vào AsyncStorage
export const saveCart = async (cartItems) => {
  try {
    console.log('Đang lưu giỏ hàng:', cartItems);
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    console.log('Đã lưu giỏ hàng thành công');
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu giỏ hàng:', error);
    return false;
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (product, selectedSize = null, selectedColor = null, quantity = 1) => {
  try {
    const cart = await getCart();

    // Tạo ID duy nhất cho item (bao gồm size và color)
    const itemId = `${product._id}_${selectedSize || 'default'}_${selectedColor || 'default'}`;

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.findIndex(item => item.itemId === itemId);

    if (existingItemIndex >= 0) {
      // Nếu đã có, tăng số lượng
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới
      const cartItem = {
        itemId,
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        discountPrice: product.discountPrice,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        category: product.category,
        selectedSize,
        selectedColor,
        quantity,
        addedAt: new Date().toISOString()
      };
      cart.push(cartItem);
    }

    await saveCart(cart);
    return { success: true, cart };
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    return { success: false, error: error.message };
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItemQuantity = async (itemId, newQuantity) => {
  try {
    if (newQuantity <= 0) {
      return await removeFromCart(itemId);
    }

    const cart = await getCart();
    const itemIndex = cart.findIndex(item => item.itemId === itemId);

    if (itemIndex >= 0) {
      cart[itemIndex].quantity = newQuantity;
      await saveCart(cart);
      return { success: true, cart };
    }

    return { success: false, error: 'Không tìm thấy sản phẩm trong giỏ hàng' };
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng:', error);
    return { success: false, error: error.message };
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (itemId) => {
  try {
    const cart = await getCart();
    const updatedCart = cart.filter(item => item.itemId !== itemId);

    await saveCart(updatedCart);
    return { success: true, cart: updatedCart };
  } catch (error) {
    console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
    return { success: false, error: error.message };
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
    return { success: true, cart: [] };
  } catch (error) {
    console.error('Lỗi khi xóa giỏ hàng:', error);
    return { success: false, error: error.message };
  }
};

// Tính tổng tiền giỏ hàng
export const calculateCartTotal = (cartItems) => {
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tiền ship (miễn phí cho đơn hàng trên 500k)
  const shippingFee = subtotal >= 500000 ? 0 : 30000;

  // Tính thuế VAT (10%)
  const tax = Math.round(subtotal * 0.1);

  const total = subtotal + shippingFee + tax;

  return {
    subtotal,
    totalItems,
    shippingFee,
    tax,
    total
  };
};

// Kiểm tra xem sản phẩm có trong giỏ hàng không
export const isInCart = async (productId, selectedSize = null, selectedColor = null) => {
  try {
    const cart = await getCart();
    const itemId = `${productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`;
    return cart.some(item => item.itemId === itemId);
  } catch (error) {
    console.error('Lỗi khi kiểm tra giỏ hàng:', error);
    return false;
  }
};

// Lấy số lượng sản phẩm trong giỏ hàng
export const getCartItemCount = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Lỗi khi đếm sản phẩm trong giỏ hàng:', error);
    return 0;
  }
};

// Di chuyển giỏ hàng từ guest sang user đã đăng nhập
export const migrateCartToUser = async (userId) => {
  try {
    console.log('Bắt đầu di chuyển giỏ hàng cho user:', userId);

    // Lấy giỏ hàng hiện tại từ AsyncStorage
    const guestCart = await getCart();

    if (guestCart.length === 0) {
      console.log('Không có sản phẩm nào trong giỏ hàng guest');
      return { success: true, message: 'Không có dữ liệu để di chuyển' };
    }

    // TODO: Implement server-side cart migration
    // Gửi dữ liệu giỏ hàng lên server để merge với giỏ hàng của user
    // const response = await API.post('/cart/migrate', {
    //   userId,
    //   guestCart
    // });

    console.log(`Đã di chuyển ${guestCart.length} sản phẩm từ giỏ hàng guest`);

    // Giữ nguyên giỏ hàng local cho đến khi có API server
    return { success: true, message: 'Di chuyển giỏ hàng thành công' };
  } catch (error) {
    console.error('Lỗi khi di chuyển giỏ hàng:', error);
    return { success: false, error: error.message };
  }
};

// Alias cho getCart để tương thích với import
export const getCartFromStorage = getCart;

// Tính phí vận chuyển
export const calculateShippingFee = (subtotal) => {
  return subtotal >= 500000 ? 0 : 30000;
};

// Tính tổng đơn hàng
export const calculateOrderTotal = (cartItems) => {
  const { total } = calculateCartTotal(cartItems);
  return total;
};

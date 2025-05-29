import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Key để lưu trữ danh sách yêu thích trong AsyncStorage
const WISHLIST_STORAGE_KEY = 'WISHLIST_ITEMS';

// Lấy key lưu trữ dựa trên userId
const getStorageKey = (userId) => {
  return userId ? `${WISHLIST_STORAGE_KEY}_${userId}` : WISHLIST_STORAGE_KEY;
};

// Lấy danh sách yêu thích từ AsyncStorage
export const getWishlistFromStorage = async (userId = undefined) => {
  try {
    const storageKey = getStorageKey(userId);
    console.log('Đang lấy wishlist với key:', storageKey);
    const wishlistJson = await AsyncStorage.getItem(storageKey);
    const wishlist = wishlistJson ? JSON.parse(wishlistJson) : [];
    console.log('Lấy được wishlist:', wishlist.length, 'items');
    return wishlist;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích:', error);
    return [];
  }
};

// Lưu danh sách yêu thích vào AsyncStorage
const saveWishlistToStorage = async (wishlist, userId = undefined) => {
  try {
    const storageKey = getStorageKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(wishlist));
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu danh sách yêu thích:', error);
    throw error;
  }
};

// Kiểm tra sản phẩm có trong danh sách yêu thích không
export const isInWishlist = async (productId, userId = undefined) => {
  try {
    const wishlist = await getWishlistFromStorage(userId);
    return wishlist.some(item => item._id === productId);
  } catch (error) {
    console.error('Lỗi khi kiểm tra sản phẩm trong danh sách yêu thích:', error);
    return false;
  }
};

// Thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = async (product, userId = undefined) => {
  try {
    console.log('Đang thêm vào wishlist:', { productId: product._id, productName: product.name, userId });
    const wishlist = await getWishlistFromStorage(userId);
    console.log('Wishlist hiện tại:', wishlist.length, 'items');

    // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
    const existingProductIndex = wishlist.findIndex(item => item._id === product._id);

    if (existingProductIndex === -1) {
      // Nếu chưa có, thêm vào danh sách
      console.log('Product data being saved to wishlist:', JSON.stringify(product, null, 2));
      wishlist.push(product);
      await saveWishlistToStorage(wishlist, userId);
      console.log('Đã thêm vào wishlist thành công. Tổng:', wishlist.length, 'items');
      return true;
    }

    console.log('Sản phẩm đã có trong wishlist');
    return false; // Sản phẩm đã có trong danh sách yêu thích
  } catch (error) {
    console.error('Lỗi khi thêm vào danh sách yêu thích:', error);
    throw error;
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = async (productId, userId = undefined) => {
  try {
    const wishlist = await getWishlistFromStorage(userId);
    const updatedWishlist = wishlist.filter(item => item._id !== productId);

    await saveWishlistToStorage(updatedWishlist, userId);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa khỏi danh sách yêu thích:', error);
    throw error;
  }
};

// Lấy số lượng sản phẩm trong danh sách yêu thích
export const getWishlistCount = async (userId = undefined) => {
  try {
    const wishlist = await getWishlistFromStorage(userId);
    return wishlist.length;
  } catch (error) {
    console.error('Lỗi khi lấy số lượng sản phẩm yêu thích:', error);
    return 0;
  }
};

// Chuyển danh sách yêu thích từ khách không đăng nhập sang tài khoản đã đăng nhập
export const migrateWishlistToUser = async (userId) => {
  if (!userId) return [];

  try {
    // Lấy danh sách yêu thích của khách không đăng nhập
    const guestWishlist = await getWishlistFromStorage(undefined);

    if (guestWishlist && guestWishlist.length > 0) {
      // Lấy danh sách yêu thích hiện tại của người dùng đã đăng nhập
      const userWishlist = await getWishlistFromStorage(userId);

      // Hợp nhất danh sách yêu thích
      const mergedWishlist = [...userWishlist];

      // Thêm các sản phẩm từ danh sách yêu thích khách vào danh sách yêu thích người dùng
      for (const guestItem of guestWishlist) {
        const existingItemIndex = mergedWishlist.findIndex(item => item._id === guestItem._id);

        if (existingItemIndex === -1) {
          // Nếu sản phẩm chưa có, thêm mới
          mergedWishlist.push(guestItem);
        }
      }

      // Lưu danh sách yêu thích đã hợp nhất vào tài khoản người dùng
      await saveWishlistToStorage(mergedWishlist, userId);

      // Xóa danh sách yêu thích của khách không đăng nhập
      await saveWishlistToStorage([], undefined);

      return mergedWishlist;
    }

    return await getWishlistFromStorage(userId);
  } catch (error) {
    console.error('Lỗi khi chuyển danh sách yêu thích sang tài khoản:', error);
    throw error;
  }
};

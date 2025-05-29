import API from './api';

// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    const response = await API.get('/products');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (productId) => {
  try {
    const response = await API.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin sản phẩm ${productId}:`, error);
    throw error;
  }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (categoryId) => {
  try {
    // Sử dụng endpoint từ categoryRoutes.js
    const response = await API.get(`/categories/${categoryId}/products`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm theo danh mục ${categoryId}:`, error);
    throw error;
  }
};

// Tìm kiếm sản phẩm
export const searchProducts = async (query) => {
  try {
    const response = await API.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    throw error;
  }
};

// Lấy tất cả danh mục
export const getAllCategories = async () => {
  try {
    const response = await API.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    throw error;
  }
};

// Helper function để format giá tiền
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Helper function để tính phần trăm giảm giá
export const calculateDiscountPercentage = (originalPrice, discountPrice) => {
  if (!discountPrice || discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

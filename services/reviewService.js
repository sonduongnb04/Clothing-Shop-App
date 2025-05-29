import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Key để lưu trữ đánh giá trong AsyncStorage
const REVIEWS_STORAGE_KEY = 'PRODUCT_REVIEWS';

// Định nghĩa kiểu dữ liệu đánh giá
export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

// Lấy tất cả đánh giá từ AsyncStorage
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const reviewsJson = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
    return reviewsJson ? JSON.parse(reviewsJson) : [];
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    return [];
  }
};

// Lưu tất cả đánh giá vào AsyncStorage
const saveReviews = async (reviews: Review[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Lỗi khi lưu đánh giá:', error);
    throw error;
  }
};

// Lấy đánh giá của một sản phẩm
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const allReviews = await getAllReviews();
    return allReviews.filter(review => review.productId === productId);
  } catch (error) {
    console.error(`Lỗi khi lấy đánh giá của sản phẩm ${productId}:`, error);
    return [];
  }
};

// Thêm đánh giá mới
export const addReview = async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  try {
    const allReviews = await getAllReviews();
    
    // Tạo ID và ngày cho đánh giá mới
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    
    // Thêm vào danh sách và lưu
    allReviews.push(newReview);
    await saveReviews(allReviews);
    
    return newReview;
  } catch (error) {
    console.error('Lỗi khi thêm đánh giá:', error);
    throw error;
  }
};

// Tính điểm đánh giá trung bình của sản phẩm
export const calculateAverageRating = async (productId: string): Promise<number> => {
  try {
    const reviews = await getProductReviews(productId);
    
    if (reviews.length === 0) {
      return 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  } catch (error) {
    console.error(`Lỗi khi tính điểm đánh giá trung bình của sản phẩm ${productId}:`, error);
    return 0;
  }
};

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
  FlatList,
  Text
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getProductById } from '@/services/productService';
import { getProductReviews, addReview, calculateAverageRating } from '@/services/reviewService';
import { useAuth } from '@/app/_layout';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import API from '@/services/api';

// Định nghĩa kiểu dữ liệu
type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: {
    _id: string;
    name: string;
  };
  images: string[];
  description: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating?: number;
  stockCount?: number;
  sold?: number;
  installmentInfo?: string;
  discountPercent?: number;
  brand?: string;
  variants?: {
    color: string;
    image: string;
  }[];
};

type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [stockCount, setStockCount] = useState<number>(0);
  const [loadingWishlist, setLoadingWishlist] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // Hình ảnh mặc định khi không có ảnh từ API
  const defaultImage = require('@/assets/images/icon.png');

  // Lấy baseURL từ cấu hình API (bỏ phần /api)
  const baseURL = API.defaults.baseURL?.replace('/api', '');

  // Lấy thông tin sản phẩm khi component được mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id as string);
        setProduct(data);

        // Đặt kích thước và màu sắc mặc định nếu có
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }

        // Đặt số lượng tồn kho
        setStockCount(data.stockCount || 0);

        // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
        const checkWishlist = async () => {
          try {
            const isInWishlistStatus = await isInWishlist(data._id, user?._id || undefined);
            setIsWishlisted(isInWishlistStatus);
          } catch (error) {
            console.error('Lỗi khi kiểm tra danh sách yêu thích:', error);
          }
        };
        checkWishlist();

        // Lấy đánh giá sản phẩm
        const productReviews = await getProductReviews(data._id);
        setReviews(productReviews);

        // Tính điểm đánh giá trung bình
        const avgRating = await calculateAverageRating(data._id);
        setAverageRating(avgRating);
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin sản phẩm ${id}:`, error);
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Tăng số lượng
  const increaseQuantity = () => {
    if (quantity < (product?.stockCount || 99)) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Thông báo', 'Đã đạt số lượng tối đa có thể mua');
    }
  };

  // Giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // Kiểm tra nếu sản phẩm có kích thước nhưng chưa chọn
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        return Alert.alert('Thông báo', 'Vui lòng chọn kích thước');
      }

      // Kiểm tra nếu sản phẩm có màu sắc nhưng chưa chọn
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        return Alert.alert('Thông báo', 'Vui lòng chọn màu sắc');
      }

      const result = await addToCart(product, selectedSize, selectedColor, quantity);
      if (result.success) {
        Alert.alert(
          'Thành công',
          result.message || 'Đã thêm sản phẩm vào giỏ hàng',
          [
            { text: 'Tiếp tục mua sắm', style: 'cancel' },
            { text: 'Đến giỏ hàng', onPress: () => router.push('/(tabs)/cart') }
          ]
        );
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  // Xử lý thêm/xóa sản phẩm khỏi danh sách yêu thích
  const toggleWishlist = async () => {
    if (!product) return;

    try {
      setLoadingWishlist(true);

      if (isWishlisted) {
        // Nếu đã trong danh sách yêu thích, xóa khỏi danh sách
        const result = await removeFromWishlist(product._id, user?._id || undefined);
        if (result.success) {
          setIsWishlisted(false);
          Alert.alert('Thông báo', result.message);
        } else {
          Alert.alert('Lỗi', result.message);
        }
      } else {
        // Nếu chưa có trong danh sách yêu thích, thêm vào danh sách
        const result = await addToWishlist(product, user?._id || undefined);
        if (result.success) {
          setIsWishlisted(true);
          Alert.alert('Thông báo', result.message);
        } else {
          Alert.alert('Thông báo', result.message);
        }
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Xử lý mua ngay
  const handleBuyNow = async () => {
    if (!product) return;

    try {
      // Kiểm tra nếu sản phẩm có kích thước nhưng chưa chọn
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        return Alert.alert('Thông báo', 'Vui lòng chọn kích thước');
      }

      // Kiểm tra nếu sản phẩm có màu sắc nhưng chưa chọn
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        return Alert.alert('Thông báo', 'Vui lòng chọn màu sắc');
      }

      // Thêm vào giỏ hàng trước, sau đó chuyển đến trang thanh toán
      const result = await addToCart(product, selectedSize, selectedColor, quantity);
      if (result.success) {
        router.push('/checkout');
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi mua ngay:', error);
      Alert.alert('Lỗi', 'Không thể xử lý yêu cầu mua ngay. Vui lòng thử lại sau.');
    }
  };

  // Hiển thị số sao đánh giá
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome key={`star-${i}`} name="star" size={16} color="#FFD700" style={styles.starIcon} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FontAwesome key={`star-half-${i}`} name="star-half-o" size={16} color="#FFD700" style={styles.starIcon} />
        );
      } else {
        stars.push(
          <FontAwesome key={`star-o-${i}`} name="star-o" size={16} color="#FFD700" style={styles.starIcon} />
        );
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText style={styles.loadingText}>Đang tải thông tin sản phẩm...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Không tìm thấy thông tin sản phẩm</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Tính giá khuyến mãi và phần trăm giảm giá
  const discountPrice = product.discountPrice || product.price;
  const originalPrice = product.price;
  const discountPercent = product.discountPercent ||
    (originalPrice > discountPrice
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header với nút quay lại và yêu thích */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Chi tiết sản phẩm</ThemedText>
          <TouchableOpacity onPress={toggleWishlist} style={styles.wishlistButton} disabled={loadingWishlist}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color={isWishlisted ? "#e74c3c" : "#000"}
            />
          </TouchableOpacity>
        </View>

        {/* Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF4500" />
          ) : (
            <Image
              source={product.images && product.images.length > 0
                ? { uri: `${baseURL}/images/${product.category?.name?.toLowerCase()}/${product.images[selectedImageIndex]}` }
                : defaultImage}
              style={styles.mainImage}
              resizeMode="cover"
            />
          )}

          {/* Hiển thị phần trăm giảm giá */}
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>-{discountPercent}%</ThemedText>
            </View>
          )}

          {/* Gallery ảnh nhỏ */}
          {product.images && product.images.length > 1 && (
            <View style={styles.thumbnailGallery}>
              <FlatList
                data={product.images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `thumbnail-${index}`}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.thumbnailItem,
                      selectedImageIndex === index && styles.selectedThumbnailItem
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      source={{ uri: `${baseURL}/images/${product.category?.name?.toLowerCase()}/${item}` }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Thông tin giá và khuyến mãi */}
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <ThemedText style={styles.discountPriceText}>đ{discountPrice.toLocaleString()}</ThemedText>
            {discountPrice < originalPrice && (
              <ThemedText style={styles.originalPriceText}>{originalPrice.toLocaleString()}đ</ThemedText>
            )}
          </View>
        </View>

        {/* Tên sản phẩm và đánh giá */}
        <View style={styles.productInfoContainer}>
          <ThemedText style={styles.productNameText}>{product.name}</ThemedText>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(averageRating)}
              <ThemedText style={styles.ratingText}>{averageRating.toFixed(1)}</ThemedText>
            </View>
            <ThemedText style={styles.soldText}>Đã bán {product.sold || 0}</ThemedText>
          </View>
        </View>

        {/* Chọn kích thước */}
        {product.sizes && product.sizes.length > 0 && (
          <View style={styles.optionContainer}>
            <ThemedText style={styles.optionTitle}>Kích thước:</ThemedText>
            <View style={styles.sizeOptions}>
              {product.sizes.map((size, index) => (
                <TouchableOpacity
                  key={`size-${index}`}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <ThemedText style={selectedSize === size ? styles.selectedOptionText : styles.optionText}>
                    {size}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Số lượng */}
        <View style={styles.quantityContainer}>
          <ThemedText style={styles.optionTitle}>Số lượng:</ThemedText>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= (product.stockCount || 99) && styles.disabledButton]}
              onPress={increaseQuantity}
              disabled={quantity >= (product.stockCount || 99)}
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.stockText}>
              {product.inStock
                ? `Còn ${product.stockCount || 'hàng'} sản phẩm`
                : 'Hết hàng'}
            </ThemedText>
          </View>
        </View>

        {/* Mô tả sản phẩm */}
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.sectionTitle}>Mô tả sản phẩm</ThemedText>
          <ThemedText style={styles.descriptionText}>{product.description}</ThemedText>
        </View>

        {/* Đánh giá sản phẩm */}
        <View style={styles.reviewsContainer}>
          <ThemedText style={styles.sectionTitle}>Đánh giá sản phẩm</ThemedText>
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <ThemedText style={styles.reviewerName}>{review.userName}</ThemedText>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <ThemedText style={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
              </View>
            ))
          ) : (
            <ThemedText style={styles.noReviewsText}>Chưa có đánh giá nào</ThemedText>
          )}
        </View>
      </ScrollView>

      {/* Nút thao tác */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <ThemedText style={styles.buttonText}>Thêm vào giỏ hàng</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyNowButton, !product.inStock && styles.disabledButton]}
          onPress={handleBuyNow}
          disabled={!product.inStock}
        >
          <ThemedText style={styles.buttonText}>Mua ngay</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  wishlistButton: {
    padding: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 350,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 5,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  thumbnailGallery: {
    padding: 10,
    backgroundColor: '#fff',
  },
  thumbnailItem: {
    width: 70,
    height: 70,
    marginRight: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedThumbnailItem: {
    borderColor: '#3498db',
  },
  thumbnailImage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  variantsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    left: 10,
  },
  variantItem: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedVariantItem: {
    borderColor: '#3498db',
  },
  variantImage: {
    width: '100%',
    height: '100%',
  },
  priceContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  originalPriceText: {
    fontSize: 16,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  installmentContainer: {
    marginTop: 5,
  },
  installmentText: {
    fontSize: 14,
    color: '#3498db',
  },
  productInfoContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  productNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#7f8c8d',
  },
  soldText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  optionContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 14,
  },
  selectedOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  quantityContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  stockText: {
    marginLeft: 15,
    fontSize: 14,
    color: '#7f8c8d',
  },
  descriptionContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#34495e',
  },
  reviewsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  reviewItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    color: '#34495e',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  soldInfo: {
    marginLeft: 10,
  },
});

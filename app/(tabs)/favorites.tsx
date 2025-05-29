import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/_layout';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useWishlist } from '@/contexts/WishlistContext';
import API from '@/services/api';

// Định nghĩa kiểu dữ liệu
type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  description?: string;
  category?: string | {
    _id: string;
    name: string;
  };
  rating?: number;
  stockCount?: number;
  sold?: number;
};

// Hình ảnh mặc định khi không có ảnh từ API
const defaultImage = require('@/assets/images/partial-react-logo.png');

// Lấy kích thước màn hình
const { width } = Dimensions.get('window');

// Lấy baseURL từ cấu hình API (bỏ phần /api)
const baseURL = API.defaults.baseURL?.replace('/api', '');

export default function FavoritesScreen() {
  const router = useRouter();
  const [itemLoading, setItemLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean, productId: string | null }>({ visible: false, productId: null });
  const [categories, setCategories] = useState<any[]>([]);
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist, loadWishlist } = useWishlist();

  // Sử dụng ref để lưu trữ animation theo từng sản phẩm
  const fadeAnimMap = useRef<Record<string, Animated.Value>>({});

  // Khởi tạo animation khi wishlistItems thay đổi
  useEffect(() => {
    const newFadeAnimMap: Record<string, Animated.Value> = {};
    wishlistItems.forEach((item: Product) => {
      if (!fadeAnimMap.current[item._id]) {
        newFadeAnimMap[item._id] = new Animated.Value(1);
      } else {
        newFadeAnimMap[item._id] = fadeAnimMap.current[item._id];
      }
    });
    fadeAnimMap.current = newFadeAnimMap;
  }, [wishlistItems]);

  // Lấy danh sách categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(response.data);
        console.log('Loaded categories:', response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    loadWishlist(user?._id || undefined);
  }, [user, loadWishlist]);

  // Làm mới danh sách yêu thích
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadWishlist(user?._id || undefined);
    } catch (error) {
      console.error('Lỗi khi làm mới danh sách yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
    } finally {
      setRefreshing(false);
    }
  }, [user, loadWishlist]);

  // Xóa sản phẩm khỏi danh sách yêu thích
  const handleRemoveFromWishlist = useCallback(async (productId: string) => {
    try {
      setItemLoading(productId);

      // Lấy animation cho sản phẩm cụ thể
      const fadeAnim = fadeAnimMap.current[productId];
      if (!fadeAnim) {
        setItemLoading(null);
        return;
      }

      // Hiệu ứng fade out trước khi xóa
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(async () => {
        const result = await removeFromWishlist(productId, user?._id || undefined);
        if (result.success) {
          Alert.alert('Thành công', result.message);
        } else {
          Alert.alert('Lỗi', result.message);
          // Reset animation nếu có lỗi
          fadeAnim.setValue(1);
        }
        setItemLoading(null);
      });
    } catch (error) {
      console.error('Lỗi khi xóa khỏi danh sách yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi danh sách yêu thích');
      // Reset animation nếu có lỗi
      const fadeAnim = fadeAnimMap.current[productId];
      if (fadeAnim) {
        fadeAnim.setValue(1);
      }
      setItemLoading(null);
    }
  }, [user, removeFromWishlist]);

  // Chuyển đến trang chi tiết sản phẩm
  const handleViewProductDetails = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);

  // Hiển thị hộp thoại xác nhận xóa sản phẩm
  const showDeleteConfirmation = useCallback((productId: string) => {
    setConfirmModal({
      visible: true,
      productId: productId
    });
  }, []);

  const renderWishlistItem = useCallback(({ item }: { item: Product }) => {
    // Lấy animation cho sản phẩm này
    const fadeAnim = fadeAnimMap.current[item._id] || new Animated.Value(1);

    // Xây dựng URL ảnh đúng cách - xử lý cả object và string category
    const getImageUrl = (item: Product) => {
      if (item.images && item.images.length > 0) {
        let categoryName = '';

        // Debug log để kiểm tra cấu trúc category
        console.log('Favorites - Product:', item.name);
        console.log('Favorites - Category data:', JSON.stringify(item.category, null, 2));
        console.log('Favorites - Images:', item.images);

        if (item.category) {
          if (typeof item.category === 'object' && item.category.name) {
            // Trường hợp category là object với thuộc tính name
            categoryName = item.category.name;
            console.log('Favorites - Category name from object:', categoryName);
          } else if (typeof item.category === 'string') {
            // Trường hợp category là string ID - tìm tên từ danh sách categories
            const category = categories.find(cat => cat._id === item.category);
            if (category) {
              categoryName = category.name;
              console.log('Favorites - Category name from ID mapping:', categoryName);
            } else {
              // Fallback: thử với các tên category thường gặp
              console.log('Favorites - Category not found in mapping, using fallback');
              const commonCategories = ['áo', 'quần', 'váy', 'phụ kiện'];
              categoryName = commonCategories[0]; // Mặc định là 'áo'
            }
          }
        }

        if (categoryName) {
          const imageUrl = `${baseURL}/images/${categoryName.toLowerCase()}/${item.images[0]}`;
          console.log('Favorites - Final Image URL for', item.name, ':', imageUrl);
          return imageUrl;
        }
      }
      console.log('Favorites - No valid image URL for', item.name);
      return null;
    };

    const imageUrl = getImageUrl(item);

    return (
      <Animated.View style={[styles.wishlistItem, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.itemImageContainer}
          onPress={() => handleViewProductDetails(item._id)}
          disabled={itemLoading === item._id}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Image load error for', item.name, ':', error.nativeEvent.error);
              }}
              onLoad={() => {
                console.log('Image loaded successfully for', item.name);
              }}
            />
          ) : (
            <Image
              source={defaultImage}
              style={styles.itemImage}
              resizeMode="cover"
            />
          )}
          {item.discountPrice && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountBadgeText}>
                -{Math.round(((item.price - item.discountPrice) / item.price) * 100)}%
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <ThemedView style={styles.itemDetails}>
          <TouchableOpacity
            onPress={() => handleViewProductDetails(item._id)}
            disabled={itemLoading === item._id}
          >
            <ThemedText style={styles.itemName} numberOfLines={2}>{item.name}</ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.priceContainer}>
            {item.discountPrice ? (
              <>
                <ThemedText style={styles.discountPrice}>
                  {item.discountPrice.toLocaleString()}đ
                </ThemedText>
                <ThemedText style={styles.originalPrice}>
                  {item.price.toLocaleString()}đ
                </ThemedText>
              </>
            ) : (
              <ThemedText style={styles.discountPrice}>
                {item.price.toLocaleString()}đ
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleViewProductDetails(item._id)}
              disabled={itemLoading === item._id}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <ThemedText style={styles.addToCartText}>Mua ngay</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => showDeleteConfirmation(item._id)}
              disabled={itemLoading === item._id}
            >
              {itemLoading === item._id ? (
                <ActivityIndicator size="small" color="#FF4500" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#FF4500" />
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Animated.View>
    );
  }, [handleViewProductDetails, showDeleteConfirmation, itemLoading, categories]);

  // Hiển thị trạng thái rỗng
  const renderEmptyState = useCallback(() => (
    <ThemedView style={styles.emptyWishlist}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <ThemedText style={styles.emptyWishlistTitle}>Chưa có sản phẩm yêu thích</ThemedText>
      <ThemedText style={styles.emptyWishlistText}>Hãy thêm sản phẩm vào danh sách yêu thích để xem sau</ThemedText>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => router.push({ pathname: '/(tabs)/' } as any)}
      >
        <ThemedText style={styles.shopNowButtonText}>Mua sắm ngay</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  ), [router]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF4500" />
        <ThemedText style={styles.loadingText}>Đang tải danh sách yêu thích...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Yêu thích</ThemedText>
        {!user && (
          <ThemedText style={styles.loginPrompt}>
            Vui lòng <TouchableOpacity onPress={() => router.push('/login')}><ThemedText style={styles.loginLink}>đăng nhập</ThemedText></TouchableOpacity> để lưu danh sách yêu thích
          </ThemedText>
        )}
      </ThemedView>

      {/* Modal xác nhận xóa sản phẩm */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModal.visible}
        onRequestClose={() => setConfirmModal({ ...confirmModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Xác nhận</ThemedText>
            <ThemedText style={styles.modalMessage}>Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?</ThemedText>
            <ThemedView style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmModal({ visible: false, productId: null })}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (confirmModal.productId) {
                    handleRemoveFromWishlist(confirmModal.productId);
                  }
                  setConfirmModal({ visible: false, productId: null });
                }}
              >
                <ThemedText style={styles.deleteButtonText}>Xóa</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>

      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.wishlistList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF4500']}
              tintColor="#FF4500"
            />
          }
        />
      ) : renderEmptyState()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Loading styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },

  // Container styles
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f9f9f9',
  },

  // Header styles
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loginPrompt: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#FF4500',
    textDecorationLine: 'underline',
  },

  // List styles
  wishlistList: {
    paddingHorizontal: 8, // Reduced for grid layout
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  // Item styles
  wishlistItem: {
    width: width / 2 - 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  itemImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    height: 40, // Fixed height for 2 lines
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },

  // Empty state
  emptyWishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyWishlistTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyWishlistText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  shopNowButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

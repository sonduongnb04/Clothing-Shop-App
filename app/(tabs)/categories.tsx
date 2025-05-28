import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Image, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAllCategories, getProductsByCategory } from '@/src/services/productService';
import API from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { addToWishlist, isInWishlist, removeFromWishlist } from '@/src/services/wishlistService';
import { useAuth } from '@/app/_layout';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Định nghĩa kiểu dữ liệu
type Category = {
  _id: string;
  name: string;
  image: string;
  description?: string;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  description?: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating?: number;
};

// Hình ảnh mặc định khi không có ảnh từ API
const defaultImage = require('@/assets/images/icon.png');

// Lấy baseURL từ cấu hình API (bỏ phần /api)
const baseURL = API.defaults.baseURL?.replace('/api', '');

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const urlCategoryId = params.category as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [wishlistStates, setWishlistStates] = useState<Record<string, boolean>>({});
  const [loadingWishlist, setLoadingWishlist] = useState<string | null>(null);
  const { user } = useAuth();

  // Lấy danh sách danh mục khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);

        if (data.length > 0) {
          // Nếu có tham số category từ URL và tồn tại trong danh sách
          if (urlCategoryId) {
            const decodedCategoryName = decodeURIComponent(urlCategoryId);
            const categoryExists = data.find((cat: Category) =>
              cat.name.toLowerCase() === decodedCategoryName.toLowerCase()
            );

            if (categoryExists) {
              setSelectedCategory(categoryExists._id);
              fetchProductsByCategory(categoryExists._id);
            } else {
              // Nếu không tìm thấy, chọn danh mục đầu tiên
              setSelectedCategory(data[0]._id);
              fetchProductsByCategory(data[0]._id);
            }
          } else {
            // Nếu không có tham số category, chọn danh mục đầu tiên
            setSelectedCategory(data[0]._id);
            fetchProductsByCategory(data[0]._id);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [urlCategoryId]);

  // Lấy sản phẩm theo danh mục khi danh mục được chọn thay đổi
  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      setLoadingProducts(true);
      const data = await getProductsByCategory(categoryId);
      setProducts(data);
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm theo danh mục ${categoryId}:`, error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Kiểm tra và cập nhật trạng thái yêu thích cho tất cả sản phẩm
  useEffect(() => {
    const checkWishlistStates = async () => {
      if (products.length === 0) return;

      const states: Record<string, boolean> = {};
      for (const product of products) {
        states[product._id] = await isInWishlist(product._id, user?._id);
      }
      setWishlistStates(states);
    };

    checkWishlistStates();
  }, [products, user]);

  // Xử lý thêm/xóa sản phẩm khỏi danh sách yêu thích
  const handleToggleWishlist = async (product: Product) => {
    try {
      setLoadingWishlist(product._id);

      if (!user) {
        Alert.alert(
          'Thông báo',
          'Vui lòng đăng nhập để sử dụng tính năng này',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng nhập', onPress: () => router.push('/login') }
          ]
        );
        setLoadingWishlist(null);
        return;
      }

      const isLiked = wishlistStates[product._id] || false;

      if (isLiked) {
        await removeFromWishlist(product._id, user._id);
        Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi danh sách yêu thích');
      } else {
        await addToWishlist(product, user._id);
        Alert.alert('Thành công', 'Đã thêm sản phẩm vào danh sách yêu thích');
      }

      // Cập nhật trạng thái yêu thích
      setWishlistStates(prev => ({
        ...prev,
        [product._id]: !isLiked
      }));
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác. Vui lòng thử lại sau.');
    } finally {
      setLoadingWishlist(null);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item._id && styles.selectedCategoryTab
      ]}
      onPress={() => {
        setSelectedCategory(item._id);
        fetchProductsByCategory(item._id);
      }}
    >
      <ThemedText
        style={[
          styles.categoryTabText,
          selectedCategory === item._id && styles.selectedCategoryTabText
        ]}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    // Tạo URL cho hình ảnh
    let imageUrl = null;
    if (item.images && item.images.length > 0) {
      // Lấy tên danh mục từ category
      const categoryName = categories.find(cat => cat._id === item.category)?.name || '';

      // Tạo đường dẫn ảnh với thư mục danh mục
      if (categoryName) {
        imageUrl = `${baseURL}/images/${categoryName.toLowerCase()}/${item.images[0]}`;
        console.log("Đường dẫn hình ảnh:", imageUrl);
      }
    }

    const isLiked = wishlistStates[item._id] || false;
    const isLoading = loadingWishlist === item._id;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          console.log(`Navigating to product: ${item._id}`);
          router.push(`/product/${item._id}`);
        }}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={imageUrl ? { uri: imageUrl } : defaultImage}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => handleToggleWishlist(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF4500" />
            ) : (
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#e74c3c" : "#333"}
              />
            )}
          </TouchableOpacity>
        </View>
        <ThemedView style={styles.productInfo}>
          <ThemedText style={styles.productName}>{item.name}</ThemedText>
          <ThemedView style={styles.priceContainer}>
            {item.discountPrice ? (
              <>
                <ThemedText style={styles.discountPrice}>
                  {item.discountPrice.toLocaleString('vi-VN')}đ
                </ThemedText>
                <ThemedText style={styles.originalPrice}>
                  {item.price.toLocaleString('vi-VN')}đ
                </ThemedText>
              </>
            ) : (
              <ThemedText style={styles.productPrice}>
                {item.price.toLocaleString('vi-VN')}đ
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText style={styles.loadingText}>Đang tải danh mục...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Tiêu đề trang */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Danh mục sản phẩm</ThemedText>
      </ThemedView>

      {/* Thanh danh mục */}
      <ThemedView style={styles.categoryTabsContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        />
      </ThemedView>

      {/* Danh sách sản phẩm */}
      {loadingProducts ? (
        <ThemedView style={styles.loadingProductsContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText>Đang tải sản phẩm...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Không có sản phẩm nào trong danh mục này</ThemedText>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  loadingProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryTabsContainer: {
    marginBottom: 16,
  },
  categoryTabs: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryTab: {
    backgroundColor: '#FF4500',
  },
  categoryTabText: {
    fontSize: 14,
  },
  selectedCategoryTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productsList: {
    paddingHorizontal: 8,
  },
  productItem: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
  },
});

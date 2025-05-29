import { Image, StyleSheet, Platform, ScrollView, FlatList, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAllProducts } from '@/services/productService';
import API from '@/services/api';

// Lấy baseURL từ cấu hình API (bỏ phần /api)
const API_BASE_URL = API.defaults.baseURL?.replace('/api', '') || 'http://10.0.2.2:5000';

// Định nghĩa kiểu dữ liệu
type Category = {
  id: string;
  name: string;
  image: any;
};

type Product = {
  id: string;
  name: string;
  price: string;
  discountPrice?: string;
  image: any;
};

// Dữ liệu mẫu cho các danh mục sản phẩm
const categories: Category[] = [
  { id: '1', name: 'Áo', image: require('@/assets/images/áo/tee-den-hades.webp') },
  { id: '2', name: 'Quần', image: require('@/assets/images/quần/quan-jean-nam.webp') },
  { id: '3', name: 'Váy', image: require('@/assets/images/váy/vay-hoa.webp') },
  { id: '4', name: 'Phụ kiện', image: require('@/assets/images/phụ kiện/mu-mlb.webp') },
];

// Dữ liệu mẫu cho sản phẩm nổi bật
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Áo sơ mi nam họa tiết',
    price: '299.000đ',
    image: require('@/assets/images/áo/cuban-shirt.webp')
  },
  {
    id: '2',
    name: 'Áo khoác denim unisex',
    price: '399.000đ',
    image: require('@/assets/images/áo/ao-khoac-jean.webp')
  },
  {
    id: '3',
    name: 'Áo polo nam',
    price: '249.000đ',
    image: require('@/assets/images/áo/polo-dirtycoins.webp')
  },
  {
    id: '4',
    name: 'Áo thun Bad Habbits',
    price: '259.000đ',
    image: require('@/assets/images/áo/ao-badhabits.jpg')
  },
];

// Dữ liệu mẫu cho sản phẩm khuyến mãi
const discountedProducts: Product[] = [
  {
    id: '5',
    name: 'Áo khoác jean unisex',
    price: '499.000đ',
    discountPrice: '349.000đ',
    image: require('@/assets/images/áo/ao-khoac-jean1.webp')
  },
  {
    id: '6',
    name: 'Áo thun Hades',
    price: '350.000đ',
    discountPrice: '245.000đ',
    image: require('@/assets/images/áo/tee-den-hades.webp')
  },
  {
    id: '7',
    name: 'Quần jean nam',
    price: '450.000đ',
    discountPrice: '315.000đ',
    image: require('@/assets/images/quần/quan-jean-nam.webp')
  },
  {
    id: '8',
    name: 'Mũ MLB',
    price: '290.000đ',
    discountPrice: '203.000đ',
    image: require('@/assets/images/phụ kiện/mu-mlb.webp')
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  // Lấy sản phẩm từ API khi component được mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products');
        if (response.data && response.data.length > 0) {
          setRealProducts(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/categories?category=${encodeURIComponent(item.name)}`)}
    >
      <View style={styles.categoryImageContainer}>
        <Image source={item.image} style={styles.categoryImage} />
      </View>
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    // Hình ảnh từ API nếu có, nếu không thì dùng hình ảnh mặc định
    let imageSource = item.image;
    let realProductForDisplay = null;

    // Nếu có dữ liệu thực từ API và sản phẩm có hình ảnh
    if (realProducts.length > 0) {
      const index = featuredProducts.findIndex(p => p.id === item.id);
      if (index >= 0 && index < realProducts.length) {
        realProductForDisplay = realProducts[index];

        if (realProductForDisplay.images && realProductForDisplay.images.length > 0) {
          // Lấy danh mục của sản phẩm thực
          const categoryName = realProductForDisplay.category?.name?.toLowerCase() || '';
          if (categoryName) {
            // Sử dụng hình ảnh từ API
            imageSource = { uri: `${API_BASE_URL}/images/${categoryName}/${realProductForDisplay.images[0]}` };
          }
        }
      }
    }

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          // Nếu có sản phẩm thực từ API, ưu tiên sử dụng ID từ API
          if (realProductForDisplay) {
            router.push(`/product/${realProductForDisplay._id}`);
          } else {
            // Nếu không có sản phẩm từ API hoặc không tìm thấy sản phẩm tương ứng, hiển thị thông báo
            Alert.alert(
              'Thông báo',
              'Chức năng này đang được phát triển. Vui lòng thử lại sau.',
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <Image source={imageSource} style={styles.productImage} />
        <ThemedView style={styles.productInfo}>
          <ThemedText style={styles.productName}>
            {realProductForDisplay ? realProductForDisplay.name : item.name}
          </ThemedText>
          <ThemedText style={styles.productPrice}>
            {realProductForDisplay ?
              `${realProductForDisplay.price.toLocaleString()}đ` :
              item.price}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  const renderDiscountedProductItem = ({ item }: { item: Product }) => {
    // Tính phần trăm giảm giá
    const originalPrice = parseInt(item.price.replace(/\D/g, ''));
    const discountedPrice = parseInt((item.discountPrice || '0').replace(/\D/g, ''));
    const discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

    // Hình ảnh từ API nếu có, nếu không thì dùng hình ảnh mặc định
    let imageSource = item.image;
    let realProductForPromo = null;

    // Nếu có dữ liệu thực từ API
    if (realProducts.length > 0) {
      const index = discountedProducts.findIndex(p => p.id === item.id);
      // Sử dụng sản phẩm từ vị trí 4 trở đi để tránh trùng với sản phẩm nổi bật (0-3)
      const realProductIndex = index + 4;

      if (realProductIndex < realProducts.length) {
        realProductForPromo = realProducts[realProductIndex];

        if (realProductForPromo.images && realProductForPromo.images.length > 0) {
          // Lấy danh mục của sản phẩm khuyến mãi thực
          const categoryName = realProductForPromo.category?.name?.toLowerCase() || '';
          if (categoryName) {
            // Sử dụng hình ảnh từ API
            imageSource = { uri: `${API_BASE_URL}/images/${categoryName}/${realProductForPromo.images[0]}` };
          }
        }
      }
    }

    return (
      <TouchableOpacity
        style={styles.discountedProductItem}
        onPress={() => {
          if (realProductForPromo) {
            router.push(`/product/${realProductForPromo._id}`);
          } else {
            Alert.alert(
              'Thông báo',
              'Chức năng này đang được phát triển. Vui lòng thử lại sau.',
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <View style={styles.discountedProductImageContainer}>
          <Image source={imageSource} style={styles.discountedProductImage} />
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountBadgeText}>-{discountPercent}%</ThemedText>
            </View>
          )}
        </View>
        <ThemedView style={styles.discountedProductInfo}>
          <ThemedText style={styles.discountedProductName} numberOfLines={1}>
            {realProductForPromo ? realProductForPromo.name : item.name}
          </ThemedText>
          <View style={styles.discountedPriceContainer}>
            <ThemedText style={styles.discountedPrice}>
              {realProductForPromo && realProductForPromo.discountPrice ?
                `${realProductForPromo.discountPrice.toLocaleString()}đ` :
                item.discountPrice}
            </ThemedText>
            <ThemedText style={styles.originalPrice}>
              {realProductForPromo ?
                `${realProductForPromo.price.toLocaleString()}đ` :
                item.price}
            </ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <ThemedView style={styles.banner}>
        <Image
          source={require('@/assets/images/áo/ao-khoac-flanel3.jpg')}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay} />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.bannerGradient}
        />
        <ThemedView style={styles.bannerContent}>
          <ThemedText type="title" style={styles.bannerTitle}>THỜI TRANG MỚI</ThemedText>
          <ThemedText style={styles.bannerSubtitle}>Khám phá bộ sưu tập mới nhất</ThemedText>
          <TouchableOpacity style={styles.bannerButton}>
            <ThemedText style={styles.bannerButtonText}>Mua ngay</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Danh mục sản phẩm */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Danh mục</ThemedText>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </ThemedView>

      {/* Sản phẩm nổi bật */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Sản phẩm nổi bật</ThemedText>
        <FlatList
          data={featuredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </ThemedView>

      {/* Khuyến mãi */}
      <ThemedView style={[styles.section, styles.promoSection]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Khuyến mãi đặc biệt</ThemedText>
        <ThemedView style={styles.promoCard}>
          <ThemedText style={styles.promoTitle}>GIẢM 30%</ThemedText>
          <ThemedText style={styles.promoDesc}>Cho tất cả sản phẩm mới</ThemedText>
          <TouchableOpacity style={styles.promoButton}>
            <ThemedText style={styles.promoButtonText}>Xem ngay</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Danh sách sản phẩm khuyến mãi */}
        <FlatList
          data={discountedProducts}
          renderItem={renderDiscountedProductItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.discountedProductsList}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    height: 220,
    position: 'relative',
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoriesList: {
    paddingVertical: 10,
  },
  categoryItem: {
    marginRight: 16,
    alignItems: 'center',
    width: 80,
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryImage: {
    width: 40,
    height: 40,
  },
  categoryName: {
    fontSize: 14,
    textAlign: 'center',
  },
  productsList: {
    paddingVertical: 10,
  },
  productItem: {
    width: 150,
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    paddingHorizontal: 5,
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
  promoSection: {
    marginBottom: 30,
  },
  promoCard: {
    backgroundColor: '#FFE4E1',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4500',
    marginBottom: 8,
  },
  promoDesc: {
    fontSize: 16,
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  promoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  discountedProductsList: {
    paddingVertical: 15,
  },
  discountedProductItem: {
    width: 150,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  discountedProductImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  discountedProductImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountedProductInfo: {
    padding: 10,
  },
  discountedProductName: {
    fontSize: 14,
    marginBottom: 4,
  },
  discountedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  Animated,
  Dimensions,
  ScrollView,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  getCartFromStorage,
  updateCartItemQuantity,
  removeFromCart,
  calculateCartTotal,
  calculateShippingFee,
  calculateOrderTotal,
  clearCart
} from '@/services/cartService';
import { addToWishlist, isInWishlist } from '@/services/wishlistService';
import { useAuth } from '@/app/_layout';
import { useCart } from '@/contexts/CartContext';
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
  category?: string;
  description?: string;
  stockCount?: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  size: string | null;
  color: string | null;
  addedAt: string;
};

// Hình ảnh mặc định khi không có ảnh từ API
const defaultImage = require('@/assets/images/partial-react-logo.png');

// Lấy kích thước màn hình
const { width } = Dimensions.get('window');

const baseURL = API.defaults.baseURL?.replace('/api', '');

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    loading,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadCart
  } = useCart();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number): Promise<void> => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    await updateCartItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string): void => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeFromCart(itemId)
        }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xóa giỏ hàng',
      'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: () => clearCart()
        }
      ]
    );
  };

  const getImageUrl = (item: any): string | null => {
    if (item.image && item.category) {
      const categoryName = typeof item.category === 'object' ? item.category.name : item.category;
      return `${baseURL}/images/${categoryName.toLowerCase()}/${item.image}`;
    }
    return null;
  };

  const renderCartItem = (item: any) => {
    const imageUrl = getImageUrl(item);

    return (
      <View key={item.itemId} style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <ThemedText style={styles.itemName} numberOfLines={2}>
            {item.name}
          </ThemedText>

          <View style={styles.itemOptions}>
            {item.selectedSize && (
              <Text style={styles.optionText}>Size: {item.selectedSize}</Text>
            )}
            {item.selectedColor && (
              <Text style={styles.optionText}>Màu: {item.selectedColor}</Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            <ThemedText style={styles.itemPrice}>
              {formatPrice(item.price)}
            </ThemedText>
            {item.discountPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </View>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.itemId, item.quantity, -1)}
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.itemId, item.quantity, 1)}
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.itemId)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && cartItems.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Đang tải giỏ hàng...</ThemedText>
      </ThemedView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Giỏ hàng</ThemedText>
        </ThemedView>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <ThemedText style={styles.emptyTitle}>Giỏ hàng trống</ThemedText>
          <Text style={styles.emptySubtitle}>
            Hãy thêm sản phẩm yêu thích vào giỏ hàng
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/categories')}
          >
            <ThemedText style={styles.shopButtonText}>Mua sắm ngay</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Giỏ hàng ({cartTotal.totalItems})</ThemedText>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearButton}>Xóa tất cả</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Cart Items */}
      <ScrollView
        style={styles.cartList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cartItems.map(renderCartItem)}
      </ScrollView>

      {/* Cart Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>{formatPrice(cartTotal.subtotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={[styles.summaryValue, cartTotal.shippingFee === 0 && styles.freeShipping]}>
            {cartTotal.shippingFee === 0 ? 'Miễn phí' : formatPrice(cartTotal.shippingFee)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Thuế VAT (10%):</Text>
          <Text style={styles.summaryValue}>{formatPrice(cartTotal.tax)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatPrice(cartTotal.total)}</Text>
        </View>

        {cartTotal.shippingFee > 0 && (
          <Text style={styles.shippingNote}>
            Mua thêm {formatPrice(500000 - cartTotal.subtotal)} để được miễn phí ship
          </Text>
        )}
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => router.push('/checkout')}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.checkoutButtonText}>
            Thanh toán {formatPrice(cartTotal.total)}
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clearButton: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '500',
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImageContainer: {
    marginRight: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  itemOptions: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 10,
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  freeShipping: {
    color: '#00c851',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  shippingNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

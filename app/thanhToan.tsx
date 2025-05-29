import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getCartFromStorage, calculateCartTotal, calculateShippingFee, calculateOrderTotal } from '@/src/services/cartService';
import { getCurrentUser, addAddress } from '@/src/services/userService';
import { createOrder } from '@/src/services/orderService';

// Định nghĩa kiểu dữ liệu
type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
};

type CartItem = {
  product: Product;
  quantity: number;
  size: string | null;
  color: string | null;
};

type Address = {
  _id: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
};

type User = {
  _id: string;
  name: string;
  email: string;
  addresses: Address[];
};

type PaymentMethod = 'cod' | 'bank_transfer' | 'e_wallet';

export default function CheckoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);

  // Lấy giỏ hàng và thông tin người dùng khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy giỏ hàng
        const items = await getCartFromStorage();
        if (items.length === 0) {
          Alert.alert('Thông báo', 'Giỏ hàng trống', [
            { text: 'OK', onPress: () => router.back() }
          ]);
          return;
        }
        setCartItems(items);

        // Lấy thông tin người dùng
        const userData = await getCurrentUser();
        if (!userData) {
          Alert.alert('Thông báo', 'Vui lòng đăng nhập để thanh toán', [
            { text: 'OK', onPress: () => router.push('/login') }
          ]);
          return;
        }
        setUser(userData);

        // Chọn địa chỉ mặc định nếu có
        if (userData.addresses && userData.addresses.length > 0) {
          const defaultAddress = userData.addresses.find((addr: Address) => addr.isDefault);
          setSelectedAddress(defaultAddress || userData.addresses[0]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thanh toán:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin thanh toán. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính tổng tiền
  const subtotal = calculateCartTotal(cartItems);
  const shippingFee = calculateShippingFee(subtotal);
  const total = calculateOrderTotal(cartItems);

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }

    try {
      setProcessingOrder(true);

      // Tạo đơn hàng
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress: selectedAddress._id,
        paymentMethod,
        subtotal,
        shippingFee,
        total
      };

      const order = await createOrder(orderData);

      Alert.alert(
        'Thành công',
        'Đặt hàng thành công! Cảm ơn bạn đã mua sắm.',
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => router.push(`/orders/${order._id}`)
          },
          {
            text: 'Tiếp tục mua sắm',
            onPress: () => router.push('/')
          }
        ]
      );
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      Alert.alert('Lỗi', 'Không thể hoàn tất đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Chọn phương thức thanh toán
  const renderPaymentMethod = (method: PaymentMethod, title: string, description: string) => (
    <TouchableOpacity
      style={[
        styles.paymentMethodItem,
        paymentMethod === method && styles.selectedPaymentMethod
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      <View style={styles.radioButton}>
        {paymentMethod === method && <View style={styles.radioButtonSelected} />}
      </View>
      <View style={styles.paymentMethodContent}>
        <ThemedText style={styles.paymentMethodTitle}>{title}</ThemedText>
        <ThemedText style={styles.paymentMethodDescription}>{description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText style={styles.loadingText}>Đang tải thông tin thanh toán...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header với nút quay lại */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
        <View style={styles.headerRight} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Địa chỉ giao hàng */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Địa chỉ giao hàng</ThemedText>

          {selectedAddress ? (
            <ThemedView style={styles.addressCard}>
              <ThemedText style={styles.addressName}>{selectedAddress.fullName}</ThemedText>
              <ThemedText style={styles.addressPhone}>{selectedAddress.phoneNumber}</ThemedText>
              <ThemedText style={styles.addressDetail}>
                {selectedAddress.streetAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
              </ThemedText>

              <TouchableOpacity
                style={styles.changeAddressButton}
                onPress={() => router.push('/address')}
              >
                <ThemedText style={styles.changeAddressText}>Thay đổi</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => router.push('/address/new')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#3498db" />
              <ThemedText style={styles.addAddressText}>Thêm địa chỉ mới</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Tóm tắt đơn hàng */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tóm tắt đơn hàng</ThemedText>

          <ThemedView style={styles.orderSummary}>
            <ThemedView style={styles.summaryRow}>
              <ThemedText>Tạm tính ({cartItems.length} sản phẩm)</ThemedText>
              <ThemedText>{subtotal.toLocaleString()}đ</ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedText>Phí vận chuyển</ThemedText>
              <ThemedText>{shippingFee.toLocaleString()}đ</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText style={styles.totalText}>Tổng cộng</ThemedText>
              <ThemedText style={styles.totalPrice}>{total.toLocaleString()}đ</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Phương thức thanh toán */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>

          <ThemedView style={styles.paymentMethods}>
            {renderPaymentMethod(
              'cod',
              'Thanh toán khi nhận hàng (COD)',
              'Thanh toán bằng tiền mặt khi nhận hàng'
            )}

            {renderPaymentMethod(
              'bank_transfer',
              'Chuyển khoản ngân hàng',
              'Chuyển khoản trước khi giao hàng'
            )}

            {renderPaymentMethod(
              'e_wallet',
              'Ví điện tử',
              'Thanh toán qua MoMo, ZaloPay, VNPay...'
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Nút đặt hàng */}
      <ThemedView style={styles.bottomContainer}>
        <ThemedView style={styles.totalContainer}>
          <ThemedText style={styles.totalLabel}>Tổng thanh toán</ThemedText>
          <ThemedText style={styles.checkoutTotal}>{total.toLocaleString()}đ</ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!selectedAddress || processingOrder) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={!selectedAddress || processingOrder}
        >
          {processingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.placeOrderText}>Đặt hàng</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addressCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressPhone: {
    marginTop: 5,
  },
  addressDetail: {
    marginTop: 5,
    lineHeight: 20,
  },
  changeAddressButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  changeAddressText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addAddressText: {
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 5,
  },
  totalText: {
    fontWeight: 'bold',
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  paymentMethods: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    backgroundColor: '#f8f9fa',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontWeight: 'bold',
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  bottomContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  placeOrderButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

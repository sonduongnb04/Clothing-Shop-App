import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/src/contexts/CartContext';
import { useAuth } from '@/app/_layout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getUserAddresses } from '@/src/services/userService';
import { createOrder } from '@/src/services/orderService';

// Type definitions
interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  note: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
}

// Payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    icon: 'cash-outline',
    description: 'Thanh toán tiền mặt khi nhận hàng'
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: 'wallet-outline',
    description: 'Thanh toán qua ví điện tử MoMo'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: 'card-outline',
    description: 'Thanh toán qua ví điện tử ZaloPay'
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: 'business-outline',
    description: 'Chuyển khoản qua ngân hàng nội địa'
  },
  {
    id: 'atm_card',
    name: 'Thẻ ATM/Debit',
    icon: 'card-outline',
    description: 'Thanh toán qua thẻ ATM hoặc thẻ ghi nợ'
  }
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // Shipping information
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    ward: '',
    district: '',
    city: '',
    note: ''
  });

  // Payment
  const [selectedPayment, setSelectedPayment] = useState<string>('cod');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Form validation
  const [errors, setErrors] = useState<FormErrors>({});

  // Address management
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      Alert.alert(
        'Giỏ hàng trống',
        'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/cart') }]
      );
    }

    // Load saved addresses if user is logged in
    if (user) {
      loadSavedAddresses();
    }
  }, [cartItems, router, user]);

  const loadSavedAddresses = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoadingAddresses(true);
      const addresses: Address[] = await getUserAddresses(user._id);
      setSavedAddresses(addresses);

      // Auto-select default address if exists
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress && !selectedAddress) {
        selectSavedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ đã lưu:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectSavedAddress = (address: Address): void => {
    setSelectedAddress(address);
    setShippingInfo(prev => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phoneNumber,
      address: address.streetAddress,
      ward: address.ward,
      district: address.district,
      city: address.province
    }));
    setShowAddressModal(false);
    // Clear any existing errors
    setErrors({});
  };

  const clearSelectedAddress = (): void => {
    setSelectedAddress(null);
    setShippingInfo(prev => ({
      ...prev,
      fullName: user?.name || '',
      phone: user?.phone || '',
      address: '',
      ward: '',
      district: '',
      city: ''
    }));
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!shippingInfo.ward.trim()) {
      newErrors.ward = 'Vui lòng nhập phường/xã';
    }

    if (!shippingInfo.district.trim()) {
      newErrors.district = 'Vui lòng nhập quận/huyện';
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = 'Vui lòng nhập tỉnh/thành phố';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string): void => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const processPayment = async (paymentMethod: string, orderData: any): Promise<{ success: boolean; message: string }> => {
    switch (paymentMethod) {
      case 'cod':
        // COD doesn't need payment processing
        return { success: true, message: 'Đặt hàng thành công!' };

      case 'momo':
        // Simulate MoMo payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Thanh toán MoMo thành công!' };

      case 'zalopay':
        // Simulate ZaloPay payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Thanh toán ZaloPay thành công!' };

      case 'bank_transfer':
        // Simulate bank transfer
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Đã tạo lệnh chuyển khoản thành công!' };

      case 'atm_card':
        // Simulate ATM card payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Thanh toán thẻ ATM thành công!' };

      default:
        return { success: false, message: 'Phương thức thanh toán không hợp lệ' };
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Thông tin không hợp lệ', 'Vui lòng kiểm tra lại thông tin đã nhập.');
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems,
        shippingInfo,
        paymentMethod: selectedPayment,
        subtotal: cartTotal.subtotal,
        shippingFee: cartTotal.shippingFee,
        tax: cartTotal.tax,
        total: cartTotal.total,
        orderDate: new Date().toISOString(),
        userId: user?._id || null
      };

      console.log('Chuẩn bị tạo đơn hàng với dữ liệu:', {
        itemCount: cartItems.length,
        total: cartTotal.total,
        userId: user?._id,
        shippingInfo: shippingInfo
      });

      // Process payment
      const paymentResult = await processPayment(selectedPayment, orderData);

      if (paymentResult.success) {
        // Create and save order
        const savedOrder = await createOrder(orderData);
        console.log('Đơn hàng đã được lưu thành công:', savedOrder.orderNumber);

        // Clear cart after successful order creation
        await clearCart();

        // Show success modal
        setShowSuccess(true);
      } else {
        Alert.alert('Lỗi thanh toán', paymentResult.message);
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/(tabs)');
  };

  const handleViewOrders = () => {
    setShowSuccess(false);
    router.push('/orders');
  };

  if (cartItems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <ThemedText style={styles.emptyTitle}>Giỏ hàng trống</ThemedText>
          <Text style={styles.emptySubtitle}>
            Không có sản phẩm nào để thanh toán
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Đơn hàng ({cartTotal.totalItems} sản phẩm)</ThemedText>
          <View style={styles.orderSummary}>
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
              <Text style={styles.summaryLabel}>Thuế VAT:</Text>
              <Text style={styles.summaryValue}>{formatPrice(cartTotal.tax)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{formatPrice(cartTotal.total)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin giao hàng</ThemedText>

          {/* Saved Addresses Section */}
          {user && savedAddresses.length > 0 && (
            <View style={styles.savedAddressSection}>
              {selectedAddress ? (
                <View style={styles.selectedAddressCard}>
                  <View style={styles.selectedAddressHeader}>
                    <View style={styles.selectedAddressInfo}>
                      <Text style={styles.selectedAddressName}>{selectedAddress.fullName}</Text>
                      <Text style={styles.selectedAddressPhone}>{selectedAddress.phoneNumber}</Text>
                      <Text style={styles.selectedAddressText}>
                        {selectedAddress.streetAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                      </Text>
                    </View>
                    {selectedAddress.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.selectedAddressActions}>
                    <TouchableOpacity
                      style={styles.changeAddressButton}
                      onPress={() => setShowAddressModal(true)}
                    >
                      <Text style={styles.changeAddressText}>Thay đổi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.clearAddressButton}
                      onPress={clearSelectedAddress}
                    >
                      <Text style={styles.clearAddressText}>Nhập thủ công</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectAddressButton}
                  onPress={() => setShowAddressModal(true)}
                >
                  <Ionicons name="location-outline" size={20} color="#007AFF" />
                  <Text style={styles.selectAddressText}>Chọn từ địa chỉ đã lưu</Text>
                  <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {!selectedAddress && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  value={shippingInfo.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Số điện thoại *</Text>
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    value={shippingInfo.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    value={shippingInfo.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Nhập email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ cụ thể *</Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  value={shippingInfo.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Số nhà, tên đường"
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Phường/Xã *</Text>
                  <TextInput
                    style={[styles.input, errors.ward && styles.inputError]}
                    value={shippingInfo.ward}
                    onChangeText={(value) => handleInputChange('ward', value)}
                    placeholder="Phường/Xã"
                  />
                  {errors.ward && <Text style={styles.errorText}>{errors.ward}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Quận/Huyện *</Text>
                  <TextInput
                    style={[styles.input, errors.district && styles.inputError]}
                    value={shippingInfo.district}
                    onChangeText={(value) => handleInputChange('district', value)}
                    placeholder="Quận/Huyện"
                  />
                  {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tỉnh/Thành phố *</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  value={shippingInfo.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="Tỉnh/Thành phố"
                />
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={shippingInfo.note}
              onChangeText={(value) => handleInputChange('note', value)}
              placeholder="Ghi chú cho đơn hàng..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>

          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPayment === method.id && styles.paymentMethodSelected
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={selectedPayment === method.id ? '#007AFF' : '#666'}
                />
                <View style={styles.paymentMethodInfo}>
                  <Text style={[
                    styles.paymentMethodName,
                    selectedPayment === method.id && styles.paymentMethodNameSelected
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.paymentMethodDescription}>
                    {method.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPayment === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.placeOrderButtonText}>
              Đặt hàng {formatPrice(cartTotal.total)}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addressModalContent}>
            <View style={styles.addressModalHeader}>
              <Text style={styles.addressModalTitle}>Chọn địa chỉ giao hàng</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loadingAddresses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
              </View>
            ) : (
              <ScrollView style={styles.addressList} showsVerticalScrollIndicator={false}>
                {savedAddresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressItem,
                      selectedAddress?.id === address.id && styles.addressItemSelected
                    ]}
                    onPress={() => selectSavedAddress(address)}
                  >
                    <View style={styles.addressItemContent}>
                      <View style={styles.addressItemHeader}>
                        <Text style={styles.addressItemName}>{address.fullName}</Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Mặc định</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressItemPhone}>{address.phoneNumber}</Text>
                      <Text style={styles.addressItemText}>
                        {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                      </Text>
                    </View>
                    <Ionicons
                      name={selectedAddress?.id === address.id ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={selectedAddress?.id === address.id ? "#007AFF" : "#ccc"}
                    />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addNewAddressButton}
                  onPress={() => {
                    setShowAddressModal(false);
                    router.push('/address/form?mode=add');
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addNewAddressText}>Thêm địa chỉ mới</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#00c851" />
            <ThemedText style={styles.successTitle}>Đặt hàng thành công!</ThemedText>
            <Text style={styles.successMessage}>
              Cảm ơn bạn đã mua sắm. Chúng tôi sẽ xử lý đơn hàng và giao hàng sớm nhất có thể.
            </Text>
            <View style={styles.successButtonContainer}>
              <TouchableOpacity
                style={[styles.successButton, styles.secondaryButton]}
                onPress={handleSuccessClose}
              >
                <ThemedText style={[styles.successButtonText, styles.secondaryButtonText]}>Về trang chủ</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successButton}
                onPress={handleViewOrders}
              >
                <ThemedText style={styles.successButtonText}>Xem đơn hàng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  inputGroup: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  paymentMethod: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  paymentMethodSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  paymentMethodNameSelected: {
    color: '#007AFF',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 350,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  successButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  successButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#333',
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedAddressSection: {
    marginBottom: 15,
  },
  selectedAddressCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
  },
  selectedAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedAddressInfo: {
    flex: 1,
  },
  selectedAddressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectedAddressPhone: {
    fontSize: 14,
    color: '#666',
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#666',
  },
  selectedAddressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeAddressButton: {
    padding: 10,
  },
  changeAddressText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  clearAddressButton: {
    padding: 10,
  },
  clearAddressText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  selectAddressButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectAddressText: {
    fontSize: 14,
    color: '#007AFF',
  },
  addressModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 350,
  },
  addressModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressList: {
    flex: 1,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addressItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  addressItemContent: {
    flex: 1,
  },
  addressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressItemPhone: {
    fontSize: 14,
    color: '#666',
  },
  addressItemText: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 5,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  addNewAddressButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addNewAddressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

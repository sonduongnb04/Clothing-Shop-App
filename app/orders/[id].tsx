import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getOrderById, getOrderStatusText, getPaymentMethodText, cancelOrder } from '@/src/services/orderService';
import API from '@/src/services/api';

// Định nghĩa kiểu dữ liệu
type OrderStatus = 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';

type OrderItem = {
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

// Lấy baseURL từ cấu hình API (bỏ phần /api)
const API_BASE_URL = API.defaults.baseURL?.replace('/api', '') || 'http://10.0.2.2:5000';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // Hình ảnh mặc định khi không có ảnh từ API
  const defaultImage = require('@/assets/images/partial-react-logo.png');

  // Lấy thông tin đơn hàng khi component được mount
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id as string);
      setOrder(data);
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin đơn hàng ${id}:`, error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Lấy màu sắc cho trạng thái đơn hàng
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#f39c12'; // Màu cam
      case 'processing':
        return '#3498db'; // Màu xanh dương
      case 'shipping':
        return '#2ecc71'; // Màu xanh lá
      case 'delivered':
        return '#27ae60'; // Màu xanh lá đậm
      case 'cancelled':
        return '#e74c3c'; // Màu đỏ
      default:
        return '#7f8c8d'; // Màu xám
    }
  };

  // Function để lấy source hình ảnh sản phẩm
  const getProductImageSource = (item: OrderItem) => {
    // Nếu có hình ảnh trong product
    if (item.product.images && item.product.images.length > 0) {
      const imagePath = item.product.images[0];

      // Nếu là URL đầy đủ (bắt đầu bằng http)
      if (imagePath.startsWith('http')) {
        return { uri: imagePath };
      }

      // Nếu là đường dẫn API (bắt đầu bằng /images)
      if (imagePath.startsWith('/images')) {
        return { uri: `${API_BASE_URL}${imagePath}` };
      }

      // Nếu chỉ là tên file, cần thêm category path
      // Giả sử có thông tin category trong product name hoặc image path
      const productName = item.product.name.toLowerCase();
      let categoryPath = 'áo'; // mặc định

      if (productName.includes('quần') || productName.includes('jean')) {
        categoryPath = 'quần';
      } else if (productName.includes('váy')) {
        categoryPath = 'váy';
      } else if (productName.includes('mũ') || productName.includes('túi') || productName.includes('phụ kiện')) {
        categoryPath = 'phụ kiện';
      }

      return { uri: `${API_BASE_URL}/images/${categoryPath}/${imagePath}` };
    }

    // Nếu không có hình ảnh, dùng hình ảnh mặc định
    return defaultImage;
  };

  // Handle image error
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có, hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancelOrder(order._id);

              // Refresh order data để cập nhật trạng thái
              await fetchOrderDetails();

              Alert.alert('Thành công', 'Đã hủy đơn hàng thành công');
            } catch (error) {
              console.error('Lỗi khi hủy đơn hàng:', error);
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText style={styles.loadingText}>Đang tải thông tin đơn hàng...</ThemedText>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
        <ThemedText style={styles.errorText}>Không tìm thấy đơn hàng</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Chi tiết đơn hàng</ThemedText>
        <ThemedView style={styles.headerRight} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thông tin đơn hàng */}
        <ThemedView style={styles.orderInfoCard}>
          <ThemedView style={styles.orderInfoHeader}>
            <ThemedText style={styles.orderNumber}>Đơn hàng #{order.orderNumber}</ThemedText>
            <ThemedText style={styles.orderDate}>{formatDate(order.createdAt)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statusContainer}>
            <ThemedView
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '20' }
              ]}
            >
              <ThemedText
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) }
                ]}
              >
                {getOrderStatusText(order.status)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Danh sách sản phẩm */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sản phẩm</ThemedText>

          {order.items.map((item, index) => (
            <ThemedView key={index} style={styles.productItem}>
              <Image
                source={imageErrors[index] ? defaultImage : getProductImageSource(item)}
                style={styles.productImage}
                resizeMode="cover"
                onError={() => handleImageError(index)}
              />

              <ThemedView style={styles.productInfo}>
                <ThemedText style={styles.productName} numberOfLines={2}>{item.product.name}</ThemedText>
                {(item.size || item.color) && (
                  <ThemedText style={styles.productVariant}>
                    {item.size ? `Size: ${item.size}` : ''}
                    {item.size && item.color ? ' • ' : ''}
                    {item.color ? `Màu: ${item.color}` : ''}
                  </ThemedText>
                )}
                <ThemedView style={styles.productPriceRow}>
                  <ThemedText style={styles.productPrice}>
                    {item.price.toLocaleString()}đ
                  </ThemedText>
                  <ThemedText style={styles.productQuantity}>
                    Số lượng: {item.quantity}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Địa chỉ giao hàng */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Địa chỉ giao hàng</ThemedText>

          <ThemedView style={styles.addressCard}>
            <ThemedText style={styles.addressName}>{order.shippingAddress.fullName}</ThemedText>
            <ThemedText style={styles.addressPhone}>{order.shippingAddress.phoneNumber}</ThemedText>
            <ThemedText style={styles.addressDetail}>
              {order.shippingAddress.streetAddress}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Phương thức thanh toán */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>

          <ThemedView style={styles.paymentCard}>
            <ThemedText style={styles.paymentMethod}>
              {getPaymentMethodText(order.paymentMethod)}
            </ThemedText>
            <ThemedView
              style={[
                styles.paymentStatusBadge,
                {
                  backgroundColor:
                    order.paymentStatus === 'paid' ? '#2ecc7120' :
                      order.paymentStatus === 'failed' ? '#e74c3c20' : '#f39c1220'
                }
              ]}
            >
              <ThemedText
                style={[
                  styles.paymentStatusText,
                  {
                    color:
                      order.paymentStatus === 'paid' ? '#2ecc71' :
                        order.paymentStatus === 'failed' ? '#e74c3c' : '#f39c12'
                  }
                ]}
              >
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                  order.paymentStatus === 'failed' ? 'Thanh toán thất bại' : 'Chờ thanh toán'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Tổng kết đơn hàng */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tổng kết đơn hàng</ThemedText>

          <ThemedView style={styles.summaryCard}>
            <ThemedView style={styles.summaryRow}>
              <ThemedText>Tạm tính</ThemedText>
              <ThemedText>{order.subtotal.toLocaleString()}đ</ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedText>Phí vận chuyển</ThemedText>
              <ThemedText>{order.shippingFee.toLocaleString()}đ</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText style={styles.totalText}>Tổng cộng</ThemedText>
              <ThemedText style={styles.totalPrice}>{order.total.toLocaleString()}đ</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Nút hủy đơn hàng (chỉ hiển thị nếu đơn hàng đang ở trạng thái pending hoặc processing) */}
      {(order.status === 'pending' || order.status === 'processing') && (
        <ThemedView style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.cancelOrderButton}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.cancelOrderText}>Hủy đơn hàng</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
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
  orderInfoCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderDate: {
    color: '#7f8c8d',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  productVariant: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FF4500',
  },
  productQuantity: {
    color: '#666',
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
  },
  addressName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressPhone: {
    marginBottom: 5,
  },
  addressDetail: {
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    fontWeight: 'bold',
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
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
  bottomContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelOrderButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

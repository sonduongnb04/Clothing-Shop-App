import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getUserOrders, getOrderStatusText, getPaymentMethodText } from '@/src/services/orderService';

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

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Lấy danh sách đơn hàng khi component được mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getUserOrders();
        setOrders(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Lọc đơn hàng theo tab đang chọn
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'processing', 'shipping'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'cancelled'].includes(order.status);
    }
    return true;
  });

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

  // Render tab
  const renderTab = (tab: 'all' | 'active' | 'completed', label: string) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === tab && styles.activeTab
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <ThemedText
        style={[
          styles.tabText,
          activeTab === tab && styles.activeTabText
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  // Render đơn hàng
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item._id}`)}
    >
      <ThemedView style={styles.orderHeader}>
        <ThemedText style={styles.orderNumber}>Đơn hàng #{item.orderNumber}</ThemedText>
        <ThemedText style={styles.orderDate}>{formatDate(item.createdAt)}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.orderContent}>
        <ThemedText style={styles.orderItemCount}>
          {item.items.length} sản phẩm • {getPaymentMethodText(item.paymentMethod)}
        </ThemedText>
        <ThemedText style={styles.orderTotal}>
          {item.total.toLocaleString()}đ
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.orderFooter}>
        <ThemedView
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' } // Thêm độ trong suốt
          ]}
        >
          <ThemedText
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}
          >
            {getOrderStatusText(item.status)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.orderActions}>
          <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Đơn hàng của tôi</ThemedText>
        <ThemedView style={styles.headerRight} />
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={styles.tabContainer}>
        {renderTab('all', 'Tất cả')}
        {renderTab('active', 'Đang xử lý')}
        {renderTab('completed', 'Hoàn thành')}
      </ThemedView>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText style={styles.loadingText}>Đang tải đơn hàng...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.ordersList}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <ThemedText style={styles.emptyText}>
                Bạn chưa có đơn hàng nào
              </ThemedText>
              <TouchableOpacity
                style={styles.shopNowButton}
                onPress={() => router.push('/')}
              >
                <ThemedText style={styles.shopNowText}>Mua sắm ngay</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  ordersList: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderNumber: {
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#7f8c8d',
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  orderItemCount: {
    color: '#34495e',
  },
  orderTotal: {
    fontWeight: 'bold',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
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
  orderActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 15,
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  shopNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

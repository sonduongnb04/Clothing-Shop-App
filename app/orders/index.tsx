import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/_layout';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getUserOrders, getOrderStatusText, getPaymentMethodText, clearAllOrdersFromStorage, debugAsyncStorage } from '@/services/orderService';

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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lấy danh sách đơn hàng khi component được mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc đơn hàng khi tab hoặc search query thay đổi
  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchQuery]);

  // Refresh orders when screen comes into focus (e.g., after cancelling an order)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchOrders();
      }
    }, [user])
  );

  const fetchOrders = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để xem đơn hàng');
      return;
    }

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // DEBUG: Xem tất cả dữ liệu AsyncStorage
  const handleDebugStorage = async () => {
    console.log('=== DEBUG ASYNC STORAGE ===');
    await debugAsyncStorage();
  };

  // DEBUG: Xóa tất cả đơn hàng
  const handleClearAllOrders = () => {
    Alert.alert(
      'Xóa tất cả đơn hàng',
      'Bạn có chắc chắn muốn xóa tất cả đơn hàng? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Debug Storage', onPress: handleDebugStorage },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await clearAllOrdersFromStorage();
              if (success) {
                setOrders([]);
                setFilteredOrders([]);
                Alert.alert('Thành công', 'Đã xóa tất cả đơn hàng từ storage');
              } else {
                Alert.alert('Thông báo', 'Không tìm thấy đơn hàng nào để xóa');
              }
            } catch (error) {
              console.error('Lỗi:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filterOrders = () => {
    let filtered = orders;

    // Lọc theo tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Lọc theo search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
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

  // Lấy icon cho trạng thái đơn hàng
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'build-outline';
      case 'shipping':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  // Render tab
  const renderTab = (tab: typeof activeTab, label: string, count?: number) => (
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
        {count !== undefined && count > 0 && (
          <ThemedText style={[styles.tabCount, activeTab === tab && styles.activeTabCount]}>
            {' '}({count})
          </ThemedText>
        )}
      </ThemedText>
    </TouchableOpacity>
  );

  // Đếm số đơn hàng theo trạng thái
  const getOrderCountByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
  };

  // Render đơn hàng
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item._id}`)}
    >
      <ThemedView style={styles.orderHeader}>
        <ThemedView style={styles.orderHeaderLeft}>
          <ThemedText style={styles.orderNumber}>#{item.orderNumber}</ThemedText>
          <ThemedText style={styles.orderDate}>{formatDate(item.createdAt)}</ThemedText>
        </ThemedView>
        <ThemedView
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
            style={styles.statusIcon}
          />
          <ThemedText
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}
          >
            {getOrderStatusText(item.status)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.orderContent}>
        <ThemedView style={styles.orderItemsInfo}>
          <ThemedText style={styles.orderItemCount}>
            {item.items.length} sản phẩm
          </ThemedText>
          <ThemedText style={styles.paymentMethod}>
            {getPaymentMethodText(item.paymentMethod)}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.orderTotal}>
          {item.total.toLocaleString()}đ
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.orderFooter}>
        <ThemedView style={styles.orderItemPreview}>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <ThemedText key={index} style={styles.itemName} numberOfLines={1}>
              {orderItem.product.name}
              {index < Math.min(item.items.length, 2) - 1 && ', '}
            </ThemedText>
          ))}
          {item.items.length > 2 && (
            <ThemedText style={styles.moreItems}>
              và {item.items.length - 2} sản phẩm khác
            </ThemedText>
          )}
        </ThemedView>
        <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
      </ThemedView>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        {searchQuery
          ? 'Thử tìm kiếm với từ khóa khác'
          : 'Hãy mua sắm và tạo đơn hàng đầu tiên của bạn'
        }
      </ThemedText>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)/')}
        >
          <ThemedText style={styles.shopButtonText}>Mua sắm ngay</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Đơn hàng của tôi</ThemedText>
          <ThemedView style={styles.headerRight} />
        </ThemedView>

        <ThemedView style={styles.loginPromptContainer}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <ThemedText style={styles.loginPromptTitle}>Vui lòng đăng nhập</ThemedText>
          <ThemedText style={styles.loginPromptText}>
            Đăng nhập để xem đơn hàng của bạn
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
        <ThemedText style={styles.headerTitle}>Đơn hàng của tôi</ThemedText>
        <ThemedView style={styles.headerRight}>
          <TouchableOpacity onPress={handleClearAllOrders} style={styles.clearAllButton}>
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đơn hàng..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={styles.tabContainer}>
        {renderTab('all', 'Tất cả', orders.length)}
        {renderTab('pending', 'Chờ xử lý', getOrderCountByStatus('pending'))}
        {renderTab('processing', 'Đang chuẩn bị', getOrderCountByStatus('processing'))}
        {renderTab('shipping', 'Đang giao', getOrderCountByStatus('shipping'))}
        {renderTab('delivered', 'Đã giao', getOrderCountByStatus('delivered'))}
      </ThemedView>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <ThemedText style={styles.loadingText}>Đang tải đơn hàng...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.ordersList,
            filteredOrders.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF4500']}
              tintColor="#FF4500"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF4500',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FF4500',
    fontWeight: '600',
  },
  tabCount: {
    fontSize: 12,
    color: '#999',
  },
  activeTabCount: {
    color: '#FF4500',
  },
  ordersList: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemsInfo: {
    flex: 1,
  },
  orderItemCount: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  orderItemPreview: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllButton: {
    padding: 8,
  },
});

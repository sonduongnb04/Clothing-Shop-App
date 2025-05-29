import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/_layout';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  getUserAddresses,
  deleteAddress,
  setDefaultAddress
} from '@/services/userService';

// Định nghĩa kiểu dữ liệu
type Address = {
  id: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
};

export default function AddressManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    addressId: string | null;
    addressName: string;
  }>({
    visible: false,
    addressId: null,
    addressName: ''
  });

  // Lấy danh sách địa chỉ khi component được mount
  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserAddresses(user._id);
      setAddresses(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, [user]);

  // Xử lý đặt địa chỉ mặc định
  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      await setDefaultAddress(user._id, addressId);
      await loadAddresses();
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      let errorMessage = 'Không thể đặt làm địa chỉ mặc định';

      if (error instanceof Error) {
        if (error.message === 'Không tìm thấy danh sách địa chỉ') {
          errorMessage = 'Không tìm thấy danh sách địa chỉ. Vui lòng thêm địa chỉ mới.';
        } else if (error.message === 'Địa chỉ không tồn tại') {
          errorMessage = 'Địa chỉ không tồn tại. Vui lòng làm mới trang.';
        } else if (error.message.includes('thử lại')) {
          errorMessage = 'Không có kết nối mạng. Địa chỉ đã được đặt mặc định tạm thời.';
          // Reload để hiển thị thay đổi
          await loadAddresses();
          Alert.alert('Đã lưu offline', errorMessage);
          return;
        }
      }

      Alert.alert('Lỗi', errorMessage);
    }
  };

  // Hiển thị modal xác nhận xóa
  const showDeleteConfirmation = (address: Address) => {
    setConfirmModal({
      visible: true,
      addressId: address.id,
      addressName: address.fullName
    });
  };

  // Xử lý xóa địa chỉ
  const handleDeleteAddress = async () => {
    const { addressId } = confirmModal;
    if (!user || !addressId) return;

    try {
      setDeletingId(addressId);
      setConfirmModal({ visible: false, addressId: null, addressName: '' });

      await deleteAddress(user._id, addressId);
      await loadAddresses();
      Alert.alert('Thành công', 'Đã xóa địa chỉ');
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể xóa địa chỉ');
    } finally {
      setDeletingId(null);
    }
  };

  // Xử lý chỉnh sửa địa chỉ
  const handleEditAddress = (address: Address) => {
    router.push({
      pathname: '/address/form',
      params: {
        mode: 'edit',
        addressId: address.id,
        addressData: JSON.stringify(address)
      }
    });
  };

  // Render item địa chỉ
  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity style={styles.addressCard}>
      <ThemedView style={styles.addressHeader}>
        <ThemedView style={styles.addressHeaderLeft}>
          <ThemedText style={styles.fullName}>{item.fullName}</ThemedText>
          <ThemedText style={styles.phoneNumber}>{item.phoneNumber}</ThemedText>
        </ThemedView>

        {item.isDefault && (
          <ThemedView style={styles.defaultBadge}>
            <ThemedText style={styles.defaultText}>Mặc định</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.addressContent}>
        <Ionicons name="location-outline" size={16} color="#666" style={styles.locationIcon} />
        <ThemedText style={styles.addressText} numberOfLines={2}>
          {item.streetAddress}, {item.ward}, {item.district}, {item.province}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#28a745" />
            <ThemedText style={[styles.actionText, { color: '#28a745' }]}>
              Đặt mặc định
            </ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAddress(item)}
        >
          <Ionicons name="create-outline" size={18} color="#007bff" />
          <ThemedText style={[styles.actionText, { color: '#007bff' }]}>
            Chỉnh sửa
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showDeleteConfirmation(item)}
          disabled={deletingId === item.id}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color="#dc3545" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#dc3545" />
              <ThemedText style={[styles.actionText, { color: '#dc3545' }]}>
                Xóa
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={80} color="#ccc" />
      <ThemedText style={styles.emptyTitle}>Chưa có địa chỉ nào</ThemedText>
      <ThemedText style={styles.emptyText}>
        Thêm địa chỉ giao hàng để dễ dàng đặt hàng
      </ThemedText>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/address/form?mode=add')}
      >
        <ThemedText style={styles.addButtonText}>Thêm địa chỉ đầu tiên</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Địa chỉ giao hàng</ThemedText>
          <ThemedView style={styles.headerRight} />
        </ThemedView>

        <ThemedView style={styles.loginPromptContainer}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <ThemedText style={styles.loginPromptTitle}>Vui lòng đăng nhập</ThemedText>
          <ThemedText style={styles.loginPromptText}>
            Đăng nhập để quản lý địa chỉ giao hàng
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Địa chỉ giao hàng</ThemedText>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => router.push('/address/form?mode=add')}
        >
          <Ionicons name="add" size={24} color="#FF4500" />
        </TouchableOpacity>
      </ThemedView>

      {/* Modal xác nhận xóa */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModal.visible}
        onRequestClose={() => setConfirmModal({ visible: false, addressId: null, addressName: '' })}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Xác nhận xóa</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa địa chỉ của {confirmModal.addressName}?
            </ThemedText>
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmModal({ visible: false, addressId: null, addressName: '' })}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeleteAddress}
              >
                <ThemedText style={styles.confirmButtonText}>Xóa</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>

      {/* Danh sách địa chỉ */}
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <ThemedText style={styles.loadingText}>Đang tải địa chỉ...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.addressesList,
            addresses.length === 0 && styles.emptyListContainer
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

      {/* Floating Add Button */}
      {addresses.length > 0 && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => router.push('/address/form?mode=add')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
  backButton: {
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
  addIconButton: {
    padding: 4,
  },
  addressesList: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressHeaderLeft: {
    flex: 1,
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  addButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

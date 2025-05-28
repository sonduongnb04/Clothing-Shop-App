import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getUserAddresses, deleteAddress, setDefaultAddress } from '@/src/services/userService';
import { useAuth } from '@/app/_layout';

// Định nghĩa kiểu dữ liệu cho địa chỉ
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

export default function AddressScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { fromCheckout } = useLocalSearchParams();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy danh sách địa chỉ khi component được mount
  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Hàm lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để xem địa chỉ');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const data = await getUserAddresses(user.id);
      setAddresses(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách địa chỉ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa địa chỉ
  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(user.id, addressId);
              // Cập nhật lại danh sách địa chỉ
              setAddresses(prevAddresses => 
                prevAddresses.filter(address => address.id !== addressId)
              );
              Alert.alert('Thành công', 'Đã xóa địa chỉ');
            } catch (error) {
              console.error('Lỗi khi xóa địa chỉ:', error);
              Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };

  // Xử lý đặt địa chỉ mặc định
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress(user.id, addressId);
      // Cập nhật lại danh sách địa chỉ
      setAddresses(prevAddresses => 
        prevAddresses.map(address => ({
          ...address,
          isDefault: address.id === addressId
        }))
      );
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      Alert.alert('Lỗi', 'Không thể đặt địa chỉ mặc định. Vui lòng thử lại sau.');
    }
  };

  // Xử lý chọn địa chỉ (khi đến từ trang thanh toán)
  const handleSelectAddress = (address: Address) => {
    if (fromCheckout === 'true') {
      router.push({
        pathname: '/checkout',
        params: { selectedAddressId: address.id }
      });
    }
  };

  // Render từng địa chỉ
  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity 
      style={[styles.addressItem, item.isDefault && styles.defaultAddressItem]}
      onPress={() => handleSelectAddress(item)}
    >
      <ThemedView style={styles.addressHeader}>
        <ThemedView style={styles.namePhoneContainer}>
          <ThemedText style={styles.fullName}>{item.fullName}</ThemedText>
          <ThemedText style={styles.phoneNumber}>{item.phoneNumber}</ThemedText>
        </ThemedView>
        
        {item.isDefault && (
          <ThemedView style={styles.defaultBadge}>
            <ThemedText style={styles.defaultBadgeText}>Mặc định</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      <ThemedText style={styles.addressText}>
        {item.streetAddress}, {item.ward}, {item.district}, {item.province}
      </ThemedText>
      
      <ThemedView style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/address/edit/${item.id}`)}
        >
          <Ionicons name="create-outline" size={18} color="#666" />
          <ThemedText style={styles.actionText}>Sửa</ThemedText>
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefaultAddress(item.id)}
          >
            <Ionicons name="star-outline" size={18} color="#666" />
            <ThemedText style={styles.actionText}>Đặt mặc định</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#666" />
          <ThemedText style={styles.actionText}>Xóa</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Địa chỉ của tôi</ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <ThemedText style={styles.loadingText}>Đang tải địa chỉ...</ThemedText>
        </ThemedView>
      ) : (
        <>
          {addresses.length > 0 ? (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.addressList}
            />
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={80} color="#ccc" />
              <ThemedText style={styles.emptyText}>Bạn chưa có địa chỉ nào</ThemedText>
            </ThemedView>
          )}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/address/new')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <ThemedText style={styles.addButtonText}>Thêm địa chỉ mới</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  addressList: {
    padding: 16,
  },
  addressItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultAddressItem: {
    borderColor: '#FF4500',
    borderWidth: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  namePhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF4500',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

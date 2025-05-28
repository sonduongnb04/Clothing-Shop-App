import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/app/_layout';

type MenuItem = {
  id: string;
  title: string;
  icon: string;
  route: string;
  description: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  // Danh sách các mục menu trong trang quản lý tài khoản
  const menuItems: MenuItem[] = [
    {
      id: 'personal-info',
      title: 'Thông tin cá nhân',
      icon: 'person-outline',
      route: '/profile/personal-info',
      description: 'Cập nhật thông tin cá nhân của bạn'
    },
    {
      id: 'change-password',
      title: 'Đổi mật khẩu',
      icon: 'lock-closed-outline',
      route: '/profile/change-password',
      description: 'Thay đổi mật khẩu đăng nhập'
    },
    {
      id: 'addresses',
      title: 'Địa chỉ giao hàng',
      icon: 'location-outline',
      route: '/address',
      description: 'Quản lý địa chỉ giao hàng của bạn'
    },
    {
      id: 'orders',
      title: 'Đơn hàng của tôi',
      icon: 'document-text-outline',
      route: '/orders',
      description: 'Xem lịch sử và trạng thái đơn hàng'
    },
    {
      id: 'favorites',
      title: 'Sản phẩm yêu thích',
      icon: 'heart-outline',
      route: '/favorites',
      description: 'Xem danh sách sản phẩm yêu thích'
    }
  ];

  // Xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Xóa thông tin đăng nhập
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              
              // Cập nhật trạng thái đăng nhập
              setUser(null);
              
              // Chuyển hướng đến trang đăng nhập
              router.replace('/login');
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại sau.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Render mục menu
  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => router.push(item.route)}
    >
      <ThemedView style={styles.menuItemLeft}>
        <ThemedView style={styles.menuItemIcon}>
          <Ionicons name={item.icon as any} size={24} color="#3498db" />
        </ThemedView>
        <ThemedView style={styles.menuItemContent}>
          <ThemedText style={styles.menuItemTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.menuItemDescription}>{item.description}</ThemedText>
        </ThemedView>
      </ThemedView>
      <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Tài khoản của tôi</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Thông tin người dùng */}
        <ThemedView style={styles.userInfoCard}>
          <ThemedView style={styles.userAvatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </ThemedView>
          <ThemedView style={styles.userInfo}>
            <ThemedText style={styles.userName}>{user?.name || 'Người dùng'}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email || 'Email chưa cập nhật'}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Danh sách menu */}
        <ThemedView style={styles.menuCard}>
          {menuItems.map(renderMenuItem)}
        </ThemedView>

        {/* Nút đăng xuất */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#7f8c8d',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

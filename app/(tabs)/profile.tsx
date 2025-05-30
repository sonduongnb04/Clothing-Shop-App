import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as authService from "@/services/authService";
import { useAuth } from "../_layout";
import { clearCart } from '@/services/cartService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Định nghĩa kiểu dữ liệu
type UserData = {
  name: string;
  email: string;
  phone: string;
  avatar: any;
};

// Avatar mặc định
const defaultAvatar = require("@/assets/images/partial-react-logo.png");

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [userData, setUserData] = useState<UserData>({
    name: user?.name || "Người dùng",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: defaultAvatar,
  });

  // Cập nhật userData khi user thay đổi
  useEffect(() => {
    if (user) {
      console.log("Thông tin người dùng đã đăng nhập:", user);
      setUserData({
        name: user.name || "Người dùng",
        email: user.email || "",
        phone: user.phone || "",
        avatar: defaultAvatar,
      });
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = user?._id;

              await authService.logout();

              if (userId) {
                await clearCart();
                await AsyncStorage.removeItem(`WISHLIST_ITEMS_${userId}`);
              }

              setUser(null);
              setIsLoggedIn(false);

              router.replace("/login");
            } catch (error) {
              console.error("Lỗi khi đăng xuất:", error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất");
            }
          }
        }
      ]
    );
  };

  // Render menu item
  const renderMenuItem = (
    icon: string,
    title: string,
    onPress: () => void,
    showChevron: boolean = true,
    color: string = "#333"
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <ThemedView style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={22} color={color} />
        <ThemedText style={[styles.menuText, { color }]}>{title}</ThemedText>
      </ThemedView>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#999" />
      )}
    </TouchableOpacity>
  );

  // Render login prompt cho user chưa đăng nhập
  const renderLoginPrompt = () => (
    <ThemedView style={styles.loginPromptContainer}>
      <Ionicons name="person-circle-outline" size={100} color="#ccc" />
      <ThemedText style={styles.loginPromptTitle}>Chào mừng bạn đến với Shop</ThemedText>
      <ThemedText style={styles.loginPromptText}>
        Đăng nhập để trải nghiệm đầy đủ các tính năng
      </ThemedText>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => router.push("/register")}
      >
        <ThemedText style={styles.registerButtonText}>Đăng ký tài khoản</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Tài khoản</ThemedText>
      </ThemedView>

      {isLoggedIn ? (
        <>
          {/* Thông tin người dùng */}
          <ThemedView style={styles.profileCard}>
            <ThemedView style={styles.avatarContainer}>
              <Image source={userData.avatar} style={styles.avatar} />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.userInfo}>
              <ThemedText style={styles.userName}>{userData.name}</ThemedText>

              {userData.email && (
                <ThemedView style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <ThemedText style={styles.userContact}>
                    {userData.email}
                  </ThemedText>
                </ThemedView>
              )}

              {userData.phone && (
                <ThemedView style={styles.contactItem}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <ThemedText style={styles.userContact}>
                    {userData.phone}
                  </ThemedText>
                </ThemedView>
              )}

              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => router.push("/profile/personal-info")}
              >
                <Ionicons name="create-outline" size={16} color="#FF4500" />
                <ThemedText style={styles.editProfileText}>Chỉnh sửa thông tin</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Menu chính */}
          <ThemedView style={styles.menuSection}>
            <ThemedText style={styles.sectionTitle}>Đơn hàng & Dịch vụ</ThemedText>

            {renderMenuItem(
              "receipt-outline",
              "Đơn hàng của tôi",
              () => router.push("/orders")
            )}

            {renderMenuItem(
              "heart-outline",
              "Sản phẩm yêu thích",
              () => router.push("/(tabs)/favorites")
            )}

            {renderMenuItem(
              "location-outline",
              "Địa chỉ giao hàng",
              () => router.push("/address")
            )}
          </ThemedView>

          {/* Menu tài khoản */}
          <ThemedView style={styles.menuSection}>
            <ThemedText style={styles.sectionTitle}>Tài khoản</ThemedText>

            {renderMenuItem(
              "person-outline",
              "Thông tin cá nhân",
              () => router.push("/profile/personal-info")
            )}

            {renderMenuItem(
              "lock-closed-outline",
              "Thay đổi mật khẩu",
              () => router.push("/profile/change-password")
            )}

            {renderMenuItem(
              "notifications-outline",
              "Cài đặt thông báo",
              () => Alert.alert("Thông báo", "Tính năng đang được phát triển")
            )}
          </ThemedView>

          {/* Menu hỗ trợ */}
          <ThemedView style={styles.menuSection}>
            <ThemedText style={styles.sectionTitle}>Hỗ trợ</ThemedText>

            {renderMenuItem(
              "help-circle-outline",
              "Trung tâm trợ giúp",
              () => Alert.alert("Thông báo", "Tính năng đang được phát triển")
            )}

            {renderMenuItem(
              "chatbubble-outline",
              "Liên hệ hỗ trợ",
              () => Alert.alert("Thông báo", "Tính năng đang được phát triển")
            )}

            {renderMenuItem(
              "information-circle-outline",
              "Về chúng tôi",
              () => Alert.alert("Thông báo", "Tính năng đang được phát triển")
            )}

            {renderMenuItem(
              "document-text-outline",
              "Điều khoản sử dụng",
              () => Alert.alert("Thông báo", "Tính năng đang được phát triển")
            )}
          </ThemedView>

          {/* Đăng xuất */}
          <ThemedView style={styles.menuSection}>
            {renderMenuItem(
              "log-out-outline",
              "Đăng xuất",
              handleLogout,
              false,
              "#dc3545"
            )}
          </ThemedView>
        </>
      ) : (
        renderLoginPrompt()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF4500",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userContact: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: "#FF4500",
    marginLeft: 4,
    fontWeight: "600",
  },
  menuSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  loginPromptTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  loginPromptText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF4500",
    width: "100%",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#FF4500",
    fontSize: 16,
    fontWeight: "600",
  },
});

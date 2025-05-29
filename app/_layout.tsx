import React, { useEffect, useState, createContext, useContext } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Tạo context để quản lý trạng thái đăng nhập
type AuthContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

// Kiểm tra trạng thái đăng nhập và điều hướng người dùng
function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Chỉ điều hướng sau khi đã mount và có segments
    if (!segments?.length) return;

    const firstSegment = segments[0] as string;
    const secondSegment = segments[1] as string;

    // Danh sách các routes được phép truy cập mà không cần đăng nhập
    const publicRoutes = ['product', 'checkout', 'address', 'orders'];

    // Cho phép truy cập trang chi tiết sản phẩm, trang thanh toán và trang địa chỉ mà không cần đăng nhập
    // @ts-ignore - Tạm thời tắt type checking cho route comparison
    if (publicRoutes.includes(firstSegment)) {
      return;
    }

    // Trang profile yêu cầu đăng nhập - kiểm tra cả profile và taiKhoan
    if ((firstSegment === 'profile' || firstSegment === 'taiKhoan') && !user) {
      router.replace('/login');
      return;
    }

    const inAuthGroup = firstSegment === '(tabs)';

    if (!user && inAuthGroup) {
      // Nếu người dùng chưa đăng nhập và đang cố truy cập trang chính
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      // Danh sách các routes được phép cho user đã đăng nhập
      const allowedLoggedInRoutes = ['register', 'profile', 'taiKhoan', 'orders', 'address'];

      // @ts-ignore - Tạm thời tắt type checking cho route comparison
      if (!allowedLoggedInRoutes.includes(firstSegment)) {
        // Nếu người dùng đã đăng nhập và đang ở trang đăng nhập
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        if (userToken && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <CartProvider>
        <WishlistProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="product" />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="address" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="orders" />
              <Stack.Screen name="[...missing]" options={{ headerShown: true }} />
            </Stack>
            {/* Sử dụng hook bảo vệ route sau khi render */}
            <ProtectedRouteComponent user={user} />
            <StatusBar style="auto" />
          </ThemeProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthContext.Provider>
  );
}

// Tách logic bảo vệ route thành một component riêng
function ProtectedRouteComponent({ user }: { user: any }) {
  useProtectedRoute(user);
  return null;
}

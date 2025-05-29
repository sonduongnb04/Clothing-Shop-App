import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, View, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { login } from '@/services/authService';
import { useAuth } from './_layout';
import { migrateCartToUser } from '@/services/cartService';
import { migrateWishlistToUser } from '@/services/wishlistService';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Kiểm tra dữ liệu nhập
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Bắt đầu đăng nhập với email:', email);
      
      // Gọi API đăng nhập
      const data = await login(email, password);
      
      if (!data || !data.token) {
        console.error('Không nhận được token từ server');
        setError('Lỗi xác thực. Vui lòng thử lại sau.');
        return;
      }
      
      // Cập nhật trạng thái đăng nhập trong context
      setUser(data.user);
      
      // Di chuyển dữ liệu từ tài khoản khách sang tài khoản đã đăng nhập
      try {
        // Lấy đúng ID từ user object
        const userId = data.user._id; // Sử dụng _id thay vì id
        
        // Di chuyển giỏ hàng
        await migrateCartToUser(userId);
        
        // Di chuyển danh sách yêu thích
        await migrateWishlistToUser(userId);
        
        console.log('Đã di chuyển dữ liệu giỏ hàng và yêu thích thành công');
      } catch (migrationError) {
        console.error('Lỗi khi di chuyển dữ liệu:', migrationError);
        // Không dừng quá trình đăng nhập nếu có lỗi khi di chuyển dữ liệu
      }
      
      // Xử lý sau khi đăng nhập thành công
      console.log('Đăng nhập thành công:', data);
      
      // Chuyển hướng đến trang chủ
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Lỗi đăng nhập chi tiết:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.message && error.message.includes('Network')) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
      } else if (error.response && error.response.status === 401) {
        setError('Email hoặc mật khẩu không đúng.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#5DCCBE" barStyle="light-content" />
      
      {/* Logo */}


      {/* Form Card with Title */}
      <View style={styles.formCard}>
        {/* Title inside form card */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.appTitle}>Fashion App</ThemedText>
          <ThemedText style={styles.appSubtitle}>Mua sắm thời trang dễ dàng</ThemedText>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

      {/* Login Form Fields */}
        
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={22} color="#5DCCBE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={22} color="#5DCCBE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang được phát triển')}
        >
          <ThemedText style={styles.forgotPasswordText}>Quên mật khẩu?</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.loginButtonText}><ThemedText>Đăng nhập</ThemedText></ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <ThemedText style={styles.noAccountText}><ThemedText>Chưa có tài khoản? </ThemedText></ThemedText>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <ThemedText style={styles.registerText}><ThemedText>Đăng ký</ThemedText></ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DCCBE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5DCCBE',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },

  formCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 15,
    paddingBottom: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6A3DE8',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#5DCCBE',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    color: '#666',
    fontSize: 14,
  },
  registerText: {
    color: '#5DCCBE',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
});

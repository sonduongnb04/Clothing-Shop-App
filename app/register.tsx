import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, View, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { register } from '@/services/authService';
import { useAuth } from './_layout';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await register({ name, email, password, phone, address });
      setUser(data);
      router.replace('/(tabs)');
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#5DCCBE" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.appTitle}>FASHION APP</ThemedText>
            <ThemedText style={styles.appSubtitle}>Tạo tài khoản mới</ThemedText>
          </View>
          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          {/* Họ và tên */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={22} color="#5DCCBE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={name}
              onChangeText={setName}
            />
          </View>
          {/* Email */}
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
          {/* Mật khẩu */}
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
          {/* Xác nhận mật khẩu */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={22} color="#5DCCBE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Số điện thoại */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={22} color="#5DCCBE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          {/* Địa chỉ */}
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={22} color="#5DCCBE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.registerButtonText}>Đăng ký</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <ThemedText style={styles.haveAccountText}>Đã có tài khoản? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <ThemedText style={styles.loginText}>Đăng nhập</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: 345,
    paddingHorizontal: 0,
    paddingVertical: 20,
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
    borderRadius: 20,
    width: 360,
    alignSelf: 'center',
    marginTop: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  registerButton: {
    backgroundColor: '#5DCCBE',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haveAccountText: {
    color: '#666',
    fontSize: 14,
  },
  loginText: {
    color: '#5DCCBE',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
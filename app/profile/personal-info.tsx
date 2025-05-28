import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getCurrentUser, updateUserProfile } from '@/src/services/userService';
import { useAuth } from '@/app/_layout';

type UserInfo = {
  name: string;
  email: string;
  phone: string;
};

type ValidationErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [originalInfo, setOriginalInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
  });

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        // Sử dụng thông tin từ context nếu có
        if (user) {
          const info = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          };
          setUserInfo(info);
          setOriginalInfo(info);
        } else {
          // Fallback lấy từ service
          const userData = await getCurrentUser();
          if (userData) {
            const info = {
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
            };
            setUserInfo(info);
            setOriginalInfo(info);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  // Kiểm tra có thay đổi không
  useEffect(() => {
    const changed = JSON.stringify(userInfo) !== JSON.stringify(originalInfo);
    setHasChanges(changed);
  }, [userInfo, originalInfo]);

  // Validate dữ liệu
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!userInfo.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (userInfo.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!userInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(userInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (userInfo.phone && !validatePhone(userInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cập nhật thông tin người dùng
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    if (!hasChanges) {
      Alert.alert('Thông báo', 'Không có thay đổi nào để lưu');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateUserProfile(userInfo);

      // Cập nhật thông tin người dùng trong context
      if (updatedUser && setUser) {
        setUser({
          ...user,
          ...updatedUser
        });
      }

      setOriginalInfo(userInfo);
      setHasChanges(false);

      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      let errorMessage = 'Không thể cập nhật thông tin. Vui lòng thử lại sau.';

      if (error.message && error.message.includes('kết nối mạng')) {
        errorMessage = 'Không có kết nối mạng. Thông tin đã được lưu tạm thời và sẽ được đồng bộ khi có kết nối.';

        // Hiển thị thông báo thành công vì đã lưu offline
        setOriginalInfo(userInfo);
        setHasChanges(false);
        Alert.alert('Đã lưu offline', errorMessage);
        return;
      }

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Hủy thay đổi
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Hủy thay đổi',
        'Bạn có chắc chắn muốn hủy các thay đổi?',
        [
          { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
          {
            text: 'Hủy',
            style: 'destructive',
            onPress: () => {
              setUserInfo(originalInfo);
              setErrors({});
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  // Kiểm tra định dạng email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Kiểm tra định dạng số điện thoại
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Cập nhật field và xóa lỗi
  const updateField = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Render input field
  const renderInputField = (
    label: string,
    field: keyof UserInfo,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    autoCapitalize: 'none' | 'sentences' | 'words' | 'characters' = 'sentences',
    required: boolean = true
  ) => (
    <ThemedView style={styles.formGroup}>
      <ThemedText style={styles.label}>
        {label} {required && <ThemedText style={styles.required}>*</ThemedText>}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.errorInput
        ]}
        value={userInfo[field]}
        onChangeText={(text) => updateField(field, text)}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {errors[field] && (
        <ThemedText style={styles.errorText}>{errors[field]}</ThemedText>
      )}
    </ThemedView>
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Thông tin cá nhân</ThemedText>
          <ThemedView style={styles.headerRight} />
        </ThemedView>

        <ThemedView style={styles.loginPromptContainer}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <ThemedText style={styles.loginPromptTitle}>Vui lòng đăng nhập</ThemedText>
          <ThemedText style={styles.loginPromptText}>
            Đăng nhập để quản lý thông tin cá nhân
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

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Thông tin cá nhân</ThemedText>
          <ThemedView style={styles.headerRight} />
        </ThemedView>

        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <ThemedText style={styles.loadingText}>Đang tải thông tin...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Thông tin cá nhân</ThemedText>
        <ThemedView style={styles.headerRight} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thông tin cơ bản */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>

          {renderInputField('Họ và tên', 'name', 'Nhập họ và tên đầy đủ', 'default', 'words')}
          {renderInputField('Email', 'email', 'Nhập địa chỉ email', 'email-address', 'none')}
          {renderInputField('Số điện thoại', 'phone', 'Nhập số điện thoại', 'phone-pad', 'none', false)}
        </ThemedView>

        {/* Ghi chú */}
        <ThemedView style={styles.noteSection}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <ThemedText style={styles.noteText}>
            Thông tin cá nhân sẽ được sử dụng để liên lạc và giao hàng.
            Vui lòng đảm bảo thông tin chính xác.
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={saving}
        >
          <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || saving) && styles.disabledButton
          ]}
          onPress={handleUpdateProfile}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Lưu thông tin</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#FF4500',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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
});

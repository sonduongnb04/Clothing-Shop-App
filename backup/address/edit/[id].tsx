import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getAddressById, updateAddress } from '@/src/services/userService';
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

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  // State cho thông tin địa chỉ
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Lấy thông tin địa chỉ khi component được mount
  useEffect(() => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để chỉnh sửa địa chỉ');
      router.push('/login');
      return;
    }

    const fetchAddressDetails = async () => {
      try {
        setInitialLoading(true);
        const address = await getAddressById(user.id, id as string);
        
        if (address) {
          setFullName(address.fullName);
          setPhoneNumber(address.phoneNumber);
          setProvince(address.province);
          setDistrict(address.district);
          setWard(address.ward);
          setStreetAddress(address.streetAddress);
          setIsDefault(address.isDefault);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy địa chỉ');
          router.back();
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin địa chỉ:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin địa chỉ. Vui lòng thử lại sau.');
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAddressDetails();
  }, [id, user]);

  // Kiểm tra xem form đã được điền đầy đủ chưa
  const isFormValid = () => {
    return (
      fullName.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      province.trim() !== '' &&
      district.trim() !== '' &&
      ward.trim() !== '' &&
      streetAddress.trim() !== ''
    );
  };

  // Xử lý cập nhật địa chỉ
  const handleUpdateAddress = async () => {
    if (!isFormValid()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      
      const updatedAddress: Address = {
        id: id as string,
        fullName,
        phoneNumber,
        province,
        district,
        ward,
        streetAddress,
        isDefault,
      };

      await updateAddress(user.id, updatedAddress);
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF4500" />
        <ThemedText style={styles.loadingText}>Đang tải thông tin địa chỉ...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Chỉnh sửa địa chỉ</ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.formContainer}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Họ và tên</ThemedText>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên người nhận"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Số điện thoại</ThemedText>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Tỉnh/Thành phố</ThemedText>
          <TextInput
            style={styles.input}
            value={province}
            onChangeText={setProvince}
            placeholder="Nhập tỉnh/thành phố"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Quận/Huyện</ThemedText>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="Nhập quận/huyện"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Phường/Xã</ThemedText>
          <TextInput
            style={styles.input}
            value={ward}
            onChangeText={setWard}
            placeholder="Nhập phường/xã"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Địa chỉ cụ thể</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={streetAddress}
            onChangeText={setStreetAddress}
            placeholder="Nhập số nhà, tên đường, tòa nhà..."
            multiline={true}
            numberOfLines={3}
          />
        </ThemedView>

        <TouchableOpacity 
          style={styles.defaultAddressContainer}
          onPress={() => setIsDefault(!isDefault)}
        >
          <Ionicons 
            name={isDefault ? "checkbox" : "square-outline"} 
            size={24} 
            color={isDefault ? "#FF4500" : "#666"} 
          />
          <ThemedText style={styles.defaultAddressText}>Đặt làm địa chỉ mặc định</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            !isFormValid() && styles.disabledButton
          ]}
          onPress={handleUpdateAddress}
          disabled={!isFormValid() || loading}
        >
          <ThemedText style={styles.saveButtonText}>
            {loading ? 'Đang lưu...' : 'Cập nhật địa chỉ'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  defaultAddressText: {
    marginLeft: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

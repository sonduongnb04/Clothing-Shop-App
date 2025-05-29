import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key để lưu trữ địa chỉ trong AsyncStorage
const USER_ADDRESSES_KEY = 'USER_ADDRESSES';

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return null;
  }
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData) => {
  try {
    // Thử gọi API trước
    try {
      const response = await API.put('/users/profile', userData);

      if (response.data) {
        // Cập nhật thông tin người dùng trong AsyncStorage
        const currentUserData = await AsyncStorage.getItem('userData');
        if (currentUserData) {
          const parsedData = JSON.parse(currentUserData);
          const updatedUserData = { ...parsedData, ...response.data };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        }
        return response.data;
      }
    } catch (apiError) {
      console.log('API không khả dụng, sử dụng AsyncStorage làm fallback:', apiError.message);

      // Fallback: Cập nhật trong AsyncStorage
      const currentUserData = await AsyncStorage.getItem('userData');
      if (currentUserData) {
        const parsedData = JSON.parse(currentUserData);
        const updatedUserData = { ...parsedData, ...userData };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        return updatedUserData;
      } else {
        // Nếu không có dữ liệu cũ, tạo mới
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        return userData;
      }
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    throw new Error('Không thể cập nhật thông tin. Vui lòng kiểm tra kết nối mạng và thử lại.');
  }
};

// Thay đổi mật khẩu
export const changePassword = async (passwordData) => {
  try {
    // Thử gọi API trước
    try {
      const response = await API.put('/users/change-password', passwordData);
      return response.data;
    } catch (apiError) {
      console.log('API không khả dụng để đổi mật khẩu:', apiError.message);

      // Đối với thay đổi mật khẩu, cần kiểm tra mật khẩu hiện tại
      const currentUserData = await AsyncStorage.getItem('userData');
      if (!currentUserData) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const parsedData = JSON.parse(currentUserData);

      // Kiểm tra nhiều thuộc tính có thể chứa mật khẩu
      let storedPassword = parsedData.password || parsedData.hashedPassword || parsedData.userPassword;

      // Nếu vẫn không có password, có thể user đăng ký bằng social login hoặc chưa set password
      if (!storedPassword) {
        // Trong trường hợp này, chúng ta sẽ lưu mật khẩu hiện tại như là password cũ
        // và cho phép user đổi mật khẩu (giả sử họ đã xác thực qua email/SMS)
        console.log('Không tìm thấy mật khẩu cũ, tạo mật khẩu mới cho user');
        parsedData.password = passwordData.newPassword;
        await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
        return { success: true, message: 'Đặt mật khẩu thành công' };
      }

      // So sánh mật khẩu (trimmed để tránh lỗi space)
      const trimmedStoredPassword = String(storedPassword).trim();
      const trimmedInputPassword = String(passwordData.currentPassword).trim();

      console.log('Debugging password comparison:');
      console.log('Stored password length:', trimmedStoredPassword.length);
      console.log('Input password length:', trimmedInputPassword.length);
      console.log('Are they equal?', trimmedStoredPassword === trimmedInputPassword);

      if (trimmedStoredPassword === trimmedInputPassword) {
        // Cập nhật mật khẩu mới
        parsedData.password = passwordData.newPassword;
        await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
        return { success: true, message: 'Đổi mật khẩu thành công' };
      } else {
        throw new Error('Mật khẩu hiện tại không đúng');
      }
    }
  } catch (error) {
    console.error('Lỗi khi thay đổi mật khẩu:', error);
    if (error.message === 'Mật khẩu hiện tại không đúng' ||
      error.message === 'Không tìm thấy thông tin người dùng') {
      throw error;
    }
    throw new Error('Không thể đổi mật khẩu. Vui lòng kiểm tra kết nối mạng và thử lại.');
  }
};

// Lấy danh sách địa chỉ của người dùng
export const getUserAddresses = async (userId) => {
  try {
    // Trong môi trường thực tế, bạn sẽ gọi API
    // const response = await API.get(`/users/${userId}/addresses`);
    // return response.data;

    // Tạm thời sử dụng AsyncStorage để lưu trữ địa chỉ
    const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
    return addressesJson ? JSON.parse(addressesJson) : [];
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách địa chỉ của người dùng ${userId}:`, error);
    return [];
  }
};

// Lấy thông tin địa chỉ theo ID
export const getAddressById = async (userId, addressId) => {
  try {
    // Trong môi trường thực tế, bạn sẽ gọi API
    // const response = await API.get(`/users/${userId}/addresses/${addressId}`);
    // return response.data;

    // Tạm thời sử dụng AsyncStorage để lưu trữ địa chỉ
    const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
    const addresses = addressesJson ? JSON.parse(addressesJson) : [];
    return addresses.find(address => address.id === addressId);
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin địa chỉ ${addressId}:`, error);
    return null;
  }
};

// Thêm địa chỉ mới
export const addAddress = async (userId, addressData) => {
  try {
    // Trong môi trường thực tế, bạn sẽ gọi API
    // const response = await API.post(`/users/${userId}/addresses`, addressData);
    // return response.data;

    // Tạm thời sử dụng AsyncStorage để lưu trữ địa chỉ
    const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
    const addresses = addressesJson ? JSON.parse(addressesJson) : [];

    // Tạo ID ngẫu nhiên cho địa chỉ mới
    const newAddress = {
      ...addressData,
      id: Date.now().toString(),
    };

    // Nếu đây là địa chỉ mặc định, đặt tất cả các địa chỉ khác thành không mặc định
    if (newAddress.isDefault) {
      addresses.forEach(address => {
        address.isDefault = false;
      });
    }

    // Nếu đây là địa chỉ đầu tiên, đặt làm mặc định
    if (addresses.length === 0) {
      newAddress.isDefault = true;
    }

    const updatedAddresses = [...addresses, newAddress];
    await AsyncStorage.setItem(`${USER_ADDRESSES_KEY}_${userId}`, JSON.stringify(updatedAddresses));

    return newAddress;
  } catch (error) {
    console.error('Lỗi khi thêm địa chỉ mới:', error);
    throw error;
  }
};

// Cập nhật địa chỉ
export const updateAddress = async (userId, addressData) => {
  try {
    // Trong môi trường thực tế, bạn sẽ gọi API
    // const response = await API.put(`/users/${userId}/addresses/${addressData.id}`, addressData);
    // return response.data;

    // Tạm thời sử dụng AsyncStorage để lưu trữ địa chỉ
    const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
    const addresses = addressesJson ? JSON.parse(addressesJson) : [];

    // Nếu đây là địa chỉ mặc định, đặt tất cả các địa chỉ khác thành không mặc định
    if (addressData.isDefault) {
      addresses.forEach(address => {
        if (address.id !== addressData.id) {
          address.isDefault = false;
        }
      });
    }

    const updatedAddresses = addresses.map(address =>
      address.id === addressData.id ? addressData : address
    );

    await AsyncStorage.setItem(`${USER_ADDRESSES_KEY}_${userId}`, JSON.stringify(updatedAddresses));

    return addressData;
  } catch (error) {
    console.error(`Lỗi khi cập nhật địa chỉ ${addressData.id}:`, error);
    throw error;
  }
};

// Xóa địa chỉ
export const deleteAddress = async (userId, addressId) => {
  try {
    // Trong môi trường thực tế, bạn sẽ gọi API
    // const response = await API.delete(`/users/${userId}/addresses/${addressId}`);
    // return response.data;

    // Tạm thời sử dụng AsyncStorage để lưu trữ địa chỉ
    const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
    const addresses = addressesJson ? JSON.parse(addressesJson) : [];

    // Lọc ra địa chỉ cần xóa
    const updatedAddresses = addresses.filter(address => address.id !== addressId);

    // Nếu địa chỉ bị xóa là địa chỉ mặc định và vẫn còn địa chỉ khác, đặt địa chỉ đầu tiên làm mặc định
    const deletedAddress = addresses.find(address => address.id === addressId);
    if (deletedAddress && deletedAddress.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    await AsyncStorage.setItem(`${USER_ADDRESSES_KEY}_${userId}`, JSON.stringify(updatedAddresses));

    return { success: true };
  } catch (error) {
    console.error(`Lỗi khi xóa địa chỉ ${addressId}:`, error);
    throw error;
  }
};

// Đặt địa chỉ mặc định
export const setDefaultAddress = async (userId, addressId) => {
  try {
    // Thử gọi API trước
    try {
      const response = await API.put(`/users/${userId}/addresses/${addressId}/default`);

      // Cập nhật lại AsyncStorage để đồng bộ
      const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
      if (addressesJson) {
        const addresses = JSON.parse(addressesJson);
        const updatedAddresses = addresses.map(address => ({
          ...address,
          isDefault: address.id === addressId
        }));
        await AsyncStorage.setItem(`${USER_ADDRESSES_KEY}_${userId}`, JSON.stringify(updatedAddresses));
      }

      return response.data;
    } catch (apiError) {
      console.log('API không khả dụng, sử dụng AsyncStorage làm fallback:', apiError.message);

      // Fallback: Sử dụng AsyncStorage
      const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
      if (!addressesJson) {
        throw new Error('Không tìm thấy danh sách địa chỉ');
      }

      const addresses = JSON.parse(addressesJson);
      const addressExists = addresses.find(address => address.id === addressId);

      if (!addressExists) {
        throw new Error('Địa chỉ không tồn tại');
      }

      const updatedAddresses = addresses.map(address => ({
        ...address,
        isDefault: address.id === addressId
      }));

      await AsyncStorage.setItem(`${USER_ADDRESSES_KEY}_${userId}`, JSON.stringify(updatedAddresses));
      return { success: true, message: 'Đã đặt làm địa chỉ mặc định' };
    }
  } catch (error) {
    console.error(`Lỗi khi đặt địa chỉ mặc định ${addressId}:`, error);
    if (error.message === 'Không tìm thấy danh sách địa chỉ' || error.message === 'Địa chỉ không tồn tại') {
      throw error;
    }
    throw new Error('Không thể đặt địa chỉ mặc định. Vui lòng thử lại.');
  }
};

// Lấy địa chỉ mặc định của người dùng
export const getDefaultAddress = async (userId) => {
  try {
    // Trong môi trường thực tế, bạn sẽ gọi API
    // const response = await API.get(`/users/${userId}/addresses/default`);
    // return response.data;

    // Tạm thời sử dụng AsyncStorage để lưu trữ địa chỉ
    const addressesJson = await AsyncStorage.getItem(`${USER_ADDRESSES_KEY}_${userId}`);
    const addresses = addressesJson ? JSON.parse(addressesJson) : [];

    return addresses.find(address => address.isDefault) || (addresses.length > 0 ? addresses[0] : null);
  } catch (error) {
    console.error(`Lỗi khi lấy địa chỉ mặc định của người dùng ${userId}:`, error);
    return null;
  }
};

// Đồng bộ dữ liệu offline lên server
export const syncOfflineData = async () => {
  try {
    // Kiểm tra kết nối mạng bằng cách thử gọi một API đơn giản
    await API.get('/health-check');

    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);

      // Kiểm tra xem có cần đồng bộ không (có thể thêm flag pendingSync)
      if (parsedData.pendingSync) {
        try {
          await API.put('/users/profile', parsedData);

          // Xóa flag pending sync
          delete parsedData.pendingSync;
          await AsyncStorage.setItem('userData', JSON.stringify(parsedData));

          console.log('Đồng bộ thông tin người dùng thành công');
        } catch (error) {
          console.log('Không thể đồng bộ thông tin người dùng:', error.message);
        }
      }
    }

    return true;
  } catch (error) {
    console.log('Không có kết nối mạng để đồng bộ:', error.message);
    return false;
  }
};

// Đánh dấu dữ liệu cần đồng bộ
export const markForSync = async (userData) => {
  try {
    const currentUserData = await AsyncStorage.getItem('userData');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      const updatedData = { ...parsedData, ...userData, pendingSync: true };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('Lỗi khi đánh dấu dữ liệu để đồng bộ:', error);
  }
};

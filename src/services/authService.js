import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Đăng ký người dùng mới
export const register = async (userData) => {
  try {
    console.log('Gửi yêu cầu đăng ký đến:', API.defaults.baseURL + '/users/register');
    console.log('Dữ liệu đăng ký:', JSON.stringify(userData));
    const response = await API.post('/users/register', userData);
    console.log('Phản hồi đăng ký thành công:', response.data);
    
    if (response.data) {
      // Lưu thông tin người dùng và token vào AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      await AsyncStorage.setItem('userToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Lỗi đăng ký:', error.message);
    if (error.response) {
      // Máy chủ trả về lỗi với mã trạng thái
      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
      throw new Error(error.response.data.message || 'Lỗi từ máy chủ');
    } else if (error.request) {
      // Yêu cầu được gửi nhưng không nhận được phản hồi
      console.error('Không nhận được phản hồi từ máy chủ');
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Lỗi khi thiết lập yêu cầu
      console.error('Lỗi thiết lập yêu cầu:', error.message);
      throw new Error('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
    }
  }
};

// Đăng nhập người dùng
export const login = async (email, password) => {
  try {
    console.log('Gửi yêu cầu đăng nhập đến:', API.defaults.baseURL + '/users/login');
    console.log('Dữ liệu đăng nhập:', { email });
    
    const response = await API.post('/users/login', { email, password });
    console.log('Phản hồi đăng nhập thành công:', response.data);
    
    // Kiểm tra cấu trúc dữ liệu trả về
    if (!response.data || !response.data.token) {
      throw new Error('Dữ liệu trả về không hợp lệ');
    }
    
    // Lưu token vào AsyncStorage
    await AsyncStorage.setItem('userToken', response.data.token);
    
    // Tạo đối tượng user từ dữ liệu trả về
    const userData = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      phone: response.data.phone || '',
      address: response.data.address || '',
      isAdmin: response.data.isAdmin || false
    };
    
    // Lưu thông tin người dùng
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    return {
      token: response.data.token,
      user: userData
    };
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.message);
    if (error.response) {
      // Máy chủ trả về lỗi với mã trạng thái
      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
      throw new Error(error.response.data.message || 'Email hoặc mật khẩu không đúng');
    } else if (error.request) {
      // Yêu cầu được gửi nhưng không nhận được phản hồi
      console.error('Không nhận được phản hồi từ máy chủ');
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Lỗi khi thiết lập yêu cầu
      console.error('Lỗi thiết lập yêu cầu:', error.message);
      throw new Error('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
    }
  }
};

// Đăng xuất người dùng
export const logout = async () => {
  try {
    // Xóa thông tin người dùng và token khỏi AsyncStorage
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
  }
};

// Lấy thông tin người dùng từ AsyncStorage
export const getUserInfo = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return null;
  }
};

// Kiểm tra trạng thái đăng nhập
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    console.error('Lỗi khi kiểm tra xác thực:', error);
    return false;
  }
};

// Lấy thông tin profile người dùng từ API
export const getUserProfile = async () => {
  try {
    const response = await API.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
  }
};

// Cập nhật thông tin profile người dùng
export const updateUserProfile = async (userData) => {
  try {
    const response = await API.put('/users/profile', userData);
    
    if (response.data) {
      // Cập nhật thông tin người dùng trong AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }
    }
    
    return response.data;
  } catch (error) {
    throw error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
  }
};

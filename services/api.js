import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tạo instance axios với URL cơ sở
const API = axios.create({
  // Sử dụng địa chỉ IP thực của máy tính thay vì localhost để thiết bị di động có thể kết nối
  // Địa chỉ IP này là địa chỉ IP thực của máy tính trong mạng WiFi
  baseURL: 'http://192.168.223.21:5000/api', // Địa chỉ IP thực của máy tính
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thêm timeout để tránh chờ quá lâu
});

// Interceptor để thêm token vào header của mỗi request
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;

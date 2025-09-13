import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081',
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查连接');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 
import axios from 'axios';

// 创建axios实例
const service = axios.create({
  timeout: 5000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可以在这里添加请求头等信息
    // 例如：config.headers['Authorization'] = 'Bearer your-token';
    return config;
  },
  (error) => {
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === -1) {
      ElMessage({
        message: res.message,
        type: 'error'
      });
    }
    return res;
  },
  (error) => {
    console.log('err' + error); // for debug
    return Promise.reject(error);
  }
);

export default service;

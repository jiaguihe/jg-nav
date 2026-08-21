import axios, { type AxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse } from '@jg/api-types';

/**
 * axios 实例：登录态由 httpOnly Cookie 承载，无需手动携带 token
 */
const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true
});

// 拦截器仅做统一错误提示，不改变返回值结构
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    if (res.code !== 0) {
      ElMessage.error(res.message);
      return Promise.reject(res);
    }
    return response;
  },
  (error) => {
    const message =
      (error.response?.data as ApiResponse)?.message || '网络异常，请稍后重试';
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

/** 泛型请求方法：返回值即业务 data 字段 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await service.request<ApiResponse<T>>(config);
  return response.data.data;
}

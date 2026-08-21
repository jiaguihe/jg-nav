import { request } from './request';
import type { UserVO } from '@jg/api-types';

/** 获取当前登录用户（Cookie 有效时返回；匿名访问的 401 静默处理，不弹提示） */
export function fetchMe() {
  return request<UserVO>({ url: '/user/me', method: 'GET', silent: true });
}

export function login(params: { username: string; password: string }) {
  return request<UserVO>({ url: '/user/login', method: 'POST', data: params });
}

export function register(params: { username: string; password: string }) {
  return request<UserVO>({
    url: '/user/register',
    method: 'POST',
    data: params
  });
}

export function logout() {
  return request<null>({ url: '/user/logout', method: 'POST' });
}

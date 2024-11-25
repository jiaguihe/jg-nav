import service from './request';

export function getAllUser() {
  return service.get('/api/user');
}

export function login(value: { username: string; password: string }) {
  return service.post('/api/user/login', value);
}

export function register(value: { username: string; password: string }) {
  return service.post('/api/user', value);
}

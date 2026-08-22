import { request } from './request';
import type {
  TakeawayShopVO,
  CreateShopDTO,
  UpdateShopDTO,
  TakeawayOrderVO,
  CreateOrderDTO,
  UpdateOrderDTO
} from '@jg/api-types';

/* ---------- 店铺 ---------- */

export function fetchShops() {
  return request<TakeawayShopVO[]>({
    url: '/takeaway/shops',
    method: 'GET'
  });
}

export function createShop(data: CreateShopDTO) {
  return request<TakeawayShopVO>({
    url: '/takeaway/shops',
    method: 'POST',
    data
  });
}

export function updateShop(id: number, data: UpdateShopDTO) {
  return request<TakeawayShopVO>({
    url: `/takeaway/shops/${id}`,
    method: 'PATCH',
    data
  });
}

export function removeShop(id: number) {
  return request<null>({ url: `/takeaway/shops/${id}`, method: 'DELETE' });
}

/* ---------- 点单记录 ---------- */

export function fetchOrders(shopId: number) {
  return request<TakeawayOrderVO[]>({
    url: '/takeaway/orders',
    method: 'GET',
    params: { shopId }
  });
}

export function createOrder(data: CreateOrderDTO) {
  return request<TakeawayOrderVO>({
    url: '/takeaway/orders',
    method: 'POST',
    data
  });
}

export function updateOrder(id: number, data: UpdateOrderDTO) {
  return request<TakeawayOrderVO>({
    url: `/takeaway/orders/${id}`,
    method: 'PATCH',
    data
  });
}

export function removeOrder(id: number) {
  return request<null>({ url: `/takeaway/orders/${id}`, method: 'DELETE' });
}

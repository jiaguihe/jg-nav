import { request } from './request';
import type { LinkVO, CreateLinkDTO, UpdateLinkDTO } from '@jg/api-types';

export function fetchLinks() {
  return request<LinkVO[]>({ url: '/links', method: 'GET' });
}

export function createLink(data: CreateLinkDTO) {
  return request<LinkVO>({ url: '/links', method: 'POST', data });
}

export function updateLink(id: number, data: UpdateLinkDTO) {
  return request<LinkVO>({ url: `/links/${id}`, method: 'PATCH', data });
}

export function removeLink(id: number) {
  return request<null>({ url: `/links/${id}`, method: 'DELETE' });
}

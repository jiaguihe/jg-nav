import { request } from './request';
import type {
  LinkVO,
  CreateLinkDTO,
  UpdateLinkDTO,
  ReorderLinksDTO,
  LinkGroupVO,
  CreateLinkGroupDTO,
  UpdateLinkGroupDTO
} from '@jg/api-types';

/* ---------- 收藏 ---------- */

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

export function reorderLinks(data: ReorderLinksDTO) {
  return request<null>({ url: '/links/reorder', method: 'PATCH', data });
}

export function clickLink(id: number) {
  return request<null>({
    url: `/links/${id}/click`,
    method: 'POST',
    silent: true
  });
}

/* ---------- 收藏分组 ---------- */

export function fetchLinkGroups() {
  return request<LinkGroupVO[]>({ url: '/link-groups', method: 'GET' });
}

export function createLinkGroup(data: CreateLinkGroupDTO) {
  return request<LinkGroupVO>({ url: '/link-groups', method: 'POST', data });
}

export function updateLinkGroup(id: number, data: UpdateLinkGroupDTO) {
  return request<LinkGroupVO>({
    url: `/link-groups/${id}`,
    method: 'PATCH',
    data
  });
}

export function removeLinkGroup(id: number) {
  return request<null>({ url: `/link-groups/${id}`, method: 'DELETE' });
}

import service from './request';

export function getAllLinks(userId: number) {
  return service.get(`/api/links/${userId}`);
}

export function addLink(userId: number, url: string, description: string) {
  return service.post(`/api/links`, {
    userId,
    url,
    description
  });
}

export function removeLinks(id: number) {
  return service.delete(`/api/links/${id}`);
}

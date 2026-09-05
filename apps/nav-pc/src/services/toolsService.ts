import { request } from './request';
import type {
  TodoVO,
  CreateTodoDTO,
  UpdateTodoDTO,
  NoteVO,
  CreateNoteDTO,
  UpdateNoteDTO,
  MemorialVO,
  CreateMemorialDTO,
  UpdateMemorialDTO,
  TranslateDTO,
  TranslateResultVO
} from '@jg/api-types';

/* ---------- 待办 ---------- */

export function fetchTodos() {
  return request<TodoVO[]>({ url: '/todos', method: 'GET' });
}

export function createTodo(data: CreateTodoDTO) {
  return request<TodoVO>({ url: '/todos', method: 'POST', data });
}

export function updateTodo(id: number, data: UpdateTodoDTO) {
  return request<TodoVO>({ url: `/todos/${id}`, method: 'PATCH', data });
}

export function removeTodo(id: number) {
  return request<null>({ url: `/todos/${id}`, method: 'DELETE' });
}

/* ---------- 便签 ---------- */

export function fetchNotes() {
  return request<NoteVO[]>({ url: '/notes', method: 'GET' });
}

export function createNote(data: CreateNoteDTO) {
  return request<NoteVO>({ url: '/notes', method: 'POST', data });
}

export function updateNote(id: number, data: UpdateNoteDTO) {
  return request<NoteVO>({ url: `/notes/${id}`, method: 'PATCH', data });
}

export function removeNote(id: number) {
  return request<null>({ url: `/notes/${id}`, method: 'DELETE' });
}

/* ---------- 纪念日 ---------- */

export function fetchMemorials() {
  return request<MemorialVO[]>({ url: '/memorials', method: 'GET' });
}

export function createMemorial(data: CreateMemorialDTO) {
  return request<MemorialVO>({ url: '/memorials', method: 'POST', data });
}

export function updateMemorial(id: number, data: UpdateMemorialDTO) {
  return request<MemorialVO>({
    url: `/memorials/${id}`,
    method: 'PATCH',
    data
  });
}

export function removeMemorial(id: number) {
  return request<null>({ url: `/memorials/${id}`, method: 'DELETE' });
}

/* ---------- 翻译 ---------- */

export function translateText(data: TranslateDTO) {
  return request<TranslateResultVO>({
    url: '/translate',
    method: 'POST',
    data,
    timeout: 15000
  });
}

import { ApiResponse } from '@jg/api-types';

/**
 * 统一响应结构，与共享类型 ApiResponse 对齐
 */
export class ResponseDto<T> implements ApiResponse<T> {
  code: number;
  message: string;
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = '操作成功'): ResponseDto<T> {
    return new ResponseDto(0, message, data);
  }

  static fail<T = null>(message: string, data: T = null as T): ResponseDto<T> {
    return new ResponseDto(-1, message, data);
  }
}

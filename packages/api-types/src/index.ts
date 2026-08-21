/**
 * 统一响应结构：与后端 ResponseDto 对齐
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 业务状态码 */
export const ResponseCode = {
  SUCCESS: 0,
  FAIL: -1
} as const;

/**
 * 用户（不含密码，接口返回的安全视图）
 * 表结构 user：id / username / password
 */
export interface UserVO {
  id: number;
  username: string;
}

/** 登录态：由后端 httpOnly Cookie 承载，前端无需存储 token */
export interface LoginResultVO {
  id: number;
  username: string;
}

/**
 * 网址收藏
 * 表结构 link：id / userId / url / description
 */
export interface LinkVO {
  id: number;
  userId: number;
  url: string;
  description: string;
}

/** 新增收藏入参 */
export interface CreateLinkDTO {
  url: string;
  description: string;
}

/** 更新收藏入参（部分字段） */
export interface UpdateLinkDTO {
  url?: string;
  description?: string;
}

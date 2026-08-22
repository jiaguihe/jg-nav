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

/* ==================== 网址收藏 ==================== */

/** 收藏分组 */
export interface LinkGroupVO {
  id: number;
  userId: number;
  name: string;
  sort: number;
}

export interface CreateLinkGroupDTO {
  name: string;
}

export interface UpdateLinkGroupDTO {
  name?: string;
  sort?: number;
}

/**
 * 网址收藏
 * 表结构 link：id / userId / url / description / groupId / sort / pinned / clickCount / lastClickAt
 */
export interface LinkVO {
  id: number;
  userId: number;
  url: string;
  description: string;
  groupId: number | null;
  sort: number;
  pinned: boolean;
  clickCount: number;
  lastClickAt: string | null;
}

export interface CreateLinkDTO {
  url: string;
  description: string;
  groupId?: number | null;
}

export interface UpdateLinkDTO {
  url?: string;
  description?: string;
  groupId?: number | null;
  pinned?: boolean;
}

/** 批量排序：拖拽后一次性提交每条收藏的新序号与分组 */
export interface ReorderLinksDTO {
  items: { id: number; sort: number; groupId?: number | null }[];
}

/* ==================== 外卖记录 ==================== */

/** 点单平台 */
export type TakeawayPlatform = 'meituan' | 'eleme' | 'other';

/** 店铺标签：好吃 / 踩雷 / 想尝试 / 回购（可组合） */
export type ShopTag = 'good' | 'bad' | 'wishlist' | 'reorder';

/** 店铺（列表接口附带点单聚合统计） */
export interface TakeawayShopVO {
  id: number;
  userId: number;
  name: string;
  platform: TakeawayPlatform;
  category: string;
  /** 整体印象分 1-5，由本人维护 */
  score: number;
  tags: ShopTag[];
  remark: string;
  orderCount: number;
  totalAmount: number;
  lastOrderedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShopDTO {
  name: string;
  platform?: TakeawayPlatform;
  category?: string;
  score?: number;
  tags?: ShopTag[];
  remark?: string;
}

export interface UpdateShopDTO {
  name?: string;
  platform?: TakeawayPlatform;
  category?: string;
  score?: number;
  tags?: ShopTag[];
  remark?: string;
}

/** 单次点单记录 */
export interface TakeawayOrderVO {
  id: number;
  userId: number;
  shopId: number;
  /** 点单日期 YYYY-MM-DD */
  orderedAt: string;
  /** 点了什么，如「招牌牛肉面 + 可乐」 */
  items: string;
  /** 实付金额（元） */
  amount: number;
  /** 本次评分 1-5 */
  score: number;
  note: string;
  createdAt: string;
}

export interface CreateOrderDTO {
  shopId: number;
  orderedAt?: string;
  items?: string;
  amount?: number;
  score: number;
  note?: string;
}

export interface UpdateOrderDTO {
  orderedAt?: string;
  items?: string;
  amount?: number;
  score?: number;
  note?: string;
}

/* ==================== 待办清单 ==================== */

export interface TodoVO {
  id: number;
  userId: number;
  content: string;
  done: boolean;
  createdAt: string;
}

export interface CreateTodoDTO {
  content: string;
}

export interface UpdateTodoDTO {
  content?: string;
  done?: boolean;
}

/* ==================== 便签速记 ==================== */

export interface NoteVO {
  id: number;
  userId: number;
  content: string;
  updatedAt: string;
}

export interface CreateNoteDTO {
  content: string;
}

export interface UpdateNoteDTO {
  content: string;
}

/* ==================== 纪念日倒计时 ==================== */

export interface MemorialVO {
  id: number;
  userId: number;
  name: string;
  /** 目标日期 YYYY-MM-DD */
  targetDate: string;
  /** 每年重复（生日/周年类，倒计时自动滚到下一年） */
  repeatYearly: boolean;
  createdAt: string;
}

export interface CreateMemorialDTO {
  name: string;
  targetDate: string;
  repeatYearly?: boolean;
}

export interface UpdateMemorialDTO {
  name?: string;
  targetDate?: string;
  repeatYearly?: boolean;
}

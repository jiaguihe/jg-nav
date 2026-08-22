import type { ShopTag, TakeawayPlatform } from '@jg/api-types';

export const PLATFORM_META: Record<
  TakeawayPlatform,
  { label: string; color: string }
> = {
  meituan: { label: '美团', color: '#ffc300' },
  eleme: { label: '饿了么', color: '#0085ff' },
  other: { label: '其他', color: '#8a919f' }
};

export const SHOP_TAG_META: Record<
  ShopTag,
  { label: string; emoji: string }
> = {
  good: { label: '好吃', emoji: '👍' },
  bad: { label: '踩雷', emoji: '💣' },
  wishlist: { label: '想尝试', emoji: '💭' },
  reorder: { label: '回购', emoji: '⭐' }
};

export const PLATFORM_OPTIONS = (
  Object.entries(PLATFORM_META) as [TakeawayPlatform, { label: string }][]
).map(([value, meta]) => ({ value, label: meta.label }));

export const SHOP_TAG_OPTIONS = (
  Object.entries(SHOP_TAG_META) as [ShopTag, { label: string; emoji: string }][]
).map(([value, meta]) => ({ value, label: `${meta.emoji} ${meta.label}` }));

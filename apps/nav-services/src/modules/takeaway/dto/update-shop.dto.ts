import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMaxSize
} from 'class-validator';

const PLATFORMS = ['meituan', 'eleme', 'other'] as const;
const SHOP_TAGS = ['good', 'bad', 'wishlist', 'reorder'] as const;

export class UpdateShopDto {
  @ApiProperty({ description: '店名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '店名不能超过 50 个字符' })
  name?: string;

  @ApiProperty({ description: '平台', required: false, enum: PLATFORMS })
  @IsOptional()
  @IsIn(PLATFORMS as unknown as string[])
  platform?: string;

  @ApiProperty({ description: '菜系/分类', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: '分类不能超过 30 个字符' })
  category?: string;

  @ApiProperty({ description: '整体印象分 1-5', required: false })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '评分最低 1 星' })
  @Max(5, { message: '评分最高 5 星' })
  score?: number;

  @ApiProperty({ description: '标签', required: false, enum: SHOP_TAGS, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(SHOP_TAGS as unknown as string[], { each: true })
  tags?: string[];

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '备注不能超过 500 个字符' })
  remark?: string;
}

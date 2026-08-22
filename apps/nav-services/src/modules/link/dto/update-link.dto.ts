import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  IsInt,
  IsBoolean
} from 'class-validator';

export class UpdateLinkDto {
  @ApiProperty({ description: '网址', required: false })
  @IsOptional()
  @IsUrl({}, { message: '请输入有效的网址' })
  url?: string;

  @ApiProperty({ description: '名称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: '名称不能超过 30 个字符' })
  description?: string;

  @ApiProperty({ description: '所属分组（null 表示未分组）', required: false })
  @IsOptional()
  @IsInt()
  groupId?: number | null;

  @ApiProperty({ description: '是否置顶', required: false })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

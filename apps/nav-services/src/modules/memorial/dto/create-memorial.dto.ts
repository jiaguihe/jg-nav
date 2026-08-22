import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsOptional,
  IsBoolean
} from 'class-validator';

export class CreateMemorialDto {
  @ApiProperty({ description: '名称', example: '国庆假期' })
  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  @MaxLength(50, { message: '名称不能超过 50 个字符' })
  name: string;

  @ApiProperty({ description: '目标日期', example: '2026-10-01' })
  @IsDateString({}, { message: '请输入有效的日期' })
  targetDate: string;

  @ApiProperty({ description: '每年重复', required: false })
  @IsOptional()
  @IsBoolean()
  repeatYearly?: boolean;
}

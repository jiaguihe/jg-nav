import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  IsBoolean
} from 'class-validator';

export class UpdateMemorialDto {
  @ApiProperty({ description: '名称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '名称不能超过 50 个字符' })
  name?: string;

  @ApiProperty({ description: '目标日期', required: false })
  @IsDateString({}, { message: '请输入有效的日期' })
  targetDate?: string;

  @ApiProperty({ description: '每年重复', required: false })
  @IsOptional()
  @IsBoolean()
  repeatYearly?: boolean;
}

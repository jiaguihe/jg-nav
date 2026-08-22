import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsNumber
} from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ description: '点单日期 YYYY-MM-DD', required: false })
  @IsOptional()
  @IsString()
  orderedAt?: string;

  @ApiProperty({ description: '点了什么', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '菜品不能超过 500 个字符' })
  items?: string;

  @ApiProperty({ description: '实付金额（元）', required: false })
  @IsNumber()
  @Min(0, { message: '金额不能为负' })
  amount?: number;

  @ApiProperty({ description: '本次评分 1-5', required: false })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '评分最低 1 星' })
  @Max(5, { message: '评分最高 5 星' })
  score?: number;

  @ApiProperty({ description: '一句话点评', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '点评不能超过 500 个字符' })
  note?: string;
}

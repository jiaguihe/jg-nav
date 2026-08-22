import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt } from 'class-validator';

export class UpdateLinkGroupDto {
  @ApiProperty({ description: '分组名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '分组名不能超过 20 个字符' })
  name?: string;

  @ApiProperty({ description: '排序号', required: false })
  @IsOptional()
  @IsInt()
  sort?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({ description: '待办内容', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '内容不能超过 200 个字符' })
  content?: string;

  @ApiProperty({ description: '是否完成', required: false })
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ description: '待办内容', example: '晚上取快递' })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  @MaxLength(200, { message: '内容不能超过 200 个字符' })
  content: string;
}

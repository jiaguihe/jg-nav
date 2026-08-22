import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: '便签内容' })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  @MaxLength(5000, { message: '内容不能超过 5000 个字符' })
  content: string;
}

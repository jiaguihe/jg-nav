import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateLinkGroupDto {
  @ApiProperty({ description: '分组名', example: '常用' })
  @IsString()
  @MaxLength(20, { message: '分组名不能超过 20 个字符' })
  name: string;
}

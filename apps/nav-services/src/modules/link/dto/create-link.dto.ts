import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ description: '网址', example: 'https://github.com' })
  @IsUrl({}, { message: '请输入有效的网址' })
  url: string;

  @ApiProperty({ description: '名称', example: 'GitHub' })
  @IsString()
  @MaxLength(30, { message: '名称不能超过 30 个字符' })
  description: string;
}

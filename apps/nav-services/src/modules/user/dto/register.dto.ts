import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'jiagui' })
  @IsString()
  @MinLength(3, { message: '用户名长度不能小于 3 个字符' })
  @MaxLength(10, { message: '用户名长度不能超过 10 个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字或下划线' })
  username: string;

  @ApiProperty({ description: '密码', example: 'abc123' })
  @IsString()
  @MinLength(6, { message: '密码长度不能小于 6 个字符' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: '密码必须包含字母和数字，并且长度至少为 6 位'
  })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'jiagui' })
  @IsString()
  @MinLength(1, { message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'abc123' })
  @IsString()
  @MinLength(1, { message: '密码不能为空' })
  password: string;
}

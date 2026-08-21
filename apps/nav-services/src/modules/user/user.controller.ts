import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

const TOKEN_COOKIE = 'jg_token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 天，秒

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: '注册' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.userService.register(dto.username, dto.password);
    return ResponseDto.success(user, '注册成功');
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '登录（下发 httpOnly Cookie）' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.userService.validate(dto.username, dto.password);
    const token = await this.userService.signToken(user);
    res.cookie(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_MAX_AGE * 1000,
      path: '/'
    });
    return ResponseDto.success(user, '登录成功');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: '获取当前登录用户' })
  async me(@Req() req: Request) {
    return ResponseDto.success(req.user);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: '退出登录（清除 Cookie）' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TOKEN_COOKIE, { path: '/' });
    return ResponseDto.success(null, '已退出登录');
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TranslateService } from './translate.service';
import { TranslateDto } from './dto/translate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('翻译')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  @ApiOperation({ summary: '百度翻译（免费版 QPS=1，后端已串行限速）' })
  async translate(@Body() dto: TranslateDto) {
    const result = await this.translateService.translate(dto);
    return ResponseDto.success(result);
  }
}

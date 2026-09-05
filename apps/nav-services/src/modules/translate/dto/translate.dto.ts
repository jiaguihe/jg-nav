import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

/** 百度翻译常用语言代码（完整表见 https://fanyi-api.baidu.com/doc/21 的语种列表） */
export const TRANSLATE_LANGUAGES = [
  'auto',
  'zh',
  'cht',
  'yue',
  'en',
  'jp',
  'kor',
  'fra',
  'de',
  'es',
  'it',
  'ru',
  'th',
  'ara',
  'pt'
] as const;

export class TranslateDto {
  @ApiProperty({ description: '待翻译文本' })
  @IsString()
  @IsNotEmpty({ message: '翻译内容不能为空' })
  @MaxLength(4000, { message: '翻译内容不能超过 4000 个字符' })
  text: string;

  @ApiProperty({ description: '源语言（百度语言代码），默认 auto', required: false })
  @IsOptional()
  @IsIn(TRANSLATE_LANGUAGES as unknown as string[], { message: '不支持的源语言' })
  from?: string;

  @ApiProperty({ description: '目标语言（百度语言代码），默认 zh', required: false })
  @IsOptional()
  @IsIn(TRANSLATE_LANGUAGES as unknown as string[], { message: '不支持的目标语言' })
  to?: string;
}

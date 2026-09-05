import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import type { TranslateResultVO } from '@jg/api-types';
import { TranslateDto } from './dto/translate.dto';

interface BaiduTransResponse {
  from?: string;
  to?: string;
  trans_result?: { src: string; dst: string }[];
  error_code?: string;
  error_msg?: string;
}

/** 百度错误码 → 用户可读原因（https://fanyi-api.baidu.com/doc/21 附录） */
const BAIDU_ERRORS: Record<string, string> = {
  '52001': '请求超时，请重试',
  '52002': '翻译服务异常，请稍后重试',
  '52003': '翻译账号未授权，请检查 APP ID / 密钥',
  '54000': '翻译请求参数缺失',
  '54001': '翻译签名错误，请检查 APP ID / 密钥',
  '54003': '翻译请求过于频繁，请稍后再试',
  '54004': '翻译账户余额不足',
  '58001': '不支持的语言方向',
  '58002': '翻译服务已停用',
  '90107': '翻译认证已过期'
};

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  /** 百度标准版免费 QPS=1：请求串行化并保持最小间隔，超出时排队等待 */
  private static readonly MIN_INTERVAL_MS = 1100;
  private queue: Promise<void> = Promise.resolve();
  private lastRequestAt = 0;

  constructor(private readonly config: ConfigService) {}

  async translate(dto: TranslateDto): Promise<TranslateResultVO> {
    const appid = this.config.get<string>('BAIDU_TRANSLATE_APP_ID');
    const secret = this.config.get<string>('BAIDU_TRANSLATE_SECRET');
    if (!appid || !secret) {
      throw new BadRequestException(
        '翻译服务未配置（缺少 BAIDU_TRANSLATE_APP_ID / BAIDU_TRANSLATE_SECRET）'
      );
    }

    // 百度限制单次 q ≤ 6000 字节（UTF-8），DTO 已限 4000 字符，中文按 3 字节算仍可能超
    if (Buffer.byteLength(dto.text, 'utf8') > 6000) {
      throw new BadRequestException('翻译内容过长（单次最多 6000 字节，中文约 2000 字）');
    }

    await this.acquireSlot();

    const salt = Date.now().toString();
    // 百度签名规则：MD5(appid + q + salt + 密钥)，小写十六进制
    const sign = createHash('md5')
      .update(appid + dto.text + salt + secret)
      .digest('hex');

    let res: Response;
    try {
      res = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          q: dto.text,
          from: dto.from || 'auto',
          to: dto.to || 'zh',
          appid,
          salt,
          sign
        }).toString(),
        signal: AbortSignal.timeout(8000)
      });
    } catch (error) {
      this.logger.warn(`百度翻译请求失败: ${error}`);
      throw new BadRequestException('翻译服务连接失败，请稍后重试');
    }

    if (!res.ok) {
      throw new BadRequestException(`翻译服务异常（HTTP ${res.status}）`);
    }

    const data = (await res.json()) as BaiduTransResponse;
    if (data.error_code) {
      const reason = BAIDU_ERRORS[data.error_code] ?? data.error_msg ?? '未知错误';
      this.logger.warn(`百度翻译错误 ${data.error_code}: ${reason}`);
      throw new BadRequestException(`翻译失败：${reason}`);
    }

    return {
      from: data.from ?? dto.from ?? 'auto',
      to: data.to ?? dto.to ?? 'zh',
      items: data.trans_result ?? []
    };
  }

  /** 串行 + 最小间隔排队，保证两次百度请求间隔不低于免费版 QPS 限制 */
  private acquireSlot(): Promise<void> {
    const run = async () => {
      const wait = this.lastRequestAt + TranslateService.MIN_INTERVAL_MS - Date.now();
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      this.lastRequestAt = Date.now();
    };
    const next = this.queue.then(run);
    // 单次排队失败不阻断后续请求
    this.queue = next.catch(() => {});
    return next;
  }
}

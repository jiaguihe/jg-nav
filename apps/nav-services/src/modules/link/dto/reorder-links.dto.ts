import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @ApiProperty({ description: '收藏 id' })
  @IsInt()
  id: number;

  @ApiProperty({ description: '新序号' })
  @IsInt()
  sort: number;

  @ApiProperty({ description: '新分组（拖入其它分组时传）', required: false })
  @IsOptional()
  @IsInt()
  groupId?: number | null;
}

export class ReorderLinksDto {
  @ApiProperty({ description: '批量排序项', type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

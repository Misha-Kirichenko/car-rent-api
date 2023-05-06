import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { DatesDto } from 'src/common/dto';

export class CarAvailiableDto extends DatesDto {
  @IsInt()
  @Type(() => Number)
  id!: number;
}

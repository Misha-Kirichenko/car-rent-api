import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DatesDto {
  @ApiProperty()
  @IsDateString()
  dateFrom: Date;

  @ApiProperty()
  @IsDateString()
  dateTo: Date;
}

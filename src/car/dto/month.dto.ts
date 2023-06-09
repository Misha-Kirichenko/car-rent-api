import { Matches } from 'class-validator';

export class MonthDto {
  @Matches('^([0-9]{4})-((0[1-9])|(1[0-2]))$')
  month: string;
}

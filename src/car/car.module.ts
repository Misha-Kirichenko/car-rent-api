import { Module } from '@nestjs/common';
import { QueryBuilder } from 'src/common/classes/queryBuilder';
import { CarController } from './car.controller';
import { CarService } from './car.service';

@Module({
  controllers: [CarController],
  providers: [CarService, QueryBuilder],
})
export class CarModule {}

import { Module } from '@nestjs/common';
import { QueryBuilder } from 'src/common/classes/queryBuilder';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';

@Module({
  controllers: [RentController],
  providers: [RentService, QueryBuilder],
})
export class RentModule {}

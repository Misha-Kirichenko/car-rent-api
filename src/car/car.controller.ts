import {
  ApiTags,
  ApiOkResponse,
  ApiQuery,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Controller, Param, Get, Query, HttpStatus } from '@nestjs/common';
import { CarService } from './car.service';
import { IdDto, MonthDto } from './dto';
import { CarMonthlyReport } from './types-and-interfaces';

@Controller('cars')
export class CarController {
  constructor(private carService: CarService) {}

  @ApiOkResponse({
    description: `Returns usage statistics for cars by month. 
    If id's not passed returns stats for all cars by passed month`,
    schema: {
      type: 'object',
      example: [
        {
          carId: 5,
          daysInMonth: 28,
          LP: 'QL77JTH',
          percentInMonth: 94,
        },
        {
          carId: 2,
          daysInMonth: 19,
          LP: 'MB43USX',
          percentInMonth: 62,
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @ApiNotFoundResponse({
    schema: {
      type: 'object',
      example: {
        msg: 'car was not found',
      },
    },
    description: 'Not found',
  })
  @ApiQuery({
    name: 'id',
    description: 'car id',
    type: Number,
    required: false,
    example: 2,
  })
  @ApiParam({
    name: 'month',
    description: 'Month in format: YYYY-MM',
    example: `${new Date().getFullYear()}-01`,
  })
  @ApiTags('Get car(s) usage report by month')
  @Get('/stats/:month')
  getCarStats(
    @Param() monthDto: MonthDto,
    @Query() idDto: IdDto,
  ): Promise<CarMonthlyReport | CarMonthlyReport[]> {
    return this.carService.checkAvgCarEmployment({
      month: monthDto.month,
      id: idDto.id,
    });
  }
}

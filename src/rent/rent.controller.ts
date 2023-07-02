import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Param,
  Get,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { DatesDto, IdDto } from 'src/common/dto';
import { RentService } from './rent.service';
import { CarAvailable, CarInfo } from './interfaces';
import { CarCost } from './types';
import { CarAvailiableDto } from './dto';

@ApiTags('Rental')
@Controller('rent')
export class RentController {
  constructor(private rentService: RentService) {}

  @ApiParam({
    name: 'dateFrom',
    description: 'Month in format: YYYY-MM-DD',
    example: `${new Date().getFullYear()}-01-25`,
  })
  @ApiParam({
    name: 'dateTo',
    description: 'date in format: YYYY-MM-DD',
    example: `${new Date().getFullYear()}-01-30`,
  })
  @ApiOkResponse({
    description: `Returns list of cars avaliable in passed interval`,
    schema: {
      type: 'array',
      example: [
        {
          id: 4,
          name: 'Volkswagen Jetta',
          LP: 'NW85RSP',
        },
        {
          id: 5,
          name: 'Lamborghini Diablo',
          LP: 'QL77JTH',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or message about invalid date range',
  })
  @Get('/available-cars/:dateFrom/:dateTo')
  getAvailableCars(@Param() datesDto: DatesDto): Promise<CarInfo[]> {
    return this.rentService.getAvailableCarsList({
      dateFrom: datesDto.dateFrom,
      dateTo: datesDto.dateTo,
    });
  }

  @ApiParam({
    name: 'id',
    description: 'car id',
    example: 5,
  })
  @ApiParam({
    name: 'dateFrom',
    description: 'Month in format: YYYY-MM-DD',
    example: `${new Date().getFullYear()}-01-25`,
  })
  @ApiParam({
    name: 'dateTo',
    description: 'date in format: YYYY-MM-DD',
    example: `${new Date().getFullYear()}-01-30`,
  })
  @ApiOkResponse({
    description: `Returns answer if car is avaliable in passed interval`,
    schema: {
      type: 'object',
      example: {
        carId: 4,
        available: true,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or message about invalid date range',
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
  @Get('/car-available/:id/:dateFrom/:dateTo')
  checkCarAvailable(
    @Param() datesDto: DatesDto,
    @Param() idDto: IdDto,
  ): Promise<CarAvailable> {
    return this.rentService.checkCarAvailability({
      id: idDto.id,
      dateFrom: datesDto.dateFrom,
      dateTo: datesDto.dateTo,
    });
  }

  @Get('/car-price/:id/:dateFrom/:dateTo/')
  @ApiParam({
    name: 'id',
    description: 'car id',
    example: 5,
  })
  @ApiParam({
    name: 'dateFrom',
    description: 'Month in format: YYYY-MM-DD',
    example: `${new Date().getFullYear()}-01-25`,
  })
  @ApiParam({
    name: 'dateTo',
    description: 'date in format: YYYY-MM-DD',
    example: `${new Date().getFullYear()}-01-30`,
  })
  @ApiOkResponse({
    description: `Returns an answer to how much it will cost to rent a car for this period`,
    schema: {
      type: 'object',
      example: {
        carId: 5,
        daysOfRental: 5,
        cost: 495,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or message about invalid date range',
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
  getPreCheckoutInfo(@Param() dto: CarAvailiableDto): Promise<CarCost> {
    return this.rentService.getRentalPrice(dto);
  }

  @Post('/checkout/:id')
  @ApiParam({
    name: 'id',
    description: 'car id',
    example: 5,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dateFrom: { type: 'string', format: 'date', example: '2023-05-13' },
        dateTo: { type: 'string', format: 'date', example: '2023-05-21' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: `Returns a rental total price`,
    schema: {
      type: 'object',
      example: {
        totalPrice: 780,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: `Returns error message about invalid date range, invalid param or car's unavailability`,
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
  checkout(
    @Param('id', ParseIntPipe) id: number,
    @Body() bodyDto: DatesDto,
  ): Promise<{ totalPrice: number }> {
    return this.rentService.checkout({
      id,
      dateFrom: bodyDto.dateFrom,
      dateTo: bodyDto.dateTo,
    });
  }
}

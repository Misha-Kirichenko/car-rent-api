import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  formatDate,
  getDayDiff,
  isWeekEndDay,
  countRentalPrice,
} from 'src/common/helpers';
import { QueryBuilder } from 'src/common/classes/queryBuilder';
import { CarAvailable, CarCost, CarInfo } from './types-and-interfaces';

@Injectable()
export class RentService {
  constructor(private queryBuilder: QueryBuilder) {}

  private buildCarsEmploymentQuery(dateFrom: Date, dateTo: Date) {
    const dateFromWithDelay: Date = new Date(dateFrom);
    const dateFromDiff = dateFromWithDelay.getDate() - 3;
    dateFromWithDelay.setDate(dateFromDiff);

    const dateToWithDelay: Date = new Date(dateTo);
    const dateToDiff = dateToWithDelay.getDate() + 3;
    dateToWithDelay.setDate(dateToDiff);

    const query = `SELECT "rent_list"."carId" FROM rent_list 
    WHERE
    (
      "rent_list"."dateFrom" BETWEEN '${formatDate(
        dateFromWithDelay,
      )}' AND '${formatDate(dateToWithDelay)}'
      OR
      "rent_list"."dateTo" BETWEEN '${formatDate(
        dateFromWithDelay,
      )}' AND '${formatDate(dateToWithDelay)}'
    )`;

    return query;
  }

  async getAvailableCarsList(dto: {
    dateFrom: Date;
    dateTo: Date;
  }): Promise<CarInfo[]> {
    const { dateFrom, dateTo } = dto;
    const totalDays: number = getDayDiff(dateTo, dateFrom);

    if (totalDays > 30) {
      throw new BadRequestException({
        msg: `car can't be rented for more than 30 days`,
      });
    }

    if (isWeekEndDay(dateFrom) || isWeekEndDay(dateTo)) {
      throw new BadRequestException({
        msg: `car rental can't start or end on weekend day`,
      });
    }

    const employedCarsQuery = this.buildCarsEmploymentQuery(dateFrom, dateTo);

    const availableCarsQuery = `SELECT * FROM car WHERE id NOT IN (${employedCarsQuery})`;

    const avaliableCars: CarInfo[] = await this.queryBuilder.runQuery(
      availableCarsQuery,
    );

    return avaliableCars;
  }

  async checkCarAvailability(dto: {
    id: number;
    dateFrom: Date;
    dateTo: Date;
  }): Promise<CarAvailable> {
    const { id, dateFrom, dateTo } = dto;

    const [carExists] = await this.queryBuilder.runQuery(
      `SELECT id FROM car WHERE "car"."id"='${id}' LIMIT 1`,
    );

    if (!carExists)
      throw new NotFoundException({
        msg: `car was not found`,
      });

    let employedCarQuery = this.buildCarsEmploymentQuery(dateFrom, dateTo);
    employedCarQuery += ` AND "rent_list"."carId"='${id}' LIMIT 1`;

    const [employedCar] = await this.queryBuilder.runQuery(employedCarQuery);

    return { carId: id, available: !employedCar };
  }

  async getRentalPrice(dto: {
    id: number;
    dateFrom: Date;
    dateTo: Date;
  }): Promise<CarCost> {
    const { id, dateFrom, dateTo } = dto;
    const query = `SELECT id FROM car WHERE "car"."id"='${id}' LIMIT 1`;
    const foundCar: [{ id: number }] = await this.queryBuilder.runQuery(query);

    if (!foundCar.length) {
      throw new NotFoundException({ msg: 'car was not found' });
    }

    const daysOfRental: number = getDayDiff(dateTo, dateFrom);

    if (daysOfRental < 0) {
      throw new BadRequestException({
        msg: `Invalid dates range`,
      });
    }

    const cost: number = countRentalPrice(daysOfRental);

    return {
      carId: id,
      daysOfRental,
      cost,
    };
  }

  async checkout(dto: {
    id: number;
    dateFrom: Date;
    dateTo: Date;
  }): Promise<{ totalPrice: number }> {
    const { id, dateFrom, dateTo } = dto;
    const carInfo = await this.checkCarAvailability(dto);

    if (!carInfo.available) {
      throw new BadRequestException(carInfo);
    }

    const totalDays = getDayDiff(dateTo, dateFrom);
    const totalPrice = countRentalPrice(totalDays);

    const query = `INSERT INTO rent_list ("carId", "dateFrom", "dateTo", "totalPrice") VALUES ('${id}', '${dateFrom}', '${dateTo}', ${totalPrice})`;
    const newRental = await this.queryBuilder.runQuery(query);
    return newRental && { totalPrice };
  }
}

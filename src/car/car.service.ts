import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBuilder } from '@classes/queryBuilder';
import { formatDate, getDayDiff } from '@helpers';
import { ConfigService } from '@nestjs/config';
import { CarReport, CarMonthlyReport } from './types';
import { CarEmploymentInfo } from './interfaces';
import { CarEmploymentCheck } from './interfaces/carEmploymentСheck.interface';

@Injectable()
export class CarService {
  constructor(
    private queryBuilder: QueryBuilder,
    private config: ConfigService,
  ) {}

  private getCarWithDaysInMonth(
    cars: CarEmploymentInfo[],
    daysInMonth: number,
    monthStart: Date,
    monthEnd: Date,
  ): Array<CarReport & { rentalId: number }> {
    const carsWithdaysInMonth = cars.map((car: CarEmploymentInfo) => {
      let dateDiff: number;
      const dateTo: Date = new Date(car.dateTo);
      const dateFrom: Date = new Date(car.dateFrom);
      if (dateTo.getMonth() != dateFrom.getMonth()) {
        if (dateTo >= monthStart && dateTo < monthEnd) {
          dateDiff = dateTo.getDate() - monthStart.getDate();
        } else dateDiff = daysInMonth - dateFrom.getDate();
      } else {
        dateDiff = getDayDiff(dateTo, dateFrom);
      }
      return {
        rentalId: car.rentalId,
        carId: car.carId,
        daysInMonth: dateDiff,
        LP: car.LP,
      };
    });
    return carsWithdaysInMonth;
  }

  private getRentedCarsGrouped(cars: CarReport[]) {
    const grouped = new Object();
    cars.forEach((car: CarReport) => {
      if (!grouped[car.carId]) {
        grouped[car.carId] = car;
      } else {
        grouped[car.carId].daysInMonth += car.daysInMonth;
      }
    });
    return Object.values(grouped);
  }

  private async getCarsByEmployment(carEmployment: CarEmploymentCheck) {
    let query: string;
    const { id, type, monthStart, monthEnd } = carEmployment;

    if (type === 'employed') {
      query = `SELECT "rent_list"."carId", rent_list.id AS "rentalId", "car"."LP", 
    "rent_list"."dateFrom" AT TIME ZONE 'GMT' AT TIME ZONE '${this.config.get(
      'TZ',
    )}' AS "dateFrom", 
    "rent_list"."dateTo" AT TIME ZONE 'GMT' AT TIME ZONE '${this.config.get(
      'TZ',
    )}' AS "dateTo" FROM rent_list 
   RIGHT JOIN car ON "car"."id" = "rent_list"."carId"
    WHERE ("rent_list"."dateFrom" <'${monthEnd}' AND "rent_list"."dateTo" >='${monthStart}') 
   ${id ? `AND "rent_list"."carId" = ${id}` : ''}`;
    } else if (type === 'unemployed') {
      query = `SELECT "car"."id" AS "carId", 
      0 AS "daysInMonth", "car"."LP", 
      0 AS "percentInMonth" FROM car 
      WHERE "car"."id" NOT IN (SELECT "rent_list"."carId" FROM rent_list 
      WHERE "rent_list"."dateFrom" <'${monthEnd}' 
      AND "rent_list"."dateTo" >= '${monthStart}')`;
    }

    const cars = await this.queryBuilder.runQuery(query);
    return cars;
  }

  async checkAvgCarEmployment(dto: {
    id: number;
    month: string;
  }): Promise<CarMonthlyReport | CarMonthlyReport[]> {
    const { id, month } = dto;
    const [year, monthNum] = month.split('-');

    //get month's first and last day
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(
      Number(monthNum) === 12
        ? `${Number(year) + 1}-01-01`
        : `${year}-${Number(monthNum) + 1}-01`,
    );

    //get correct dates
    const monthStart: string = formatDate(startDate);
    const monthEnd: string = formatDate(endDate);
    const monthStartObj: Date = new Date(startDate);
    const monthEndObj: Date = new Date(endDate);
    const daysInMonth: number = getDayDiff(monthEndObj, monthStartObj);

    const employedCars: CarEmploymentInfo[] = await this.getCarsByEmployment({
      type: 'employed',
      monthStart,
      monthEnd,
      ...(id && { id }),
    });

    const unemployedCars: CarMonthlyReport[] = await this.getCarsByEmployment({
      type: 'unemployed',
      monthStart,
      monthEnd,
    });

    const carsWithdaysInMonth: CarReport[] = this.getCarWithDaysInMonth(
      employedCars,
      daysInMonth,
      monthStartObj,
      monthEndObj,
    );

    const rentedCarsGrouped = this.getRentedCarsGrouped(carsWithdaysInMonth);
    const rntCarsWithUsgPrct = rentedCarsGrouped
      .map((car: CarMonthlyReport) => ({
        carId: car.carId,
        daysInMonth: car.daysInMonth,
        LP: car.LP,
        percentInMonth: Math.round((car.daysInMonth / daysInMonth) * 100),
      }))
      .sort((a, b) => b.percentInMonth - a.percentInMonth);

    const finalReport = id
      ? rntCarsWithUsgPrct.find(
          (car: CarMonthlyReport) => car.carId === Number(id),
        ) ||
        unemployedCars.find((car: CarMonthlyReport) => car.carId === Number(id))
      : rntCarsWithUsgPrct.concat(unemployedCars);

    if (!Array.isArray(finalReport) && !Object.keys(finalReport).length)
      throw new NotFoundException({
        msg: `car was not found`,
      });

    return finalReport;
  }
}

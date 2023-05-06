import { BadRequestException } from '@nestjs/common';

export const formatDate = (date: Date): string => {
  const datePart = date.getDate().toString().padStart(2, '0');
  const monthPart = (Number(date.getMonth()) + 1).toString().padStart(2, '0');
  const yearPart = date.getFullYear();
  return `${yearPart}-${monthPart}-${datePart}`;
};

export const getDayDiff = (
  dateTo: string | Date,
  dateFrom: string | Date,
): number => {
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
  let dayDiff: number;
  if (dateTo instanceof Date && dateFrom instanceof Date) {
    dayDiff = (dateTo.valueOf() - dateFrom.valueOf()) / ONE_DAY_IN_MS;
  } else {
    dayDiff =
      (new Date(dateTo).valueOf() - new Date(dateFrom).valueOf()) /
      ONE_DAY_IN_MS;
  }

  if (dayDiff <= 0) {
    throw new BadRequestException({
      msg: `Invalid dates range`,
    });
  }

  return dayDiff;
};

export const isWeekEndDay = (dateString: Date): boolean => {
  const date = new Date(dateString);
  return date.getDay() === 0 || date.getDay() === 6;
};

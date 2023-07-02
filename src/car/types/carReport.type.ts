import { CarEmploymentInfo } from '../interfaces/carEmploymentInfo.interface';

export type CarReport = Pick<CarEmploymentInfo, 'carId' | 'LP'> & {
  daysInMonth: number;
};

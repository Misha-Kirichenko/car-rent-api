import { CarEmploymentInfo } from "./carEmploymentInfo.interface";

export type CarReport = Pick<CarEmploymentInfo, 'carId' | 'LP'> & {
  daysInMonth: number;
};
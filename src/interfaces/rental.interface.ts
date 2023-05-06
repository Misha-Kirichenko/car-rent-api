export interface Rental {
  readonly carId: number;
  readonly dateFrom: Date;
  readonly dateTo: Date;
  readonly totalPrice: number;
}
const basicPrice = 100;
const basicSale = 0.05;

export const countRentalPrice = (days: number): number => {
  let sum = 0;
  if (days === 1) return basicPrice;

  for (let i = 1; i <= days; i++) {
    if (i >= 1 && i <= 4) {
      sum += basicPrice;
    } else if (i >= 5 && i <= 9) {
      sum += basicPrice - basicPrice * basicSale;
    } else if (i >= 10 && i <= 17) {
      sum += basicPrice - basicPrice * basicSale * 2;
    } else if (i >= 18 && i <= 29) {
      sum += basicPrice - basicPrice * basicSale * 3;
    }
  }

  return sum;
};

export const latestPrice: Record<string, number> = {};

export function setPrice(symbol: string, price: number) {
  latestPrice[symbol] = price;
}

export function getPrice(symbol: string) {
  return latestPrice[symbol];
}

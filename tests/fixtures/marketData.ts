import { MarketData } from '../../src/types/MarketData';

/**
 * Mock daily data - 100 trading days (2024-01-02 to 2024-05-15)
 * Simulates realistic market movements with all fields
 */
export const mockDailyData: MarketData[] = (() => {
  const data: MarketData[] = [];
  const startDate = new Date('2024-01-02T09:30:00.000Z');
  const msPerDay = 24 * 60 * 60 * 1000;

  let basePrice = 100;
  const tradableShares = 10_000_000; // 10M shares

  for (let i = 0; i < 100; i++) {
    // Skip weekends
    const currentDate = new Date(startDate.getTime() + i * msPerDay);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Random price movement (-3% to +3%)
    const changePercent = (Math.random() - 0.5) * 0.06;
    const open = basePrice;
    const close = basePrice * (1 + changePercent);

    // High and low based on volatility
    const volatility = Math.random() * 0.02;
    const high = Math.max(open, close) * (1 + volatility);
    const low = Math.min(open, close) * (1 - volatility);

    // Volume varies between 0.8M to 2.5M
    const volume = Math.floor(800_000 + Math.random() * 1_700_000);

    // Amount = volume * average price
    const avgPrice = (high + low + open + close) / 4;
    const amount = Math.floor(volume * avgPrice);

    // Advance/decline for index (40-60 range)
    const advance = Math.floor(40 + Math.random() * 20);
    const decline = 100 - advance;

    data.push({
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      timestamp: currentDate.getTime(),
      amount,
      tradableShares,
      advance,
      decline,
    });

    basePrice = close; // Update base price for next day
  }

  return data;
})();

/**
 * Mock 5-minute data - 1 trading day (48 bars from 09:30 to 15:00)
 * Excludes lunch break (11:30-13:00)
 */
export const mock5MinData: MarketData[] = (() => {
  const data: MarketData[] = [];
  const startDate = new Date('2024-01-02T09:30:00.000Z');
  const msPerMin = 60 * 1000;
  const interval = 5; // 5 minutes

  let basePrice = 100;
  const tradableShares = 10_000_000;

  // Morning session: 09:30 - 11:30 (24 bars)
  for (let i = 0; i < 24; i++) {
    const currentDate = new Date(startDate.getTime() + i * interval * msPerMin);

    const changePercent = (Math.random() - 0.5) * 0.005;
    const open = basePrice;
    const close = basePrice * (1 + changePercent);

    const volatility = Math.random() * 0.002;
    const high = Math.max(open, close) * (1 + volatility);
    const low = Math.min(open, close) * (1 - volatility);

    const volume = Math.floor(20_000 + Math.random() * 30_000);
    const avgPrice = (high + low + open + close) / 4;
    const amount = Math.floor(volume * avgPrice);

    data.push({
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      timestamp: currentDate.getTime(),
      amount,
      tradableShares,
    });

    basePrice = close;
  }

  // Afternoon session: 13:00 - 15:00 (24 bars)
  const afternoonStart = new Date('2024-01-02T13:00:00.000Z');
  for (let i = 0; i < 24; i++) {
    const currentDate = new Date(afternoonStart.getTime() + i * interval * msPerMin);

    const changePercent = (Math.random() - 0.5) * 0.005;
    const open = basePrice;
    const close = basePrice * (1 + changePercent);

    const volatility = Math.random() * 0.002;
    const high = Math.max(open, close) * (1 + volatility);
    const low = Math.min(open, close) * (1 - volatility);

    const volume = Math.floor(20_000 + Math.random() * 30_000);
    const avgPrice = (high + low + open + close) / 4;
    const amount = Math.floor(volume * avgPrice);

    data.push({
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      timestamp: currentDate.getTime(),
      amount,
      tradableShares,
    });

    basePrice = close;
  }

  return data;
})();

/**
 * Mock 1-minute data - 1 hour (60 bars from 09:30 to 10:30)
 */
export const mock1MinData: MarketData[] = (() => {
  const data: MarketData[] = [];
  const startDate = new Date('2024-01-02T09:30:00.000Z');
  const msPerMin = 60 * 1000;

  let basePrice = 100;
  const tradableShares = 10_000_000;

  for (let i = 0; i < 60; i++) {
    const currentDate = new Date(startDate.getTime() + i * msPerMin);

    const changePercent = (Math.random() - 0.5) * 0.002;
    const open = basePrice;
    const close = basePrice * (1 + changePercent);

    const volatility = Math.random() * 0.001;
    const high = Math.max(open, close) * (1 + volatility);
    const low = Math.min(open, close) * (1 - volatility);

    const volume = Math.floor(5_000 + Math.random() * 10_000);
    const avgPrice = (high + low + open + close) / 4;
    const amount = Math.floor(volume * avgPrice);

    data.push({
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      timestamp: currentDate.getTime(),
      amount,
      tradableShares,
    });

    basePrice = close;
  }

  return data;
})();

/**
 * Simple mock data for basic testing - 10 records
 */
export const mockSimpleData: MarketData[] = [
  {
    open: 100,
    close: 102,
    high: 105,
    low: 99,
    volume: 1000000,
    timestamp: new Date('2024-01-02T09:30:00.000Z').getTime(),
    amount: 102000000,
    tradableShares: 10000000,
  },
  {
    open: 102,
    close: 101,
    high: 103,
    low: 100,
    volume: 1100000,
    timestamp: new Date('2024-01-03T09:30:00.000Z').getTime(),
    amount: 111100000,
    tradableShares: 10000000,
  },
  {
    open: 101,
    close: 103,
    high: 106,
    low: 101,
    volume: 1200000,
    timestamp: new Date('2024-01-04T09:30:00.000Z').getTime(),
    amount: 123600000,
    tradableShares: 10000000,
  },
  {
    open: 103,
    close: 105,
    high: 107,
    low: 102,
    volume: 1300000,
    timestamp: new Date('2024-01-05T09:30:00.000Z').getTime(),
    amount: 136500000,
    tradableShares: 10000000,
  },
  {
    open: 105,
    close: 104,
    high: 106,
    low: 103,
    volume: 1400000,
    timestamp: new Date('2024-01-08T09:30:00.000Z').getTime(),
    amount: 145600000,
    tradableShares: 10000000,
  },
  {
    open: 104,
    close: 106,
    high: 108,
    low: 104,
    volume: 1500000,
    timestamp: new Date('2024-01-09T09:30:00.000Z').getTime(),
    amount: 159000000,
    tradableShares: 10000000,
  },
  {
    open: 106,
    close: 108,
    high: 110,
    low: 105,
    volume: 1600000,
    timestamp: new Date('2024-01-10T09:30:00.000Z').getTime(),
    amount: 172800000,
    tradableShares: 10000000,
  },
  {
    open: 108,
    close: 107,
    high: 109,
    low: 106,
    volume: 1700000,
    timestamp: new Date('2024-01-11T09:30:00.000Z').getTime(),
    amount: 181900000,
    tradableShares: 10000000,
  },
  {
    open: 107,
    close: 109,
    high: 111,
    low: 107,
    volume: 1800000,
    timestamp: new Date('2024-01-12T09:30:00.000Z').getTime(),
    amount: 196200000,
    tradableShares: 10000000,
  },
  {
    open: 109,
    close: 110,
    high: 112,
    low: 108,
    volume: 1900000,
    timestamp: new Date('2024-01-15T09:30:00.000Z').getTime(),
    amount: 209000000,
    tradableShares: 10000000,
  },
];

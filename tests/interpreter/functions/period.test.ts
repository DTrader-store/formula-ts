import { PERIOD, BARSCOUNT, ISLASTBAR, BARSSINCE } from '../../../src/interpreter/functions/period';

describe('Period Functions', () => {
  describe('PERIOD - Detect period type', () => {
    it('should detect 1-minute period', () => {
      // Create timestamps with 1-minute intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(1); // Period code for 1-minute
      expect(result.every((v) => v === 1)).toBe(true);
    });

    it('should detect 5-minute period', () => {
      // Create timestamps with 5-minute intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 5 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(5); // Period code for 5-minute
      expect(result.every((v) => v === 5)).toBe(true);
    });

    it('should detect 15-minute period', () => {
      // Create timestamps with 15-minute intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 15 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(15); // Period code for 15-minute
      expect(result.every((v) => v === 15)).toBe(true);
    });

    it('should detect 30-minute period', () => {
      // Create timestamps with 30-minute intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 30 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(30); // Period code for 30-minute
      expect(result.every((v) => v === 30)).toBe(true);
    });

    it('should detect 60-minute (1-hour) period', () => {
      // Create timestamps with 60-minute intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 60 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(60); // Period code for 60-minute
      expect(result.every((v) => v === 60)).toBe(true);
    });

    it('should detect daily period', () => {
      // Create timestamps with 1-day intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 24 * 60 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(101); // Period code for daily
      expect(result.every((v) => v === 101)).toBe(true);
    });

    it('should detect weekly period', () => {
      // Create timestamps with 7-day intervals
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 7 * 24 * 60 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(102); // Period code for weekly
      expect(result.every((v) => v === 102)).toBe(true);
    });

    it('should detect monthly period', () => {
      // Create timestamps with 30-day intervals (approximate monthly)
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 30 * 24 * 60 * 60 * 1000);

      const result = PERIOD(timestamps);

      expect(result.length).toBe(10);
      expect(result[0]).toBe(103); // Period code for monthly
      expect(result.every((v) => v === 103)).toBe(true);
    });

    it('should use median for robustness (ignore outliers)', () => {
      // Create mostly 5-minute data with one outlier
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = [
        baseTime,
        baseTime + 5 * 60 * 1000,
        baseTime + 10 * 60 * 1000,
        baseTime + 15 * 60 * 1000,
        baseTime + 20 * 60 * 1000,
        baseTime + 25 * 60 * 1000,
        baseTime + 30 * 60 * 1000,
        baseTime + 35 * 60 * 1000,
        baseTime + 40 * 60 * 1000,
        baseTime + 100 * 60 * 1000, // Outlier (60-minute gap)
      ];

      const result = PERIOD(timestamps);

      // Should still detect as 5-minute due to median calculation
      expect(result[0]).toBe(5);
    });

    it('should default to daily (101) for single timestamp', () => {
      const timestamps = [new Date('2024-01-15 09:30:00').getTime()];

      const result = PERIOD(timestamps);

      expect(result).toEqual([101]);
    });

    it('should handle empty array', () => {
      const result = PERIOD([]);
      expect(result).toEqual([]);
    });
  });

  describe('BARSCOUNT - Total bar count', () => {
    it('should return total count for all bars', () => {
      const result = BARSCOUNT(10);

      expect(result).toEqual([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
    });

    it('should work with single bar', () => {
      const result = BARSCOUNT(1);

      expect(result).toEqual([1]);
    });

    it('should work with large datasets', () => {
      const result = BARSCOUNT(1000);

      expect(result.length).toBe(1000);
      expect(result[0]).toBe(1000);
      expect(result[999]).toBe(1000);
      expect(result.every((v) => v === 1000)).toBe(true);
    });

    it('should work with zero bars', () => {
      const result = BARSCOUNT(0);

      expect(result).toEqual([]);
    });

    it('should have same value for all elements', () => {
      const result = BARSCOUNT(50);

      const uniqueValues = new Set(result);
      expect(uniqueValues.size).toBe(1);
      expect(uniqueValues.has(50)).toBe(true);
    });
  });

  describe('ISLASTBAR - Check if last bar', () => {
    it('should return 1 only for the last bar', () => {
      const result = ISLASTBAR(5);

      expect(result).toEqual([0, 0, 0, 0, 1]);
    });

    it('should work with single bar', () => {
      const result = ISLASTBAR(1);

      expect(result).toEqual([1]);
    });

    it('should work with large datasets', () => {
      const result = ISLASTBAR(100);

      expect(result.length).toBe(100);
      expect(result[98]).toBe(0);
      expect(result[99]).toBe(1);
      expect(result.filter((v) => v === 1).length).toBe(1);
      expect(result.filter((v) => v === 0).length).toBe(99);
    });

    it('should have exactly one 1 value', () => {
      const result = ISLASTBAR(50);

      const onesCount = result.filter((v) => v === 1).length;
      expect(onesCount).toBe(1);
    });

    it('should have 1 at the end', () => {
      const sizes = [1, 5, 10, 50, 100];

      for (const size of sizes) {
        const result = ISLASTBAR(size);
        expect(result[size - 1]).toBe(1);
      }
    });
  });

  describe('BARSSINCE - Bars since first condition match', () => {
    it('should count from first true condition', () => {
      const condition = [0, 0, 1, 0, 0, 0];
      const result = BARSSINCE(condition);

      expect(result).toEqual([NaN, NaN, 0, 1, 2, 3]);
    });

    it('should return all zeros if condition never true', () => {
      const condition = [0, 0, 0, 0, 0];
      const result = BARSSINCE(condition);

      expect(result.every((value) => Number.isNaN(value))).toBe(true);
    });

    it('should count from first occurrence even if multiple matches', () => {
      const condition = [0, 0, 1, 0, 1, 0, 0];
      const result = BARSSINCE(condition);

      // Counts from first true at index 2
      expect(result).toEqual([NaN, NaN, 0, 1, 2, 3, 4]);
    });

    it('should start counting immediately if first bar is true', () => {
      const condition = [1, 0, 0, 0];
      const result = BARSSINCE(condition);

      expect(result).toEqual([0, 1, 2, 3]);
    });

    it('should handle all true conditions', () => {
      const condition = [1, 1, 1, 1, 1];
      const result = BARSSINCE(condition);

      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it('should treat non-zero as true', () => {
      const condition = [0, 0, 5, 0, -3, 0];
      const result = BARSSINCE(condition);

      // First non-zero is at index 2
      expect(result).toEqual([NaN, NaN, 0, 1, 2, 3]);
    });

    it('should work with single element', () => {
      expect(BARSSINCE([1])).toEqual([0]);
      expect(Number.isNaN(BARSSINCE([0])[0])).toBe(true);
    });

    it('should work with empty array', () => {
      const result = BARSSINCE([]);
      expect(result).toEqual([]);
    });

    it('should handle realistic trading scenario', () => {
      // Condition: price crossed above MA
      // First cross at bar 5
      const condition = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
      const result = BARSSINCE(condition);

      expect(result).toEqual([NaN, NaN, NaN, NaN, NaN, 0, 1, 2, 3, 4]);
    });
  });

  describe('Integration - Period functions working together', () => {
    it('should work correctly with typical trading data', () => {
      // Simulate 10 daily bars
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 10 }, (_, i) => baseTime + i * 24 * 60 * 60 * 1000);

      const period = PERIOD(timestamps);
      const barscount = BARSCOUNT(10);
      const islastbar = ISLASTBAR(10);

      expect(period[0]).toBe(101); // Daily
      expect(barscount[0]).toBe(10);
      expect(islastbar[9]).toBe(1);
      expect(islastbar[8]).toBe(0);
    });

    it('should handle intraday data', () => {
      // Simulate 48 5-minute bars (4 hours of trading)
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = Array.from({ length: 48 }, (_, i) => baseTime + i * 5 * 60 * 1000);

      const period = PERIOD(timestamps);
      const barscount = BARSCOUNT(48);
      const islastbar = ISLASTBAR(48);

      expect(period[0]).toBe(5); // 5-minute
      expect(barscount[0]).toBe(48);
      expect(islastbar[47]).toBe(1);
      expect(islastbar.filter((v) => v === 1).length).toBe(1);
    });

    it('should work with BARSSINCE for signal detection', () => {
      const dataLength = 20;

      // Simulate a buy signal at bar 10
      const buySignal = new Array(dataLength).fill(0);
      buySignal[10] = 1;

      const barsSinceBuy = BARSSINCE(buySignal);
      const islastbar = ISLASTBAR(dataLength);
      const barscount = BARSCOUNT(dataLength);

      // At the last bar, should show 9 bars since buy signal
      expect(barsSinceBuy[19]).toBe(9);
      expect(islastbar[19]).toBe(1);
      expect(barscount[19]).toBe(20);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle period detection with exactly 2 timestamps', () => {
      const baseTime = new Date('2024-01-15 09:30:00').getTime();
      const timestamps = [baseTime, baseTime + 5 * 60 * 1000];

      const result = PERIOD(timestamps);

      expect(result.length).toBe(2);
      expect(result[0]).toBe(5);
    });

    it('should handle BARSSINCE with condition at last bar', () => {
      const condition = [0, 0, 0, 0, 1];
      const result = BARSSINCE(condition);

      expect(result).toEqual([NaN, NaN, NaN, NaN, 0]);
    });

    it('should handle all functions with maximum practical data size', () => {
      const largeSize = 10000;

      const barscount = BARSCOUNT(largeSize);
      const islastbar = ISLASTBAR(largeSize);
      const condition = new Array(largeSize).fill(0);
      condition[5000] = 1; // Midpoint
      const barssince = BARSSINCE(condition);

      expect(barscount.length).toBe(largeSize);
      expect(islastbar.length).toBe(largeSize);
      expect(barssince.length).toBe(largeSize);
      expect(barssince[9999]).toBe(4999);
    });
  });
});

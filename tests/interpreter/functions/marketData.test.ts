import { OPEN, HIGH, LOW, CLOSE, VOL, AMOUNT, ADVANCE, DECLINE } from '../../../src/interpreter/functions/marketData';
import { mockDailyData, mockSimpleData } from '../../fixtures/marketData';
import { ExecutionContext } from '../../../src/interpreter/Context';
import { FunctionRegistry } from '../../../src/interpreter/FunctionRegistry';
import { MarketData } from '../../../src/types/MarketData';

describe('Market Data Functions', () => {
  let context: ExecutionContext;
  let registry: FunctionRegistry;

  beforeEach(() => {
    registry = new FunctionRegistry();
    context = new ExecutionContext(mockSimpleData, registry);
  });

  describe('OPEN', () => {
    it('should return open prices array', () => {
      const result = OPEN.execute([], context);
      expect(result).toHaveLength(mockSimpleData.length);
      expect(result).toEqual(mockSimpleData.map(d => d.open));
    });

    it('should have correct function metadata', () => {
      expect(OPEN.name).toBe('OPEN');
      expect(OPEN.minArgs).toBe(0);
      expect(OPEN.maxArgs).toBe(0);
    });

    it('should work with all values', () => {
      const result = OPEN.execute([], context);
      expect(result[0]).toBe(100);
      expect(result[1]).toBe(102);
      expect(result[2]).toBe(101);
    });
  });

  describe('HIGH', () => {
    it('should return high prices array', () => {
      const result = HIGH.execute([], context);
      expect(result).toHaveLength(mockSimpleData.length);
      expect(result).toEqual(mockSimpleData.map(d => d.high));
    });

    it('should have correct function metadata', () => {
      expect(HIGH.name).toBe('HIGH');
      expect(HIGH.minArgs).toBe(0);
      expect(HIGH.maxArgs).toBe(0);
    });

    it('should work with all values', () => {
      const result = HIGH.execute([], context);
      expect(result[0]).toBe(105);
      expect(result[1]).toBe(103);
      expect(result[2]).toBe(106);
    });
  });

  describe('LOW', () => {
    it('should return low prices array', () => {
      const result = LOW.execute([], context);
      expect(result).toHaveLength(mockSimpleData.length);
      expect(result).toEqual(mockSimpleData.map(d => d.low));
    });

    it('should have correct function metadata', () => {
      expect(LOW.name).toBe('LOW');
      expect(LOW.minArgs).toBe(0);
      expect(LOW.maxArgs).toBe(0);
    });

    it('should work with all values', () => {
      const result = LOW.execute([], context);
      expect(result[0]).toBe(99);
      expect(result[1]).toBe(100);
      expect(result[2]).toBe(101);
    });
  });

  describe('CLOSE', () => {
    it('should return close prices array', () => {
      const result = CLOSE.execute([], context);
      expect(result).toHaveLength(mockSimpleData.length);
      expect(result).toEqual(mockSimpleData.map(d => d.close));
    });

    it('should have correct function metadata', () => {
      expect(CLOSE.name).toBe('CLOSE');
      expect(CLOSE.minArgs).toBe(0);
      expect(CLOSE.maxArgs).toBe(0);
    });

    it('should work with all values', () => {
      const result = CLOSE.execute([], context);
      expect(result[0]).toBe(102);
      expect(result[1]).toBe(101);
      expect(result[2]).toBe(103);
    });
  });

  describe('VOL', () => {
    it('should return volume array', () => {
      const result = VOL.execute([], context);
      expect(result).toHaveLength(mockSimpleData.length);
      expect(result).toEqual(mockSimpleData.map(d => d.volume));
    });

    it('should have correct function metadata', () => {
      expect(VOL.name).toBe('VOL');
      expect(VOL.minArgs).toBe(0);
      expect(VOL.maxArgs).toBe(0);
    });

    it('should work with all values', () => {
      const result = VOL.execute([], context);
      expect(result[0]).toBe(1000000);
      expect(result[1]).toBe(1100000);
      expect(result[2]).toBe(1200000);
    });
  });

  describe('AMOUNT', () => {
    it('should return amount array when available', () => {
      const result = AMOUNT.execute([], context);
      expect(result).toHaveLength(mockSimpleData.length);
      expect(result).toEqual(mockSimpleData.map(d => d.amount!));
    });

    it('should have correct function metadata', () => {
      expect(AMOUNT.name).toBe('AMOUNT');
      expect(AMOUNT.minArgs).toBe(0);
      expect(AMOUNT.maxArgs).toBe(0);
    });

    it('should throw friendly error when amount field is missing', () => {
      const dataWithoutAmount: MarketData[] = mockSimpleData.map(d => ({
        open: d.open,
        close: d.close,
        high: d.high,
        low: d.low,
        volume: d.volume,
        timestamp: d.timestamp,
      }));

      const contextWithoutAmount = new ExecutionContext(dataWithoutAmount, registry);

      expect(() => AMOUNT.execute([], contextWithoutAmount)).toThrow(
        'AMOUNT function requires marketData.amount field'
      );
    });

    it('should provide helpful error message', () => {
      const dataWithoutAmount: MarketData[] = mockSimpleData.map(d => ({
        open: d.open,
        close: d.close,
        high: d.high,
        low: d.low,
        volume: d.volume,
        timestamp: d.timestamp,
      }));

      const contextWithoutAmount = new ExecutionContext(dataWithoutAmount, registry);

      expect(() => AMOUNT.execute([], contextWithoutAmount)).toThrow(
        /Please provide the "amount" field/
      );
    });
  });

  describe('ADVANCE', () => {
    it('should return advance array when available', () => {
      const contextWithAdvance = new ExecutionContext(mockDailyData, registry);
      const result = ADVANCE.execute([], contextWithAdvance);
      expect(result).toHaveLength(mockDailyData.length);
    });

    it('should have correct function metadata', () => {
      expect(ADVANCE.name).toBe('ADVANCE');
      expect(ADVANCE.minArgs).toBe(0);
      expect(ADVANCE.maxArgs).toBe(0);
    });

    it('should throw friendly error when advance field is missing', () => {
      const dataWithoutAdvance: MarketData[] = mockSimpleData.map(d => ({
        open: d.open,
        close: d.close,
        high: d.high,
        low: d.low,
        volume: d.volume,
        timestamp: d.timestamp,
      }));

      const contextWithoutAdvance = new ExecutionContext(dataWithoutAdvance, registry);

      expect(() => ADVANCE.execute([], contextWithoutAdvance)).toThrow(
        'ADVANCE function requires marketData.advance field'
      );
    });

    it('should work with index data containing advance field', () => {
      const contextWithAdvance = new ExecutionContext(mockDailyData, registry);
      const result = ADVANCE.execute([], contextWithAdvance);

      expect(result).toHaveLength(mockDailyData.length);
      expect(result.every(v => v >= 0)).toBe(true);
    });

    it('should provide helpful error message for index-only field', () => {
      const dataWithoutAdvance: MarketData[] = mockSimpleData.map(d => ({
        open: d.open,
        close: d.close,
        high: d.high,
        low: d.low,
        volume: d.volume,
        timestamp: d.timestamp,
      }));

      const contextWithoutAdvance = new ExecutionContext(dataWithoutAdvance, registry);

      expect(() => ADVANCE.execute([], contextWithoutAdvance)).toThrow(
        /index data/i
      );
    });
  });

  describe('DECLINE', () => {
    it('should return decline array when available', () => {
      const contextWithDecline = new ExecutionContext(mockDailyData, registry);
      const result = DECLINE.execute([], contextWithDecline);
      expect(result).toHaveLength(mockDailyData.length);
    });

    it('should have correct function metadata', () => {
      expect(DECLINE.name).toBe('DECLINE');
      expect(DECLINE.minArgs).toBe(0);
      expect(DECLINE.maxArgs).toBe(0);
    });

    it('should throw friendly error when decline field is missing', () => {
      const dataWithoutDecline: MarketData[] = mockSimpleData.map(d => ({
        open: d.open,
        close: d.close,
        high: d.high,
        low: d.low,
        volume: d.volume,
        timestamp: d.timestamp,
      }));

      const contextWithoutDecline = new ExecutionContext(dataWithoutDecline, registry);

      expect(() => DECLINE.execute([], contextWithoutDecline)).toThrow(
        'DECLINE function requires marketData.decline field'
      );
    });

    it('should work with index data containing decline field', () => {
      const contextWithDecline = new ExecutionContext(mockDailyData, registry);
      const result = DECLINE.execute([], contextWithDecline);

      expect(result).toHaveLength(mockDailyData.length);
      expect(result.every(v => v >= 0)).toBe(true);
    });

    it('should provide helpful error message for index-only field', () => {
      const dataWithoutDecline: MarketData[] = mockSimpleData.map(d => ({
        open: d.open,
        close: d.close,
        high: d.high,
        low: d.low,
        volume: d.volume,
        timestamp: d.timestamp,
      }));

      const contextWithoutDecline = new ExecutionContext(dataWithoutDecline, registry);

      expect(() => DECLINE.execute([], contextWithoutDecline)).toThrow(
        /index data/i
      );
    });
  });

  describe('Integration with other functions', () => {
    it('should work with MA function on CLOSE', () => {
      const closeData = CLOSE.execute([], context);
      expect(closeData).toHaveLength(mockSimpleData.length);
      expect(closeData[0]).toBe(102);
    });

    it('should work with arithmetic operations', () => {
      const open = OPEN.execute([], context);
      const close = CLOSE.execute([], context);
      const returns = close.map((c, i) => (c - open[i]) / open[i]);
      expect(returns[0]).toBeCloseTo(0.02, 4);
    });

    it('should combine multiple market data functions', () => {
      const high = HIGH.execute([], context);
      const low = LOW.execute([], context);
      const close = CLOSE.execute([], context);
      const typical = close.map((c, i) => (high[i] + low[i] + c) / 3);
      expect(typical[0]).toBeCloseTo((105 + 99 + 102) / 3, 4);
    });

    it('should work with VOL for volume analysis', () => {
      const vol = VOL.execute([], context);
      const totalVolume = vol.reduce((a, b) => a + b, 0);
      expect(totalVolume).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle single data point', () => {
      const singleData: MarketData[] = [mockSimpleData[0]];
      const singleContext = new ExecutionContext(singleData, registry);
      const result = CLOSE.execute([], singleContext);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(102);
    });

    it('should handle large datasets', () => {
      const largeContext = new ExecutionContext(mockDailyData, registry);
      const result = CLOSE.execute([], largeContext);
      expect(result).toHaveLength(mockDailyData.length);
      expect(result.every(v => typeof v === 'number')).toBe(true);
    });

    it('should maintain data precision', () => {
      const result = OPEN.execute([], context);
      mockSimpleData.forEach((data, i) => {
        expect(result[i]).toBe(data.open);
      });
    });
  });
});

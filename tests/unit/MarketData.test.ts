import {
  MarketData,
  validateMarketData,
  validateMarketDataArray,
  getMarketDataLength,
} from '../../src/types/MarketData';

describe('MarketData Types and Validators', () => {
  const validTimestamp = new Date('2024-01-02T09:30:00.000Z').getTime();

  describe('MarketData interface', () => {
    it('should create a valid MarketData object with required fields', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(data.open).toBe(100);
      expect(data.close).toBe(105);
      expect(data.high).toBe(110);
      expect(data.low).toBe(95);
      expect(data.volume).toBe(1000000);
      expect(data.timestamp).toBe(validTimestamp);
    });

    it('should allow optional amount field', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        amount: 50000000,
      };

      expect(data.amount).toBe(50000000);
    });

    it('should allow optional tradableShares field', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        tradableShares: 10000000,
      };

      expect(data.tradableShares).toBe(10000000);
    });

    it('should allow optional advance and decline fields', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        advance: 50,
        decline: 50,
      };

      expect(data.advance).toBe(50);
      expect(data.decline).toBe(50);
    });
  });

  describe('validateMarketData', () => {
    it('should return true for valid MarketData with required fields', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data)).toBe(true);
    });

    it('should return true for valid MarketData with amount field', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        amount: 50000000,
      };

      expect(validateMarketData(data)).toBe(true);
    });

    it('should return true for valid MarketData with all optional fields', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        amount: 50000000,
        tradableShares: 10000000,
        advance: 50,
        decline: 50,
      };

      expect(validateMarketData(data)).toBe(true);
    });

    // Required field missing tests
    it('should return false when open is missing', () => {
      const data = {
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when close is missing', () => {
      const data = {
        open: 100,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when high is missing', () => {
      const data = {
        open: 100,
        close: 105,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when low is missing', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when volume is missing', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when timestamp is missing', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when timestamp is undefined', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: undefined,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when timestamp is null', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: null,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    // Type validation tests
    it('should return false when open is not a number', () => {
      const data = {
        open: 'invalid',
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when close is not a number', () => {
      const data = {
        open: 100,
        close: 'invalid',
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when high is not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 'invalid',
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when low is not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 'invalid',
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when volume is not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 'invalid',
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when timestamp is not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: 'invalid',
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when amount is present but not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        amount: 'invalid',
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when tradableShares is present but not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        tradableShares: 'invalid',
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when advance is present but not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        advance: 'invalid',
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when decline is present but not a number', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        decline: 'invalid',
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    // Logical constraint tests
    it('should return false when high is less than low', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 90,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return false when volume is negative', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: -1000000,
        timestamp: validTimestamp,
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return false when amount is negative', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        amount: -50000000,
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return false when tradableShares is negative', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        tradableShares: -10000000,
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return false when advance is negative', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        advance: -10,
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return false when decline is negative', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: validTimestamp,
        decline: -10,
      };

      expect(validateMarketData(data)).toBe(false);
    });

    // Timestamp range tests
    it('should return false when timestamp is before 1970', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: new Date('1969-12-31').getTime(),
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return false when timestamp is after 2100', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: new Date('2100-01-02').getTime(),
      };

      expect(validateMarketData(data)).toBe(false);
    });

    it('should return true when timestamp is at 1970 boundary', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: new Date('1970-01-01').getTime(),
      };

      expect(validateMarketData(data)).toBe(true);
    });

    it('should return true when timestamp is at 2100 boundary', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        timestamp: new Date('2100-01-01').getTime(),
      };

      expect(validateMarketData(data)).toBe(true);
    });
  });

  describe('validateMarketDataArray', () => {
    const baseTimestamp = new Date('2024-01-02T09:30:00.000Z').getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    it('should validate array of valid market data', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp },
        { open: 105, close: 110, high: 115, low: 100, volume: 1200, timestamp: baseTimestamp + dayMs },
        { open: 110, close: 108, high: 112, low: 105, volume: 900, timestamp: baseTimestamp + 2 * dayMs },
      ];

      expect(() => validateMarketDataArray(data)).not.toThrow();
    });

    it('should throw error when data is not an array', () => {
      expect(() => validateMarketDataArray({} as unknown as MarketData[])).toThrow(
        'Market data must be an array'
      );
    });

    it('should throw error when array is empty', () => {
      expect(() => validateMarketDataArray([])).toThrow('Market data array cannot be empty');
    });

    it('should throw error when an element is invalid', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp },
        { open: 105, close: 110, high: 90, low: 100, volume: 1200, timestamp: baseTimestamp + dayMs }, // high < low
      ];

      expect(() => validateMarketDataArray(data)).toThrow(/Invalid market data at index 1/);
    });

    it('should throw error when timestamps are not increasing', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp },
        { open: 105, close: 110, high: 115, low: 100, volume: 1200, timestamp: baseTimestamp }, // same timestamp
      ];

      expect(() => validateMarketDataArray(data)).toThrow(/Timestamp at index 1.*must be greater than/);
    });

    it('should throw error when timestamps are decreasing', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp + dayMs },
        { open: 105, close: 110, high: 115, low: 100, volume: 1200, timestamp: baseTimestamp }, // earlier timestamp
      ];

      expect(() => validateMarketDataArray(data)).toThrow(/Timestamp at index 1.*must be greater than/);
    });

    it('should provide helpful error message for timestamp validation', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: 1000 },
        { open: 105, close: 110, high: 115, low: 100, volume: 1200, timestamp: 1000 },
      ];

      expect(() => validateMarketDataArray(data)).toThrow(/Timestamps must be strictly increasing/);
    });

    it('should validate single element array', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp },
      ];

      expect(() => validateMarketDataArray(data)).not.toThrow();
    });

    it('should validate array with millisecond-level timestamps', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp },
        { open: 105, close: 110, high: 115, low: 100, volume: 1200, timestamp: baseTimestamp + 1 }, // 1ms later
        { open: 110, close: 108, high: 112, low: 105, volume: 900, timestamp: baseTimestamp + 2 },
      ];

      expect(() => validateMarketDataArray(data)).not.toThrow();
    });

    it('should handle large arrays efficiently', () => {
      const data: MarketData[] = Array.from({ length: 1000 }, (_, i) => ({
        open: 100 + i,
        close: 105 + i,
        high: 110 + i,
        low: 95 + i,
        volume: 1000000 + i,
        timestamp: baseTimestamp + i * dayMs,
      }));

      expect(() => validateMarketDataArray(data)).not.toThrow();
    });
  });

  describe('getMarketDataLength', () => {
    const baseTimestamp = new Date('2024-01-02T09:30:00.000Z').getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    it('should return the number of MarketData objects in an array', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000000, timestamp: baseTimestamp },
        { open: 105, close: 110, high: 115, low: 100, volume: 1200000, timestamp: baseTimestamp + dayMs },
        { open: 110, close: 108, high: 112, low: 105, volume: 900000, timestamp: baseTimestamp + 2 * dayMs },
      ];

      expect(getMarketDataLength(data)).toBe(3);
    });

    it('should return 0 for an empty array', () => {
      const data: MarketData[] = [];

      expect(getMarketDataLength(data)).toBe(0);
    });

    it('should return 1 for a single element array', () => {
      const data: MarketData[] = [
        { open: 100, close: 105, high: 110, low: 95, volume: 1000000, timestamp: baseTimestamp },
      ];

      expect(getMarketDataLength(data)).toBe(1);
    });

    it('should handle large arrays', () => {
      const data: MarketData[] = Array.from({ length: 1000 }, (_, i) => ({
        open: 100 + i,
        close: 105 + i,
        high: 110 + i,
        low: 95 + i,
        volume: 1000000 + i,
        timestamp: baseTimestamp + i * dayMs,
      }));

      expect(getMarketDataLength(data)).toBe(1000);
    });
  });
});

import {
  MarketData,
  validateMarketData,
  getMarketDataLength,
} from '../../src/types/MarketData';

describe('MarketData Types and Validators', () => {
  describe('MarketData interface', () => {
    it('should create a valid MarketData object with required fields', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
      };

      expect(data.open).toBe(100);
      expect(data.close).toBe(105);
      expect(data.high).toBe(110);
      expect(data.low).toBe(95);
      expect(data.volume).toBe(1000000);
    });

    it('should allow optional amount field', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
        amount: 50000000,
      };

      expect(data.amount).toBe(50000000);
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
        amount: 50000000,
      };

      expect(validateMarketData(data)).toBe(true);
    });

    it('should return false when open is missing', () => {
      const data = {
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when close is missing', () => {
      const data = {
        open: 100,
        high: 110,
        low: 95,
        volume: 1000000,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when high is missing', () => {
      const data = {
        open: 100,
        close: 105,
        low: 95,
        volume: 1000000,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when low is missing', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        volume: 1000000,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when volume is missing', () => {
      const data = {
        open: 100,
        close: 105,
        high: 110,
        low: 95,
      };

      expect(validateMarketData(data as MarketData)).toBe(false);
    });

    it('should return false when open is not a number', () => {
      const data = {
        open: 'invalid',
        close: 105,
        high: 110,
        low: 95,
        volume: 1000000,
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
        amount: 'invalid',
      };

      expect(validateMarketData(data as unknown as MarketData)).toBe(false);
    });

    it('should return false when high is less than low', () => {
      const data: MarketData = {
        open: 100,
        close: 105,
        high: 90,
        low: 95,
        volume: 1000000,
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
        amount: -50000000,
      };

      expect(validateMarketData(data)).toBe(false);
    });
  });

  describe('getMarketDataLength', () => {
    it('should return the number of MarketData objects in an array', () => {
      const data: MarketData[] = [
        {
          open: 100,
          close: 105,
          high: 110,
          low: 95,
          volume: 1000000,
        },
        {
          open: 105,
          close: 110,
          high: 115,
          low: 100,
          volume: 1200000,
        },
        {
          open: 110,
          close: 108,
          high: 112,
          low: 105,
          volume: 900000,
        },
      ];

      expect(getMarketDataLength(data)).toBe(3);
    });

    it('should return 0 for an empty array', () => {
      const data: MarketData[] = [];

      expect(getMarketDataLength(data)).toBe(0);
    });

    it('should return 1 for a single element array', () => {
      const data: MarketData[] = [
        {
          open: 100,
          close: 105,
          high: 110,
          low: 95,
          volume: 1000000,
        },
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
      }));

      expect(getMarketDataLength(data)).toBe(1000);
    });
  });
});

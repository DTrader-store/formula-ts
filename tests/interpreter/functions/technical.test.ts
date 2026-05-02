import { SMA, WMA, BOLL, RSI, ATR } from '../../../src/interpreter/functions/technical';

describe('Technical Analysis Functions', () => {
  describe('SMA - Simple Moving Average with Weight', () => {
    it('should calculate SMA correctly with weight M=1', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const N = 3;
      const M = 1;
      const result = SMA(data, N, M);

      // TDX SMA starts from the first data point and recursively smooths.
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(1.3333, 4);
      expect(result[2]).toBeCloseTo(1.8889, 4);
      expect(result[3]).toBeCloseTo(2.5926, 4);
      expect(result[4]).toBeCloseTo(3.3951, 4);
    });

    it('should calculate SMA with weight M (exponential smoothing)', () => {
      const data = [10, 20, 30, 40, 50];
      const N = 3;
      const M = 2; // Weight for smoothing
      const result = SMA(data, N, M);

      expect(result[0]).toBeCloseTo(10);
      expect(result[1]).toBeCloseTo(16.6667, 4);
      expect(result[2]).toBeCloseTo(25.5556, 4);
      expect(result[3]).toBeCloseTo(35.1852, 4);
      expect(result[4]).toBeCloseTo(45.0617, 4);
    });

    it('should handle M = N (more weight on current value)', () => {
      const data = [10, 20, 30, 40, 50];
      const N = 3;
      const M = 3;
      const result = SMA(data, N, M);

      expect(result).toEqual([10, 20, 30, 40, 50]);
    });
  });

  describe('WMA - Weighted Moving Average', () => {
    it('should calculate WMA correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const N = 3;
      const result = WMA(data, N);

      // First two should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // WMA at index 2: (1*1 + 2*2 + 3*3) / (1+2+3) = 14/6 = 2.333
      expect(result[2]).toBeCloseTo(2.333, 2);

      // WMA at index 3: (2*1 + 3*2 + 4*3) / 6 = 20/6 = 3.333
      expect(result[3]).toBeCloseTo(3.333, 2);

      // WMA at index 4: (3*1 + 4*2 + 5*3) / 6 = 26/6 = 4.333
      expect(result[4]).toBeCloseTo(4.333, 2);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3, 4, 5];
      const result = WMA(data, 1);
      // WMA(1) = data * 1 / 1 = data
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle period = 2', () => {
      const data = [10, 20, 30];
      const result = WMA(data, 2);

      expect(Number.isNaN(result[0])).toBe(true);
      // WMA at index 1: (10*1 + 20*2) / (1+2) = 50/3 = 16.667
      expect(result[1]).toBeCloseTo(16.667, 2);
      // WMA at index 2: (20*1 + 30*2) / 3 = 80/3 = 26.667
      expect(result[2]).toBeCloseTo(26.667, 2);
    });
  });

  describe('BOLL - Bollinger Bands', () => {
    it('should calculate BOLL correctly', () => {
      const data = [20, 21, 22, 21, 20, 21, 22, 23, 24, 25];
      const N = 5;
      const P = 2; // 2 standard deviations
      const result = BOLL(data, N, P);

      // Result should have 3 arrays: [upper, middle, lower]
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(data.length); // upper
      expect(result[1]).toHaveLength(data.length); // middle
      expect(result[2]).toHaveLength(data.length); // lower

      // First 4 values should be NaN
      for (let i = 0; i < 4; i++) {
        expect(Number.isNaN(result[0][i])).toBe(true); // upper
        expect(Number.isNaN(result[1][i])).toBe(true); // middle
        expect(Number.isNaN(result[2][i])).toBe(true); // lower
      }

      // At index 4: [20, 21, 22, 21, 20]
      // Middle (MA) = (20+21+22+21+20)/5 = 20.8
      expect(result[1][4]).toBeCloseTo(20.8, 1);

      // Std dev = sqrt(((20-20.8)^2 + (21-20.8)^2 + (22-20.8)^2 + (21-20.8)^2 + (20-20.8)^2) / 5)
      // = sqrt((0.64 + 0.04 + 1.44 + 0.04 + 0.64) / 5) = sqrt(0.56) = 0.748
      const std = 0.748;
      expect(result[0][4]).toBeCloseTo(20.8 + 2 * std, 1); // upper
      expect(result[2][4]).toBeCloseTo(20.8 - 2 * std, 1); // lower
    });

    it('should handle different P values', () => {
      const data = [10, 10, 10, 10, 10];
      const N = 3;
      const P = 1;
      const result = BOLL(data, N, P);

      // All same values = 0 std dev
      expect(result[1][2]).toBeCloseTo(10); // middle
      expect(result[0][2]).toBeCloseTo(10); // upper = middle + 1*0
      expect(result[2][2]).toBeCloseTo(10); // lower = middle - 1*0
    });

    it('should maintain upper >= middle >= lower', () => {
      const data = [15, 18, 22, 19, 16, 20, 23, 21, 17, 19];
      const N = 5;
      const P = 2;
      const result = BOLL(data, N, P);

      for (let i = N - 1; i < data.length; i++) {
        expect(result[0][i]).toBeGreaterThanOrEqual(result[1][i]); // upper >= middle
        expect(result[1][i]).toBeGreaterThanOrEqual(result[2][i]); // middle >= lower
      }
    });
  });

  describe('RSI - Relative Strength Index', () => {
    it('should calculate RSI correctly', () => {
      // Price sequence with clear ups and downs
      const data = [44, 44.5, 44.2, 45, 45.5, 45.2, 46, 46.5, 46.2, 47];
      const N = 6;
      const result = RSI(data, N);

      // First N values should be NaN
      for (let i = 0; i < N; i++) {
        expect(Number.isNaN(result[i])).toBe(true);
      }

      // RSI should be between 0 and 100
      for (let i = N; i < data.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(100);
      }
    });

    it('should return 100 for all rising prices', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8];
      const N = 6;
      const result = RSI(data, N);

      // After warmup period, RSI should be 100 (no losses)
      expect(result[6]).toBeCloseTo(100, 1);
      expect(result[7]).toBeCloseTo(100, 1);
    });

    it('should return 0 for all falling prices', () => {
      const data = [8, 7, 6, 5, 4, 3, 2, 1];
      const N = 6;
      const result = RSI(data, N);

      // After warmup period, RSI should be 0 (no gains)
      expect(result[6]).toBeCloseTo(0, 1);
      expect(result[7]).toBeCloseTo(0, 1);
    });

    it('should return around 50 for equal gains and losses', () => {
      // Alternating +1 and -1 changes
      const data = [50, 51, 50, 51, 50, 51, 50, 51];
      const N = 6;
      const result = RSI(data, N);

      // Equal gains and losses should give RSI around 50 (with some variance due to smoothing)
      expect(result[6]).toBeGreaterThan(40);
      expect(result[6]).toBeLessThan(60);
      expect(result[7]).toBeGreaterThan(40);
      expect(result[7]).toBeLessThan(60);
    });

    it('should handle period = 1', () => {
      const data = [10, 11, 10, 12];
      const N = 1;
      const result = RSI(data, N);

      expect(Number.isNaN(result[0])).toBe(true);
      // With N=1, RSI is 100 on up, 0 on down
      expect(result[1]).toBeCloseTo(100); // 10->11 up
      expect(result[2]).toBeCloseTo(0);   // 11->10 down
      expect(result[3]).toBeCloseTo(100); // 10->12 up
    });
  });

  describe('ATR - Average True Range', () => {
    it('should calculate ATR correctly', () => {
      const high = [48, 49, 50, 51, 52, 53, 54];
      const low = [46, 47, 48, 49, 50, 51, 52];
      const close = [47, 48, 49, 50, 51, 52, 53];
      const N = 3;
      const result = ATR(high, low, close, N);

      // First N values should be NaN
      for (let i = 0; i < N; i++) {
        expect(Number.isNaN(result[i])).toBe(true);
      }

      // ATR should be positive
      for (let i = N; i < high.length; i++) {
        expect(result[i]).toBeGreaterThan(0);
      }
    });

    it('should handle gaps in price', () => {
      const high = [50, 55, 52, 58]; // Gap up on day 2, gap up on day 4
      const low = [48, 53, 50, 56];
      const close = [49, 54, 51, 57];
      const N = 3;
      const result = ATR(high, low, close, N);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(Number.isNaN(result[2])).toBe(true);

      // TR at index 1: max(55-53, |55-49|, |53-49|) = max(2, 6, 4) = 6
      // TR at index 2: max(52-50, |52-54|, |50-54|) = max(2, 2, 4) = 4
      // TR at index 3: max(58-56, |58-51|, |56-51|) = max(2, 7, 5) = 7
      // ATR at index 3: avg(6, 4, 7) = 5.667
      expect(result[3]).toBeCloseTo(5.667, 2);
    });

    it('should use EMA smoothing for periods after initial', () => {
      const high = [50, 52, 51, 53, 52, 54, 53];
      const low = [48, 50, 49, 51, 50, 52, 51];
      const close = [49, 51, 50, 52, 51, 53, 52];
      const N = 3;
      const result = ATR(high, low, close, N);

      // ATR values should be smoothed (not just simple average)
      expect(result[3]).toBeGreaterThan(0);
      expect(result[4]).toBeGreaterThan(0);
      expect(result[5]).toBeGreaterThan(0);
      expect(result[6]).toBeGreaterThan(0);
    });

    it('should handle period = 1', () => {
      const high = [50, 52, 51];
      const low = [48, 50, 49];
      const close = [49, 51, 50];
      const N = 1;
      const result = ATR(high, low, close, N);

      expect(Number.isNaN(result[0])).toBe(true);

      // TR at index 1: max(52-50, |52-49|, |50-49|) = max(2, 3, 1) = 3
      expect(result[1]).toBeCloseTo(3);

      // TR at index 2: max(51-49, |51-51|, |49-51|) = max(2, 0, 2) = 2
      expect(result[2]).toBeCloseTo(2);
    });

    it('should validate array lengths match', () => {
      const high = [50, 52];
      const low = [48, 50, 49]; // Different length
      const close = [49, 51];
      const N = 2;

      // Should use shortest array length
      const result = ATR(high, low, close, N);
      expect(result.length).toBe(2);
    });
  });
});

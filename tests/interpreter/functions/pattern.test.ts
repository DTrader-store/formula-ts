import { UPNDAY, DOWNNDAY, NDAY, RANGE, BETWEEN } from '../../../src/interpreter/functions/pattern';

describe('Pattern Functions', () => {
  describe('UPNDAY - Continuous N Day Rise', () => {
    it('should detect 1 consecutive day rise', () => {
      const close = [100, 101, 100, 102, 101, 103];
      const result = UPNDAY(close, 1);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(1); // 101 > 100
      expect(result[2]).toBe(0); // 100 < 101
      expect(result[3]).toBe(1); // 102 > 100
      expect(result[4]).toBe(0); // 101 < 102
      expect(result[5]).toBe(1); // 103 > 101
    });

    it('should detect 2 consecutive days rise', () => {
      const close = [100, 101, 102, 101, 102, 103];
      const result = UPNDAY(close, 2);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(0); // Not enough data
      expect(result[2]).toBe(1); // 102 > 101 > 100
      expect(result[3]).toBe(0); // 101 < 102
      expect(result[4]).toBe(0); // Only 1 day rise
      expect(result[5]).toBe(1); // 103 > 102 > 101
    });

    it('should detect 3 consecutive days rise', () => {
      const close = [100, 101, 102, 103, 102, 103, 104, 105];
      const result = UPNDAY(close, 3);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(0); // Not enough data
      expect(result[2]).toBe(0); // Not enough data
      expect(result[3]).toBe(1); // 103 > 102 > 101 > 100
      expect(result[4]).toBe(0); // 102 < 103
      expect(result[5]).toBe(0); // Only 1 day rise
      expect(result[6]).toBe(0); // Only 2 days rise
      expect(result[7]).toBe(1); // 105 > 104 > 103 > 102
    });

    it('should detect 5 consecutive days rise', () => {
      const close = [100, 101, 102, 103, 104, 105, 104, 105, 106, 107, 108, 109];
      const result = UPNDAY(close, 5);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[4]).toBe(0); // Not enough data
      expect(result[5]).toBe(1); // 5 consecutive rises
      expect(result[6]).toBe(0); // Fall at 104
      expect(result[11]).toBe(1); // 109 > 108 > 107 > 106 > 105
    });

    it('should return 0 when equal prices occur', () => {
      const close = [100, 101, 101, 102];
      const result = UPNDAY(close, 2);

      expect(result[2]).toBe(0); // 101 = 101, not rising
      expect(result[3]).toBe(0); // 102 > 101, but 101 = 101
    });

    it('should handle flat market', () => {
      const close = [100, 100, 100, 100];
      const result = UPNDAY(close, 2);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should handle continuous downtrend', () => {
      const close = [105, 104, 103, 102, 101];
      const result = UPNDAY(close, 2);

      expect(result).toEqual([0, 0, 0, 0, 0]);
    });

    it('should floor decimal period values', () => {
      const close = [100, 101, 102, 103];
      const result = UPNDAY(close, 2.7);

      // Should treat as period = 2
      expect(result[2]).toBe(1);
    });
  });

  describe('DOWNNDAY - Continuous N Day Fall', () => {
    it('should detect 1 consecutive day fall', () => {
      const close = [100, 99, 100, 98, 99, 97];
      const result = DOWNNDAY(close, 1);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(1); // 99 < 100
      expect(result[2]).toBe(0); // 100 > 99
      expect(result[3]).toBe(1); // 98 < 100
      expect(result[4]).toBe(0); // 99 > 98
      expect(result[5]).toBe(1); // 97 < 99
    });

    it('should detect 2 consecutive days fall', () => {
      const close = [100, 99, 98, 99, 98, 97];
      const result = DOWNNDAY(close, 2);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(0); // Not enough data
      expect(result[2]).toBe(1); // 98 < 99 < 100
      expect(result[3]).toBe(0); // 99 > 98
      expect(result[4]).toBe(0); // Only 1 day fall
      expect(result[5]).toBe(1); // 97 < 98 < 99
    });

    it('should detect 3 consecutive days fall', () => {
      const close = [100, 99, 98, 97, 98, 97, 96, 95];
      const result = DOWNNDAY(close, 3);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(0); // Not enough data
      expect(result[2]).toBe(0); // Not enough data
      expect(result[3]).toBe(1); // 97 < 98 < 99 < 100
      expect(result[4]).toBe(0); // 98 > 97
      expect(result[5]).toBe(0); // Only 1 day fall
      expect(result[6]).toBe(0); // Only 2 days fall
      expect(result[7]).toBe(1); // 95 < 96 < 97 < 98
    });

    it('should detect 5 consecutive days fall', () => {
      const close = [100, 99, 98, 97, 96, 95, 96, 95, 94, 93, 92, 91];
      const result = DOWNNDAY(close, 5);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[4]).toBe(0); // Not enough data
      expect(result[5]).toBe(1); // 5 consecutive falls
      expect(result[6]).toBe(0); // Rise at 96
      expect(result[11]).toBe(1); // 91 < 92 < 93 < 94 < 95
    });

    it('should return 0 when equal prices occur', () => {
      const close = [100, 99, 99, 98];
      const result = DOWNNDAY(close, 2);

      expect(result[2]).toBe(0); // 99 = 99, not falling
      expect(result[3]).toBe(0); // 98 < 99, but 99 = 99
    });

    it('should handle flat market', () => {
      const close = [100, 100, 100, 100];
      const result = DOWNNDAY(close, 2);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should handle continuous uptrend', () => {
      const close = [100, 101, 102, 103, 104];
      const result = DOWNNDAY(close, 2);

      expect(result).toEqual([0, 0, 0, 0, 0]);
    });

    it('should floor decimal period values', () => {
      const close = [100, 99, 98, 97];
      const result = DOWNNDAY(close, 2.7);

      // Should treat as period = 2
      expect(result[2]).toBe(1);
    });
  });

  describe('NDAY - Condition Satisfied for N Consecutive Days', () => {
    it('should detect condition satisfied for 1 day', () => {
      const cond = [1, 0, 1, 0, 1];
      const result = NDAY(cond, 1);

      expect(result).toEqual([1, 0, 1, 0, 1]);
    });

    it('should detect condition satisfied for 2 consecutive days', () => {
      const cond = [1, 1, 0, 1, 1, 1];
      const result = NDAY(cond, 2);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(1); // cond[0]=1, cond[1]=1
      expect(result[2]).toBe(0); // cond[1]=1, cond[2]=0
      expect(result[3]).toBe(0); // cond[2]=0, cond[3]=1
      expect(result[4]).toBe(1); // cond[3]=1, cond[4]=1
      expect(result[5]).toBe(1); // cond[4]=1, cond[5]=1
    });

    it('should detect condition satisfied for 3 consecutive days', () => {
      const cond = [1, 1, 1, 0, 1, 1, 1, 1];
      const result = NDAY(cond, 3);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(0); // Not enough data
      expect(result[2]).toBe(1); // cond[0,1,2] all 1
      expect(result[3]).toBe(0); // cond[3]=0
      expect(result[4]).toBe(0); // cond[2,3,4] contains 0
      expect(result[5]).toBe(0); // cond[3,4,5] contains 0
      expect(result[6]).toBe(1); // cond[4,5,6] all 1
      expect(result[7]).toBe(1); // cond[5,6,7] all 1
    });

    it('should treat any non-zero as true', () => {
      const cond = [5, -1, 2.5, 0, 100];
      const result = NDAY(cond, 2);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(1); // 5 and -1 are both non-zero
      expect(result[2]).toBe(1); // -1 and 2.5 are both non-zero
      expect(result[3]).toBe(0); // 2.5 and 0, contains zero
      expect(result[4]).toBe(0); // 0 and 100, contains zero
    });

    it('should work with complex conditions', () => {
      // Simulating MA5 > MA10 condition
      const ma5 = [100, 101, 102, 103, 104, 103, 102];
      const ma10 = [99, 100, 101, 102, 103, 104, 105];
      const cond = ma5.map((v, i) => (v > ma10[i] ? 1 : 0));
      // cond = [1, 1, 1, 1, 1, 0, 0]

      const result = NDAY(cond, 3);

      expect(result[2]).toBe(1); // First 3 days all true
      expect(result[3]).toBe(1); // Days 1-3 all true
      expect(result[4]).toBe(1); // Days 2-4 all true
      expect(result[5]).toBe(0); // Day 5 is false
      expect(result[6]).toBe(0); // Days 5-6 are false
    });

    it('should handle all zeros', () => {
      const cond = [0, 0, 0, 0];
      const result = NDAY(cond, 2);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should handle all ones', () => {
      const cond = [1, 1, 1, 1];
      const result = NDAY(cond, 2);

      expect(result[0]).toBe(0); // Not enough data
      expect(result[1]).toBe(1);
      expect(result[2]).toBe(1);
      expect(result[3]).toBe(1);
    });

    it('should floor decimal period values', () => {
      const cond = [1, 1, 1, 1];
      const result = NDAY(cond, 2.7);

      // Should treat as period = 2
      expect(result[1]).toBe(1);
    });
  });

  describe('RANGE - Check if A is Between B and C', () => {
    it('should return 1 when A is between B and C', () => {
      const A = [5, 10, 15, 20];
      const B = [0, 0, 0, 0];
      const C = [10, 20, 20, 15];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(1); // 5 in [0, 10]
      expect(result[1]).toBe(1); // 10 in [0, 20]
      expect(result[2]).toBe(1); // 15 in [0, 20]
      expect(result[3]).toBe(0); // 20 not in [0, 15]
    });

    it('should handle B and C in any order', () => {
      const A = [5, 5];
      const B = [0, 10];
      const C = [10, 0];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(1); // 5 in [0, 10]
      expect(result[1]).toBe(1); // 5 in [0, 10] (reversed)
    });

    it('should include boundary values', () => {
      const A = [0, 10, 5];
      const B = [0, 0, 0];
      const C = [10, 10, 10];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(1); // 0 = min boundary
      expect(result[1]).toBe(1); // 10 = max boundary
      expect(result[2]).toBe(1); // 5 in middle
    });

    it('should return 0 when A is below range', () => {
      const A = [-5, 0, 5];
      const B = [10, 10, 10];
      const C = [20, 20, 20];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(0); // -5 < 10
      expect(result[1]).toBe(0); // 0 < 10
      expect(result[2]).toBe(0); // 5 < 10
    });

    it('should return 0 when A is above range', () => {
      const A = [25, 30, 100];
      const B = [10, 10, 10];
      const C = [20, 20, 20];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(0); // 25 > 20
      expect(result[1]).toBe(0); // 30 > 20
      expect(result[2]).toBe(0); // 100 > 20
    });

    it('should work with RSI range check', () => {
      // Simulating RSI between 30 and 70
      const rsi = [25, 30, 50, 70, 75];
      const lower = [30, 30, 30, 30, 30];
      const upper = [70, 70, 70, 70, 70];

      const result = RANGE(rsi, lower, upper);

      expect(result[0]).toBe(0); // 25 < 30
      expect(result[1]).toBe(1); // 30 = lower bound
      expect(result[2]).toBe(1); // 50 in range
      expect(result[3]).toBe(1); // 70 = upper bound
      expect(result[4]).toBe(0); // 75 > 70
    });

    it('should work with BOLL bands', () => {
      // Simulating close price between BOLL bands
      const close = [95, 100, 105, 110, 115];
      const lower = [100, 100, 100, 100, 100];
      const upper = [110, 110, 110, 110, 110];

      const result = RANGE(close, lower, upper);

      expect(result[0]).toBe(0); // 95 < 100 (below lower band)
      expect(result[1]).toBe(1); // 100 = lower band
      expect(result[2]).toBe(1); // 105 in bands
      expect(result[3]).toBe(1); // 110 = upper band
      expect(result[4]).toBe(0); // 115 > 110 (above upper band)
    });

    it('should handle arrays of different lengths', () => {
      const A = [5, 10];
      const B = [0];
      const C = [10, 20, 30];

      const result = RANGE(A, B, C);

      // Length should be max(2, 1, 3) = 3
      expect(result.length).toBe(3);
      expect(result[0]).toBe(1); // 5 in [0, 10]
      expect(result[1]).toBe(1); // 10 in [0, 20]
      expect(result[2]).toBe(1); // 10 (last A) in [0, 30]
    });

    it('should handle negative ranges', () => {
      const A = [-5, 0, 5];
      const B = [-10, -10, -10];
      const C = [0, 0, 0];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(1); // -5 in [-10, 0]
      expect(result[1]).toBe(1); // 0 = upper bound
      expect(result[2]).toBe(0); // 5 > 0
    });

    it('should handle single point range', () => {
      const A = [5, 10, 15];
      const B = [10, 10, 10];
      const C = [10, 10, 10];

      const result = RANGE(A, B, C);

      expect(result[0]).toBe(0); // 5 != 10
      expect(result[1]).toBe(1); // 10 = 10
      expect(result[2]).toBe(0); // 15 != 10
    });
  });

  describe('BETWEEN - Alias for RANGE', () => {
    it('should work exactly like RANGE', () => {
      const A = [5, 10, 15];
      const B = [0, 0, 0];
      const C = [10, 20, 20];

      const rangeResult = RANGE(A, B, C);
      const betweenResult = BETWEEN(A, B, C);

      expect(betweenResult).toEqual(rangeResult);
    });

    it('should return 1 when A is between B and C', () => {
      const A = [5, 10, 15, 20];
      const B = [0, 0, 0, 0];
      const C = [10, 20, 20, 15];

      const result = BETWEEN(A, B, C);

      expect(result[0]).toBe(1); // 5 in [0, 10]
      expect(result[1]).toBe(1); // 10 in [0, 20]
      expect(result[2]).toBe(1); // 15 in [0, 20]
      expect(result[3]).toBe(0); // 20 not in [0, 15]
    });

    it('should handle boundary values', () => {
      const A = [30, 50, 70];
      const B = [30, 30, 30];
      const C = [70, 70, 70];

      const result = BETWEEN(A, B, C);

      expect(result[0]).toBe(1); // 30 = lower bound
      expect(result[1]).toBe(1); // 50 in middle
      expect(result[2]).toBe(1); // 70 = upper bound
    });

    it('should return 0 when A is outside range', () => {
      const A = [20, 80];
      const B = [30, 30];
      const C = [70, 70];

      const result = BETWEEN(A, B, C);

      expect(result[0]).toBe(0); // 20 < 30
      expect(result[1]).toBe(0); // 80 > 70
    });
  });

  describe('Integration scenarios', () => {
    it('should combine UPNDAY with other conditions', () => {
      // Detect when price rises for 3 days AND close is above 105
      const close = [98, 99, 100, 101, 102, 104, 105, 106, 107];
      const upnday3 = UPNDAY(close, 3);
      const above105 = close.map(v => (v > 105 ? 1 : 0));

      const combined = upnday3.map((v, i) => (v && above105[i] ? 1 : 0));

      // At index 3: upnday3=1, above105=0 (101 <= 105) -> 0
      expect(combined[3]).toBe(0);
      // At index 6: upnday3=1, above105=0 (105 = 105) -> 0
      expect(combined[6]).toBe(0);
      // At index 7: upnday3=1, above105=1 (106 > 105) -> 1
      expect(combined[7]).toBe(1);
      // At index 8: upnday3=1, above105=1 (107 > 105) -> 1
      expect(combined[8]).toBe(1);
    });

    it('should combine NDAY with RANGE', () => {
      // Detect when RSI stays between 30-70 for 3 days
      const rsi = [25, 40, 50, 60, 75, 50, 55, 60];
      const inRange = RANGE(rsi, [30, 30, 30, 30, 30, 30, 30, 30], [70, 70, 70, 70, 70, 70, 70, 70]);
      const stable3Days = NDAY(inRange, 3);

      expect(stable3Days[3]).toBe(1); // Days 1-3 in range
      expect(stable3Days[4]).toBe(0); // Day 4 out of range
      expect(stable3Days[7]).toBe(1); // Days 5-7 in range
    });

    it('should detect divergence patterns', () => {
      // Price rises but indicator falls (bearish divergence)
      const close = [100, 101, 102, 103];
      const indicator = [60, 55, 50, 45];

      const priceUp = UPNDAY(close, 3);
      const indicatorDown = DOWNNDAY(indicator, 3);

      expect(priceUp[3]).toBe(1);
      expect(indicatorDown[3]).toBe(1);
      // Bearish divergence detected at index 3
    });
  });
});

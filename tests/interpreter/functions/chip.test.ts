import { WINNER, LWINNER, COST, VALUEWHEN, TOPRANGE, LOWRANGE } from '../../../src/interpreter/functions/chip';

describe('Chip Distribution and Value Functions', () => {
  describe('WINNER - Profit Ratio at Price Level', () => {
    it('should calculate profit ratio when price is below all historical prices', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const targetPrice = [95, 95, 95, 95, 95]; // Below all prices

      const result = WINNER(close, volume, targetPrice);

      // At any point, no shares were bought below 95, so ratio should be 0
      expect(result[0]).toBe(0);
      expect(result[4]).toBe(0);
    });

    it('should calculate profit ratio when price is above all historical prices', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const targetPrice = [120, 120, 120, 120, 120]; // Above all prices

      const result = WINNER(close, volume, targetPrice);

      // All shares were bought below 120, so ratio should be 1
      expect(result[0]).toBe(1);
      expect(result[4]).toBe(1);
    });

    it('should calculate profit ratio at current price', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      // Target price equals current close
      const targetPrice = close;

      const result = WINNER(close, volume, targetPrice);

      // At index 4: target=108, prices=[100,102,104,106,108]
      // Shares below 108: 100,102,104,106 = 4/5 = 0.8
      expect(result[4]).toBe(0.8);
    });

    it('should calculate profit ratio with mid-range price', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const targetPrice = [104, 104, 104, 104, 104]; // Mid-range

      const result = WINNER(close, volume, targetPrice);

      // At index 4: target=104, prices=[100,102,104,106,108]
      // Shares below 104: 100,102 = 2/5 = 0.4
      expect(result[4]).toBe(0.4);
    });

    it('should use default lookback of 100 periods', () => {
      // Create 150 data points
      const close = Array(150).fill(0).map((_, i) => 100 + i);
      const volume = Array(150).fill(1000);
      const targetPrice = Array(150).fill(150);

      const result = WINNER(close, volume, targetPrice);

      // At index 149: should only look back 100 periods (from index 50 to 149)
      // Prices from 150 to 249, target=150
      // Prices below 150: none (150-249 are all >= 150)
      // So ratio should be 0
      expect(result[149]).toBe(0);
    });

    it('should handle custom lookback period', () => {
      const close = [100, 102, 104, 106, 108, 110];
      const volume = [1000, 1000, 1000, 1000, 1000, 1000];
      const targetPrice = [106, 106, 106, 106, 106, 106];

      // Lookback of 3 periods
      const result = WINNER(close, volume, targetPrice, 3);

      // At index 5: lookback 3, prices=[108,110], target=106
      // Shares below 106: none = 0/2 = 0
      expect(result[5]).toBe(0);

      // At index 3: lookback 3, prices=[102,104,106], target=106
      // Shares below 106: 102,104 = 2/3
      expect(result[3]).toBeCloseTo(2/3, 5);
    });

    it('should handle varying volumes', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 2000, 3000, 4000, 5000]; // Increasing volume
      const targetPrice = [105, 105, 105, 105, 105];

      const result = WINNER(close, volume, targetPrice);

      // At index 4: prices/volumes = [(100,1000), (102,2000), (104,3000), (106,4000), (108,5000)]
      // Total volume = 15000
      // Volume below 105: 1000+2000+3000 = 6000
      // Ratio = 6000/15000 = 0.4
      expect(result[4]).toBeCloseTo(0.4, 5);
    });

    it('should handle zero volume gracefully', () => {
      const close = [100, 102, 104];
      const volume = [0, 0, 0];
      const targetPrice = [102, 102, 102];

      const result = WINNER(close, volume, targetPrice);

      // Zero total volume should result in 0 ratio
      expect(result[0]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it('should handle single data point', () => {
      const close = [100];
      const volume = [1000];
      const targetPrice = [105];

      const result = WINNER(close, volume, targetPrice);

      // Price 100 < 105, so 1000/1000 = 1
      expect(result[0]).toBe(1);
    });

    it('should handle empty arrays', () => {
      const close: number[] = [];
      const volume: number[] = [];
      const targetPrice: number[] = [];

      const result = WINNER(close, volume, targetPrice);

      expect(result).toEqual([]);
    });

    it('should work with realistic market data', () => {
      // Simulating a stock that went from 100 to 110 and back to 105
      const close = [100, 102, 105, 108, 110, 108, 106, 105];
      const volume = [1000, 1200, 1500, 1800, 2000, 1500, 1200, 1000];
      const targetPrice = close; // Using current price

      const result = WINNER(close, volume, targetPrice);

      // At peak (index 4, price 110), most shares should be profitable
      expect(result[4]).toBeGreaterThan(0.5);

      // At final price (index 7, price 105), fewer shares are profitable
      expect(result[7]).toBeLessThan(result[4]);
    });
  });

  describe('LWINNER - Floating Profit Ratio', () => {
    it('should use shorter lookback than WINNER', () => {
      const close = Array(50).fill(0).map((_, i) => 100 + i);
      const volume = Array(50).fill(1000);
      const targetPrice = Array(50).fill(130);

      const winnerResult = WINNER(close, volume, targetPrice, 100); // Default 100
      const lwinnerResult = LWINNER(close, volume, targetPrice); // Default 20

      // LWINNER should consider fewer periods
      // At index 49: WINNER looks back to index 0 (50 periods)
      //              LWINNER looks back to index 30 (20 periods)
      expect(winnerResult[49]).not.toBe(lwinnerResult[49]);
    });

    it('should calculate profit ratio for recent period', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const targetPrice = [105, 105, 105, 105, 105];

      const result = LWINNER(close, volume, targetPrice, 3);

      // At index 4: lookback 3, prices=[104,106,108], target=105
      // Shares below 105: 104 = 1/3
      expect(result[4]).toBeCloseTo(1/3, 5);
    });

    it('should work with default 20-period lookback', () => {
      const close = Array(30).fill(0).map((_, i) => 100 + i);
      const volume = Array(30).fill(1000);
      const targetPrice = Array(30).fill(120);

      const result = LWINNER(close, volume, targetPrice);

      // At index 29: lookback 20, prices from 110 to 129, target=120
      // Prices below 120: 110-119 = 10 periods
      // Ratio = 10/20 = 0.5
      expect(result[29]).toBe(0.5);
    });

    it('should be more sensitive to recent price changes', () => {
      // Price rises then falls sharply
      const close = [100, 101, 102, 103, 104, 95, 94, 93];
      const volume = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
      const targetPrice = [98, 98, 98, 98, 98, 98, 98, 98];

      const winner = WINNER(close, volume, targetPrice, 8);
      const lwinner = LWINNER(close, volume, targetPrice, 3);

      // At index 7: WINNER considers all 8 periods (3 below 98: 95,94,93)
      //             LWINNER considers only last 3 (3 below 98: 95,94,93)
      // WINNER: 3/8 = 0.375, LWINNER: 3/3 = 1
      expect(winner[7]).toBe(0.375);
      expect(lwinner[7]).toBe(1);
      expect(lwinner[7]).toBeGreaterThan(winner[7]);
    });
  });

  describe('COST - Cost Price for Given Profit Percentage', () => {
    it('should calculate cost for 0% profit ratio', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const percent = [0, 0, 0, 0, 0];

      const result = COST(close, volume, percent);

      // 0% profit = lowest price
      expect(result[4]).toBe(100);
    });

    it('should calculate cost for 100% profit ratio', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const percent = [100, 100, 100, 100, 100];

      const result = COST(close, volume, percent);

      // 100% profit = highest price
      expect(result[4]).toBe(108);
    });

    it('should calculate cost for 50% profit ratio', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000]; // Equal volumes
      const percent = [50, 50, 50, 50, 50];

      const result = COST(close, volume, percent);

      // With equal volumes, 50% should be median price = 104
      expect(result[4]).toBe(104);
    });

    it('should calculate cost for 25% profit ratio', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const percent = [25, 25, 25, 25, 25];

      const result = COST(close, volume, percent);

      // 25% with equal volumes should be around 102
      expect(result[4]).toBe(102);
    });

    it('should calculate cost for 75% profit ratio', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];
      const percent = [75, 75, 75, 75, 75];

      const result = COST(close, volume, percent);

      // 75% with equal volumes should be around 106
      expect(result[4]).toBe(106);
    });

    it('should handle varying volumes correctly', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 5000, 1000, 1000]; // High volume at 104
      const percent = [50, 50, 50, 50, 50];

      const result = COST(close, volume, percent);

      // Total volume = 9000, 50% = 4500
      // Cumulative: 100(1000), 102(2000), 104(7000) -> reaches 4500 at 104
      expect(result[4]).toBe(104);
    });

    it('should use custom lookback period', () => {
      const close = [100, 102, 104, 106, 108, 110];
      const volume = [1000, 1000, 1000, 1000, 1000, 1000];
      const percent = [50, 50, 50, 50, 50, 50];

      const result = COST(close, volume, percent, 3);

      // At index 5: lookback 3, prices=[106,108,110]
      // 50% with equal volumes = 108
      expect(result[5]).toBe(108);
    });

    it('should handle single data point', () => {
      const close = [100];
      const volume = [1000];
      const percent = [50];

      const result = COST(close, volume, percent);

      expect(result[0]).toBe(100);
    });

    it('should handle edge case with all same prices', () => {
      const close = [100, 100, 100, 100];
      const volume = [1000, 1000, 1000, 1000];
      const percent = [50, 50, 50, 50];

      const result = COST(close, volume, percent);

      expect(result[3]).toBe(100);
    });

    it('should work with realistic percentages (10%, 90%)', () => {
      const close = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118];
      const volume = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];

      const cost10 = COST(close, volume, Array(10).fill(10));
      const cost90 = COST(close, volume, Array(10).fill(90));

      // 10% should be near bottom, 90% near top
      expect(cost10[9]).toBeLessThan(cost90[9]);
      expect(cost10[9]).toBeLessThanOrEqual(104);
      expect(cost90[9]).toBeGreaterThanOrEqual(114);
    });
  });

  describe('VALUEWHEN - Value When Condition is True', () => {
    it('should capture value when condition is first satisfied', () => {
      const cond = [0, 1, 0, 0, 0];
      const X = [10, 20, 30, 40, 50];

      const result = VALUEWHEN(cond, X);

      expect(result[0]).toBe(0); // No condition yet
      expect(result[1]).toBe(20); // Condition true, capture 20
      expect(result[2]).toBe(20); // Hold value
      expect(result[3]).toBe(20); // Hold value
      expect(result[4]).toBe(20); // Hold value
    });

    it('should update value when condition is satisfied again', () => {
      const cond = [0, 1, 0, 0, 1, 0];
      const X = [10, 20, 30, 40, 50, 60];

      const result = VALUEWHEN(cond, X);

      expect(result[0]).toBe(0); // No condition
      expect(result[1]).toBe(20); // First trigger
      expect(result[2]).toBe(20); // Hold
      expect(result[3]).toBe(20); // Hold
      expect(result[4]).toBe(50); // Second trigger, update to 50
      expect(result[5]).toBe(50); // Hold new value
    });

    it('should treat any non-zero as true', () => {
      const cond = [0, 5, 0, -1, 0, 0.5];
      const X = [10, 20, 30, 40, 50, 60];

      const result = VALUEWHEN(cond, X);

      expect(result[1]).toBe(20); // 5 is true
      expect(result[2]).toBe(20); // Hold
      expect(result[3]).toBe(40); // -1 is true
      expect(result[4]).toBe(40); // Hold
      expect(result[5]).toBe(60); // 0.5 is true
    });

    it('should work with CROSS signal pattern', () => {
      // Simulating a buy signal when MA5 crosses above MA10
      const crossSignal = [0, 0, 0, 1, 0, 0, 0, 1, 0];
      const closePrice = [100, 101, 102, 103, 104, 105, 106, 107, 108];

      const result = VALUEWHEN(crossSignal, closePrice);

      // Buy signal at index 3 and 7
      expect(result[3]).toBe(103); // First buy price
      expect(result[4]).toBe(103); // Hold
      expect(result[5]).toBe(103); // Hold
      expect(result[6]).toBe(103); // Hold
      expect(result[7]).toBe(107); // Second buy price
      expect(result[8]).toBe(107); // Hold
    });

    it('should handle continuous true conditions', () => {
      const cond = [1, 1, 1, 1];
      const X = [10, 20, 30, 40];

      const result = VALUEWHEN(cond, X);

      // Updates every time
      expect(result[0]).toBe(10);
      expect(result[1]).toBe(20);
      expect(result[2]).toBe(30);
      expect(result[3]).toBe(40);
    });

    it('should handle never true condition', () => {
      const cond = [0, 0, 0, 0];
      const X = [10, 20, 30, 40];

      const result = VALUEWHEN(cond, X);

      // Never triggers, stays at 0
      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should handle different array lengths', () => {
      const cond = [0, 1, 0, 0, 0];
      const X = [10, 20]; // Shorter X array

      const result = VALUEWHEN(cond, X);

      expect(result[1]).toBe(20); // Captures last X value
      expect(result[2]).toBe(20); // Holds
      expect(result[4]).toBe(20); // Still holds
    });

    it('should work for tracking entry prices', () => {
      // Realistic scenario: track entry price when RSI crosses below 30
      const rsiBelow30 = [0, 0, 1, 0, 0, 0, 1, 0];
      const close = [100, 98, 95, 96, 97, 99, 94, 95];

      const entryPrice = VALUEWHEN(rsiBelow30, close);

      expect(entryPrice[2]).toBe(95); // First entry
      expect(entryPrice[3]).toBe(95); // Hold entry price
      expect(entryPrice[6]).toBe(94); // New entry
      expect(entryPrice[7]).toBe(94); // Hold new entry
    });
  });

  describe('TOPRANGE - Check if Value is Recent High', () => {
    it('should detect highest value in default 20-period range', () => {
      const X = [100, 102, 104, 106, 108, 107, 105, 103];

      const result = TOPRANGE(X);

      expect(result[0]).toBe(1); // 100 is highest in [100]
      expect(result[1]).toBe(1); // 102 is highest in [100,102]
      expect(result[4]).toBe(1); // 108 is highest in [100..108]
      expect(result[5]).toBe(0); // 107 < 108
      expect(result[7]).toBe(0); // 103 < 108
    });

    it('should use custom period', () => {
      const X = [100, 102, 104, 106, 108, 110, 105];

      const result = TOPRANGE(X, 3);

      // At index 6: lookback 3, range=[108,110,105]
      // 105 is not the max (110 is), so 0
      expect(result[6]).toBe(0);

      // At index 5: lookback 3, range=[106,108,110]
      // 110 is the max, so 1
      expect(result[5]).toBe(1);
    });

    it('should handle multiple equal highs', () => {
      const X = [100, 110, 105, 110, 108];

      const result = TOPRANGE(X, 5);

      // At index 3: range=[100,110,105,110], max=110, current=110
      expect(result[3]).toBe(1);

      // At index 1: range=[100,110], max=110, current=110
      expect(result[1]).toBe(1);
    });

    it('should detect 20-day new high', () => {
      // Create a sequence where day 20 is a new high
      const X = Array(25).fill(0).map((_, i) => (i < 20 ? 100 + i : 119 - (i - 20)));
      X[20] = 130; // New high at day 20

      const result = TOPRANGE(X);

      expect(result[20]).toBe(1); // New 20-day high
      expect(result[21]).toBe(0); // Not a high anymore
    });

    it('should work with period 1', () => {
      const X = [100, 102, 101, 103];

      const result = TOPRANGE(X, 1);

      // Period 1 means only look at current value, always true
      expect(result).toEqual([1, 1, 1, 1]);
    });

    it('should handle flat data', () => {
      const X = [100, 100, 100, 100];

      const result = TOPRANGE(X, 3);

      // All values are equal, all are "highs"
      expect(result).toEqual([1, 1, 1, 1]);
    });

    it('should floor decimal period', () => {
      const X = [100, 102, 104, 106];

      const result = TOPRANGE(X, 2.7);

      // Should use period 2
      // At index 3: range=[104,106], max=106, current=106
      expect(result[3]).toBe(1);
    });

    it('should work for detecting breakouts', () => {
      // Stock consolidates then breaks out
      const high = [100, 101, 100, 101, 100, 101, 105, 108, 110];

      const result = TOPRANGE(high, 5);

      expect(result[6]).toBe(1); // Breakout at 105
      expect(result[7]).toBe(1); // New high at 108
      expect(result[8]).toBe(1); // New high at 110
    });
  });

  describe('LOWRANGE - Check if Value is Recent Low', () => {
    it('should detect lowest value in default 20-period range', () => {
      const X = [100, 98, 96, 94, 92, 93, 95, 97];

      const result = LOWRANGE(X);

      expect(result[0]).toBe(1); // 100 is lowest in [100]
      expect(result[1]).toBe(1); // 98 is lowest in [100,98]
      expect(result[4]).toBe(1); // 92 is lowest in [100..92]
      expect(result[5]).toBe(0); // 93 > 92
      expect(result[7]).toBe(0); // 97 > 92
    });

    it('should use custom period', () => {
      const X = [100, 98, 96, 94, 92, 90, 95];

      const result = LOWRANGE(X, 3);

      // At index 6: lookback 3, range=[92,90,95]
      // 95 is not the min (90 is), so 0
      expect(result[6]).toBe(0);

      // At index 5: lookback 3, range=[94,92,90]
      // 90 is the min, so 1
      expect(result[5]).toBe(1);
    });

    it('should handle multiple equal lows', () => {
      const X = [100, 90, 95, 90, 92];

      const result = LOWRANGE(X, 5);

      // At index 3: range=[100,90,95,90], min=90, current=90
      expect(result[3]).toBe(1);

      // At index 1: range=[100,90], min=90, current=90
      expect(result[1]).toBe(1);
    });

    it('should detect 20-day new low', () => {
      // Create a sequence where day 20 is a new low
      const X = Array(25).fill(0).map((_, i) => (i < 20 ? 100 - i : 81 + (i - 20)));
      X[20] = 70; // New low at day 20

      const result = LOWRANGE(X);

      expect(result[20]).toBe(1); // New 20-day low
      expect(result[21]).toBe(0); // Not a low anymore
    });

    it('should work with period 1', () => {
      const X = [100, 98, 99, 97];

      const result = LOWRANGE(X, 1);

      // Period 1 means only look at current value, always true
      expect(result).toEqual([1, 1, 1, 1]);
    });

    it('should handle flat data', () => {
      const X = [100, 100, 100, 100];

      const result = LOWRANGE(X, 3);

      // All values are equal, all are "lows"
      expect(result).toEqual([1, 1, 1, 1]);
    });

    it('should floor decimal period', () => {
      const X = [100, 98, 96, 94];

      const result = LOWRANGE(X, 2.7);

      // Should use period 2
      // At index 3: range=[96,94], min=94, current=94
      expect(result[3]).toBe(1);
    });

    it('should work for detecting support levels', () => {
      // Stock tests support level multiple times
      const low = [100, 99, 98, 97, 98, 99, 97, 98, 96];

      const result = LOWRANGE(low, 5);

      expect(result[3]).toBe(1); // New low at 97
      expect(result[6]).toBe(1); // Tests 97 again
      expect(result[8]).toBe(1); // Breaks support at 96
    });
  });

  describe('Integration and edge cases', () => {
    it('should use WINNER and COST together', () => {
      const close = [100, 102, 104, 106, 108];
      const volume = [1000, 1000, 1000, 1000, 1000];

      // Calculate cost price for 80% profit
      const cost80 = COST(close, volume, [80, 80, 80, 80, 80]);

      // At index 4, cost80 should be 106 (4/5 = 80%)
      expect(cost80[4]).toBe(106);

      // Check profit ratio at cost80 price
      const winnerAtCost80 = WINNER(close, volume, cost80);

      // At cost price 106, prices below 106: [100,102,104] = 3/5 = 0.6
      expect(winnerAtCost80[4]).toBe(0.6);
    });

    it('should use VALUEWHEN with TOPRANGE', () => {
      const high = [100, 105, 103, 108, 106, 110, 108];
      const volume = [1000, 1500, 1200, 1800, 1400, 2000, 1600];

      // Detect new highs
      const isNewHigh = TOPRANGE(high, 5);

      // Capture volume when new high occurs
      const highVolume = VALUEWHEN(isNewHigh, volume);

      // At index 5, new high, should capture volume 2000
      expect(isNewHigh[5]).toBe(1);
      expect(highVolume[5]).toBe(2000);
      expect(highVolume[6]).toBe(2000); // Holds value
    });

    it('should use VALUEWHEN with LOWRANGE', () => {
      const low = [100, 95, 97, 92, 94, 90, 92];
      const close = [102, 97, 99, 94, 96, 92, 94];

      // Detect new lows
      const isNewLow = LOWRANGE(low, 5);

      // Capture close price when new low occurs
      const lowClosePrice = VALUEWHEN(isNewLow, close);

      // At index 5, new low, should capture close 92
      expect(isNewLow[5]).toBe(1);
      expect(lowClosePrice[5]).toBe(92);
      expect(lowClosePrice[6]).toBe(92); // Holds value
    });

    it('should handle performance with large datasets', () => {
      // Create large dataset (1000 points)
      const size = 1000;
      const close = Array(size).fill(0).map((_, i) => 100 + Math.sin(i / 10) * 10);
      const volume = Array(size).fill(1000);
      const targetPrice = Array(size).fill(105);

      const startTime = Date.now();
      const result = WINNER(close, volume, targetPrice);
      const endTime = Date.now();

      expect(result.length).toBe(size);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle COST with large datasets efficiently', () => {
      const size = 1000;
      const close = Array(size).fill(0).map((_, i) => 100 + i * 0.1);
      const volume = Array(size).fill(1000);
      const percent = Array(size).fill(50);

      const startTime = Date.now();
      const result = COST(close, volume, percent);
      const endTime = Date.now();

      expect(result.length).toBe(size);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in < 200ms
    });
  });
});

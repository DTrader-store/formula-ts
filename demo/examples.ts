/**
 * Example formulas and sample market data for the demo
 */

import { MarketData } from '../src/types/MarketData';

/**
 * Predefined formula examples
 */
export const FORMULA_EXAMPLES: Record<string, string> = {
  ma: `// 移动平均线示例
MA5: MA(CLOSE, 5);
MA10: MA(CLOSE, 10);
MA20: MA(CLOSE, 20);

DRAW MA5, COLOR: RED;
DRAW MA10, COLOR: BLUE;
DRAW MA20, COLOR: GREEN;`,

  macd: `// MACD 指标
DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26);
DEA: EMA(DIF, 9);
MACD: (DIF - DEA) * 2;

DRAW DIF, COLOR: YELLOW;
DRAW DEA, COLOR: BLUE;
DRAW MACD, COLOR: RED;`,

  kdj: `// KDJ 指标
// 计算 RSV
RSV: (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;

// K、D、J 值
K: EMA(RSV, 3);
D: EMA(K, 3);
J: 3 * K - 2 * D;

DRAW K, COLOR: YELLOW;
DRAW D, COLOR: BLUE;
DRAW J, COLOR: MAGENTA;`,

  boll: `// 布林带
MID: MA(CLOSE, 20);
UPPER: MID + 2 * MA(CLOSE, 20);
LOWER: MID - 2 * MA(CLOSE, 20);

DRAW UPPER, COLOR: RED;
DRAW MID, COLOR: YELLOW;
DRAW LOWER, COLOR: GREEN;`,

  rsi: `// RSI 相对强弱指标
// 涨跌幅
CHANGE: CLOSE - REF(CLOSE, 1);

// 上涨和下跌
UP: IF(CHANGE > 0, CHANGE, 0);
DOWN: IF(CHANGE < 0, -CHANGE, 0);

// RSI
RSI6: MA(UP, 6) / (MA(UP, 6) + MA(DOWN, 6)) * 100;
RSI12: MA(UP, 12) / (MA(UP, 12) + MA(DOWN, 12)) * 100;

DRAW RSI6, COLOR: YELLOW;
DRAW RSI12, COLOR: BLUE;`,

  custom: `// 自定义策略示例 - 双均线交叉
SHORT: MA(CLOSE, 5);
LONG: MA(CLOSE, 20);

// 金叉信号
GOLDEN: CROSS(SHORT, LONG);

DRAW SHORT, COLOR: RED;
DRAW LONG, COLOR: BLUE;
DRAW GOLDEN, COLOR: YELLOW;`
};

/**
 * Generate sample market data for demonstration
 * This creates realistic candlestick data with some randomness
 */
export function generateSampleData(days: number = 100): MarketData[] {
  const data: MarketData[] = [];
  let basePrice = 100;

  for (let i = 0; i < days; i++) {
    // Add trend and noise
    const trend = Math.sin(i / 10) * 2;
    const noise = (Math.random() - 0.5) * 5;

    basePrice += trend + noise;
    basePrice = Math.max(50, Math.min(200, basePrice)); // Keep in range

    // Generate OHLC
    const open = basePrice + (Math.random() - 0.5) * 2;
    const close = basePrice + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;

    // Generate volume
    const volume = Math.floor(1000000 + Math.random() * 5000000);
    const amount = volume * ((high + low) / 2);

    data.push({
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      volume,
      amount
    });
  }

  return data;
}

/**
 * Sample real-world-like market data
 */
export const SAMPLE_MARKET_DATA: MarketData[] = [
  { open: 100.5, high: 102.3, low: 99.8, close: 101.2, volume: 1500000, amount: 151800000 },
  { open: 101.2, high: 103.5, low: 100.9, close: 102.8, volume: 1800000, amount: 184320000 },
  { open: 102.8, high: 104.2, low: 102.1, close: 103.5, volume: 2100000, amount: 217350000 },
  { open: 103.5, high: 105.8, low: 103.0, close: 104.9, volume: 2500000, amount: 262250000 },
  { open: 104.9, high: 106.2, low: 104.2, close: 105.5, volume: 2200000, amount: 232100000 },
  { open: 105.5, high: 107.0, low: 105.1, close: 106.3, volume: 1900000, amount: 201970000 },
  { open: 106.3, high: 107.5, low: 105.8, close: 106.9, volume: 1700000, amount: 181730000 },
  { open: 106.9, high: 108.2, low: 106.5, close: 107.8, volume: 1600000, amount: 172480000 },
  { open: 107.8, high: 109.5, low: 107.3, close: 108.9, volume: 2000000, amount: 217800000 },
  { open: 108.9, high: 110.2, low: 108.5, close: 109.5, volume: 2300000, amount: 251850000 },
  { open: 109.5, high: 111.0, low: 109.1, close: 110.3, volume: 2400000, amount: 264720000 },
  { open: 110.3, high: 112.5, low: 109.8, close: 111.8, volume: 2800000, amount: 313040000 },
  { open: 111.8, high: 113.2, low: 111.3, close: 112.5, volume: 2600000, amount: 292500000 },
  { open: 112.5, high: 114.0, low: 112.0, close: 113.2, volume: 2400000, amount: 271680000 },
  { open: 113.2, high: 115.5, low: 112.8, close: 114.8, volume: 2900000, amount: 332920000 },
  { open: 114.8, high: 116.2, low: 114.3, close: 115.5, volume: 2700000, amount: 311850000 },
  { open: 115.5, high: 117.0, low: 115.1, close: 116.3, volume: 2500000, amount: 290750000 },
  { open: 116.3, high: 118.5, low: 115.8, close: 117.9, volume: 3100000, amount: 365390000 },
  { open: 117.9, high: 119.2, low: 117.5, close: 118.5, volume: 2800000, amount: 331800000 },
  { open: 118.5, high: 120.0, low: 118.1, close: 119.3, volume: 2600000, amount: 310180000 },
  { open: 119.3, high: 121.5, low: 118.9, close: 120.8, volume: 3200000, amount: 386560000 },
  { open: 120.8, high: 122.2, low: 120.3, close: 121.5, volume: 2900000, amount: 352350000 },
  { open: 121.5, high: 123.0, low: 121.1, close: 122.3, volume: 2700000, amount: 330210000 },
  { open: 122.3, high: 124.5, low: 121.8, close: 123.9, volume: 3300000, amount: 408870000 },
  { open: 123.9, high: 125.2, low: 123.5, close: 124.5, volume: 3000000, amount: 373500000 },
];

/**
 * Get description for a formula example
 */
export function getFormulaDescription(key: string): string {
  const descriptions: Record<string, string> = {
    ma: '移动平均线 (MA) 用于平滑价格数据，识别趋势方向。',
    macd: 'MACD 是趋势跟踪动量指标，显示两个移动平均线之间的关系。',
    kdj: 'KDJ 是随机指标，用于识别超买和超卖条件。',
    boll: '布林带使用标准差来定义价格的高低区间，识别波动性。',
    rsi: 'RSI 测量价格变动的速度和变化，识别超买和超卖水平。',
    custom: '自定义策略示例，展示如何使用双均线交叉来生成交易信号。'
  };

  return descriptions[key] || '自定义公式';
}

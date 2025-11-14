/**
 * Main TypeScript file for the Formula-TS demo
 * Integrates the formula engine with TradingView Lightweight Charts
 */

import { createChart, IChartApi, ISeriesApi, ColorType } from 'lightweight-charts';
import { FormulaEngine } from '../src/FormulaEngine';
import { MarketData } from '../src/types/MarketData';
import { FormulaResult } from '../src/types/FormulaResult';
import { FORMULA_EXAMPLES, generateSampleData, getFormulaDescription } from './examples';

// Global state
let mainChart: IChartApi | null = null;
let indicatorChart: IChartApi | null = null;
let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
let marketData: MarketData[] = [];
let formulaEngine: FormulaEngine;

// Color palette for indicators
const COLORS = [
  '#58a6ff', // Blue
  '#3fb950', // Green
  '#d29922', // Yellow
  '#f85149', // Red
  '#bc8cff', // Purple
  '#ff7b72', // Pink
  '#79c0ff', // Light Blue
  '#56d364', // Light Green
];

/**
 * Initialize the application
 */
function init(): void {
  formulaEngine = new FormulaEngine();

  // Initialize charts
  initCharts();

  // Load sample data
  loadSampleData();

  // Setup event listeners
  setupEventListeners();

  console.log('Formula-TS Demo initialized');
}

/**
 * Initialize TradingView Charts
 */
function initCharts(): void {
  const mainChartContainer = document.getElementById('mainChart');
  const indicatorChartContainer = document.getElementById('indicatorChart');

  if (!mainChartContainer || !indicatorChartContainer) {
    console.error('Chart containers not found');
    return;
  }

  // Common chart options
  const chartOptions = {
    layout: {
      background: { type: ColorType.Solid, color: '#161b22' },
      textColor: '#9aa0a6',
    },
    grid: {
      vertLines: { color: '#30363d' },
      horzLines: { color: '#30363d' },
    },
    timeScale: {
      borderColor: '#30363d',
      timeVisible: true,
    },
    rightPriceScale: {
      borderColor: '#30363d',
    },
  };

  // Create main chart (for candlesticks and overlays)
  mainChart = createChart(mainChartContainer, {
    ...chartOptions,
    height: 400,
  });

  // Create indicator chart (for separate indicators like MACD, RSI)
  indicatorChart = createChart(indicatorChartContainer, {
    ...chartOptions,
    height: 200,
  });

  // Create candlestick series
  candlestickSeries = mainChart.addCandlestickSeries({
    upColor: '#3fb950',
    downColor: '#f85149',
    borderUpColor: '#3fb950',
    borderDownColor: '#f85149',
    wickUpColor: '#3fb950',
    wickDownColor: '#f85149',
  });

  // Sync time scales
  mainChart.timeScale().subscribeVisibleTimeRangeChange(() => {
    const timeRange = mainChart?.timeScale().getVisibleRange();
    if (timeRange && indicatorChart) {
      indicatorChart.timeScale().setVisibleRange(timeRange);
    }
  });

  indicatorChart.timeScale().subscribeVisibleTimeRangeChange(() => {
    const timeRange = indicatorChart?.timeScale().getVisibleRange();
    if (timeRange && mainChart) {
      mainChart.timeScale().setVisibleRange(timeRange);
    }
  });
}

/**
 * Load sample market data
 */
function loadSampleData(): void {
  marketData = generateSampleData(100);
  displayMarketData();
  showSuccess('示例数据已加载 (100 条记录)');
}

/**
 * Display market data on the chart
 */
function displayMarketData(): void {
  if (!candlestickSeries || marketData.length === 0) return;

  // Convert market data to chart format
  const candleData = marketData.map((item, index) => ({
    time: index, // Using index as time for demo
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));

  candlestickSeries.setData(candleData);
}

/**
 * Setup event listeners
 */
function setupEventListeners(): void {
  // Example selector
  const exampleSelect = document.getElementById('exampleSelect') as HTMLSelectElement;
  exampleSelect?.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    const key = target.value;
    if (key && FORMULA_EXAMPLES[key]) {
      const editor = document.getElementById('formulaEditor') as HTMLTextAreaElement;
      if (editor) {
        editor.value = FORMULA_EXAMPLES[key];
        showInfo(getFormulaDescription(key));
      }
    }
  });

  // Run button
  const runButton = document.getElementById('runButton');
  runButton?.addEventListener('click', executeFormula);

  // Clear button
  const clearButton = document.getElementById('clearButton');
  clearButton?.addEventListener('click', () => {
    const editor = document.getElementById('formulaEditor') as HTMLTextAreaElement;
    if (editor) editor.value = '';
    clearError();
    clearResults();
  });

  // Load data button
  const loadDataButton = document.getElementById('loadDataButton');
  loadDataButton?.addEventListener('click', loadSampleData);

  // Reset zoom button
  const resetZoomButton = document.getElementById('resetZoomButton');
  resetZoomButton?.addEventListener('click', () => {
    mainChart?.timeScale().fitContent();
    indicatorChart?.timeScale().fitContent();
  });
}

/**
 * Execute the formula
 */
function executeFormula(): void {
  const editor = document.getElementById('formulaEditor') as HTMLTextAreaElement;
  const formula = editor?.value.trim();

  if (!formula) {
    showError('请输入公式');
    return;
  }

  if (marketData.length === 0) {
    showError('请先加载市场数据');
    return;
  }

  try {
    clearError();
    clearResults();

    // Execute formula
    const result = formulaEngine.evaluate(formula, marketData);

    // Display results
    displayResults(result);

    // Draw indicators on chart
    drawIndicators(result);

    showSuccess('公式执行成功');
  } catch (error) {
    showError(error instanceof Error ? error.message : '执行错误');
    console.error('Formula execution error:', error);
  }
}

/**
 * Create a safe DOM element with text content
 */
function createElementWithText(tag: string, text: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

/**
 * Display formula results using safe DOM manipulation
 */
function displayResults(result: FormulaResult): void {
  const resultsDisplay = document.getElementById('resultsDisplay');
  if (!resultsDisplay) return;

  // Clear previous content
  resultsDisplay.textContent = '';

  // Display outputs
  if (result.outputs.length > 0) {
    const outputSection = createElementWithText('div', '输出:', 'result-section');
    outputSection.style.fontWeight = 'bold';
    resultsDisplay.appendChild(outputSection);

    result.outputs.forEach(output => {
      const lastValue = output.data[output.data.length - 1];
      const avgValue = output.data.reduce((sum, val) => sum + val, 0) / output.data.length;

      const item = document.createElement('div');
      item.className = 'result-item';

      const name = createElementWithText('span', `${output.name}:`, 'result-name');
      const value = createElementWithText(
        'span',
        `最新值 = ${lastValue.toFixed(2)}, 平均值 = ${avgValue.toFixed(2)}`,
        'result-value'
      );

      item.appendChild(name);
      item.appendChild(document.createTextNode(' '));
      item.appendChild(value);
      resultsDisplay.appendChild(item);
    });
  }

  // Display variables
  const varCount = Object.keys(result.variables).length;
  if (varCount > 0) {
    const varSection = createElementWithText('div', '变量:', 'result-section');
    varSection.style.fontWeight = 'bold';
    varSection.style.marginTop = '1rem';
    resultsDisplay.appendChild(varSection);

    Object.entries(result.variables).forEach(([name, values]) => {
      const lastValue = values[values.length - 1];

      const item = document.createElement('div');
      item.className = 'result-item';

      const nameSpan = createElementWithText('span', `${name}:`, 'result-name');
      const valueSpan = createElementWithText('span', lastValue.toFixed(2), 'result-value');

      item.appendChild(nameSpan);
      item.appendChild(document.createTextNode(' '));
      item.appendChild(valueSpan);
      resultsDisplay.appendChild(item);
    });
  }

  if (result.outputs.length === 0 && varCount === 0) {
    const placeholder = createElementWithText('p', '没有输出结果', 'placeholder');
    resultsDisplay.appendChild(placeholder);
  }
}

/**
 * Draw indicators on charts
 */
function drawIndicators(result: FormulaResult): void {
  if (!mainChart || !indicatorChart) return;

  // Clear previous indicators (keep candlestick)
  // Note: In a real implementation, you'd want to track and remove old series
  // For this demo, we'll create new charts or clear series manually

  let colorIndex = 0;

  result.outputs.forEach((output) => {
    const data = output.data.map((value, index) => ({
      time: index,
      value: value,
    }));

    // Determine which chart to use
    // Simple heuristic: if values are in similar range as prices, use main chart
    const avgValue = output.data.reduce((sum, val) => sum + val, 0) / output.data.length;
    const avgPrice = marketData.reduce((sum, d) => sum + d.close, 0) / marketData.length;

    const useMainChart = Math.abs(avgValue - avgPrice) < avgPrice * 0.5;

    const chart = useMainChart ? mainChart : indicatorChart;
    const color = COLORS[colorIndex % COLORS.length];
    colorIndex++;

    // Add line series
    const lineSeries = chart!.addLineSeries({
      color: color,
      lineWidth: 2,
      title: output.name,
    });

    lineSeries.setData(data);
  });

  // Fit content
  mainChart.timeScale().fitContent();
  indicatorChart.timeScale().fitContent();
}

/**
 * Show error message
 */
function showError(message: string): void {
  const errorDisplay = document.getElementById('errorDisplay');
  if (errorDisplay) {
    errorDisplay.textContent = message;
    errorDisplay.classList.add('show');
  }
}

/**
 * Clear error message
 */
function clearError(): void {
  const errorDisplay = document.getElementById('errorDisplay');
  if (errorDisplay) {
    errorDisplay.textContent = '';
    errorDisplay.classList.remove('show');
  }
}

/**
 * Show success message (could be enhanced with a toast notification)
 */
function showSuccess(message: string): void {
  console.log('Success:', message);
  // In a real app, you might show a toast notification here
}

/**
 * Show info message
 */
function showInfo(message: string): void {
  console.log('Info:', message);
  // In a real app, you might show this in the UI
}

/**
 * Clear results display
 */
function clearResults(): void {
  const resultsDisplay = document.getElementById('resultsDisplay');
  if (resultsDisplay) {
    resultsDisplay.textContent = '';
    const placeholder = createElementWithText('p', '执行公式后，结果将显示在此处...', 'placeholder');
    resultsDisplay.appendChild(placeholder);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

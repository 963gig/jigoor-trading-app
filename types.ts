export type AssetType = 'crypto' | 'forex';

export interface FibonacciLevels {
  level_0: string; // Swing High
  level_23_6: string;
  level_38_2: string;
  level_50: string;
  level_61_8: string;
  level_78_6: string;
  level_100: string; // Swing Low
}

export interface TradingSignal {
  assetName: string;
  assetType: AssetType;
  signal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' | 'Accumulate';
  analysis: string;
  currentPrice?: string;
  entryPrice: string;
  exitPrice: string;
  stopLoss?: string;
  timeline: string;
  newsAnalysis?: {
    summary: string;
    outlook: string;
  };
  newsSources?: GroundingSource[];
  fibonacciLevels?: FibonacciLevels;
}

export interface GroundingSource {
    uri: string;
    title: string;
}
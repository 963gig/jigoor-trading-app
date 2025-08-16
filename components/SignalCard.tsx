import React, { useState } from 'react';
import { TradingSignal, FibonacciLevels, AssetType } from '../types';
import { SourceLink } from './SourceLink';

interface SignalCardProps {
  signal: TradingSignal;
  usdToCadRate: number | null;
  onAnalyzeNews: (assetName: string, assetType: AssetType) => void;
  analyzingNewsFor: string | null;
}

const getSignalColor = (signal: TradingSignal['signal']): string => {
  switch (signal) {
    case 'Strong Buy':
    case 'Buy':
    case 'Accumulate':
      return 'bg-green-500 text-green-50';
    case 'Sell':
    case 'Strong Sell':
      return 'bg-red-500 text-red-50';
    case 'Hold':
    default:
      return 'bg-yellow-500 text-yellow-50';
  }
};

const getOutlookColor = (outlook: string): string => {
    const outlookLower = outlook.toLowerCase();
    if (outlookLower.includes('bullish')) return 'bg-green-100 text-green-800';
    if (outlookLower.includes('bearish')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
};

const getSignalIcon = (signal: TradingSignal['signal']): React.ReactNode => {
    switch (signal) {
        case 'Strong Buy':
        case 'Buy':
        case 'Accumulate':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>;
        case 'Sell':
        case 'Strong Sell':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-4.293a1 1 0 001.414 1.414L10 14.414l.293.293a1 1 0 001.414-1.414L11.414 13l1.293-1.293a1 1 0 00-1.414-1.414L10 11.586l-.293-.293a1 1 0 00-1.414 1.414L8.586 13 7.293 14.293a1 1 0 000 1.414z" clipRule="evenodd" /></svg>;
        case 'Hold':
        default:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm-2 5a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" clipRule="evenodd" /></svg>;
    }
}

const convertPriceToCAD = (usdPrice: string, rate: number | null): string => {
    if (!rate || !usdPrice || usdPrice.toLowerCase() === 'n/a') {
        return '';
    }
    
    // Remove characters like $, ,, and trim whitespace
    const cleanedPrice = usdPrice.replace(/[$,]/g, '').trim();
    
    // Split by '-' to handle ranges
    const priceParts = cleanedPrice.split('-').map(p => p.trim());
    
    const convertedParts = priceParts.map(part => {
        const num = parseFloat(part);
        if (isNaN(num)) {
            return null; // Invalid number part
        }
        const cadValue = num * rate;
        // Format as a number with 2 decimal places and Canadian locale for commas
        return new Intl.NumberFormat('en-CA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(cadValue);
    });

    // If any part failed conversion, return empty
    if (convertedParts.some(p => p === null)) {
        return '';
    }

    // Join parts and append the desired currency indicator
    return `${convertedParts.join(' - ')} $CAD`;
};

// Define a specific order for rendering Fibonacci levels
const FIB_LEVEL_ORDER: Array<keyof FibonacciLevels> = [
    'level_0', 'level_23_6', 'level_38_2', 'level_50', 'level_61_8', 'level_78_6', 'level_100'
];

export const SignalCard: React.FC<SignalCardProps> = ({ signal, usdToCadRate, onAnalyzeNews, analyzingNewsFor }) => {
  const [isFibonacciVisible, setIsFibonacciVisible] = useState(false);
  const signalColor = getSignalColor(signal.signal);
  const isAnalyzingThisCard = analyzingNewsFor === signal.assetName;
  const isAnyCardAnalyzing = analyzingNewsFor !== null;
  const fibId = `fib-levels-${signal.assetName.replace(/[/\s]+/g, '-')}`;
  const { assetType } = signal;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg p-6 shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-amber-500/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-2xl font-bold text-brand-dark">{signal.assetName}</h3>
        <div className={`flex items-center gap-2 text-lg font-bold px-4 py-1 rounded-full ${signalColor}`}>
          {getSignalIcon(signal.signal)}
          <span>{signal.signal}</span>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold text-lg text-brand-subtext mb-2">Analysis:</h4>
        <p className="text-brand-dark leading-relaxed">{signal.analysis}</p>
      </div>

      {(signal.currentPrice || signal.entryPrice || signal.exitPrice) && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {signal.currentPrice && (
            <div className="p-3 bg-blue-200 rounded-lg text-center">
              <h5 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Current Price</h5>
              <p className="text-xl font-bold text-blue-900 mt-1 flex justify-center items-baseline flex-wrap gap-x-2">
                  <span>{signal.currentPrice}</span>
                  {assetType === 'crypto' && usdToCadRate && (
                      <span className="text-sm font-normal text-gray-600">
                          ({convertPriceToCAD(signal.currentPrice, usdToCadRate)})
                      </span>
                  )}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <h5 className="text-sm font-semibold text-brand-subtext uppercase tracking-wider">Entry Price</h5>
              <p className="text-lg font-bold text-brand-dark mt-1 flex justify-center items-baseline flex-wrap gap-x-2">
                  <span>{signal.entryPrice || 'N/A'}</span>
                  {assetType === 'crypto' && usdToCadRate && (
                      <span className="text-sm font-normal text-gray-500">
                          ({convertPriceToCAD(signal.entryPrice, usdToCadRate)})
                      </span>
                  )}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg text-center">
              <h5 className="text-sm font-semibold text-green-800 uppercase tracking-wider">Exit Price</h5>
              <p className="text-lg font-bold text-green-900 mt-1 flex justify-center items-baseline flex-wrap gap-x-2">
                  <span>{signal.exitPrice || 'N/A'}</span>
                  {assetType === 'crypto' && usdToCadRate && (
                      <span className="text-sm font-normal text-gray-500">
                          ({convertPriceToCAD(signal.exitPrice, usdToCadRate)})
                      </span>
                  )}
              </p>
            </div>
            {signal.stopLoss && (
              <div className="p-3 bg-orange-200 rounded-lg text-center">
                <h5 className="text-sm font-semibold text-orange-800 uppercase tracking-wider">Stop Loss</h5>
                <p className="text-lg font-bold text-orange-900 mt-1 flex justify-center items-baseline flex-wrap gap-x-2">
                    <span>{signal.stopLoss}</span>
                    {assetType === 'crypto' && usdToCadRate && (
                        <span className="text-sm font-normal text-gray-500">
                            ({convertPriceToCAD(signal.stopLoss, usdToCadRate)})
                        </span>
                    )}
                </p>
              </div>
            )}
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <h5 className="text-sm font-semibold text-brand-subtext uppercase tracking-wider">Timeline</h5>
              <p className="text-lg font-bold text-brand-dark mt-1">{signal.timeline || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        {!signal.newsAnalysis && !isAnalyzingThisCard && (
          <button
            onClick={() => onAnalyzeNews(signal.assetName, signal.assetType)}
            disabled={isAnyCardAnalyzing}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>Analyze Live News</span>
          </button>
        )}

        {isAnalyzingThisCard && (
          <div className="flex flex-col items-center justify-center p-4 text-brand-subtext">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            <p className="mt-3">Scanning live news and market sentiment...</p>
          </div>
        )}

        {signal.newsAnalysis && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg text-brand-subtext">Live News Analysis:</h4>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${getOutlookColor(signal.newsAnalysis.outlook)}`}>
                    {signal.newsAnalysis.outlook}
                </span>
            </div>
            <p className="text-brand-dark leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-200">
              {signal.newsAnalysis.summary}
            </p>
            {signal.newsSources && signal.newsSources.length > 0 && (
                <div>
                    <h5 className="text-sm font-semibold text-brand-subtext mb-2">Sources:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {signal.newsSources.map((source, index) => (
                            <SourceLink key={index} source={source} />
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
      
      {signal.fibonacciLevels && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsFibonacciVisible(!isFibonacciVisible)}
              className="w-full flex justify-between items-center text-left py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-expanded={isFibonacciVisible}
              aria-controls={fibId}
            >
              <h4 className="font-semibold text-lg text-brand-subtext">Key Fibonacci Levels</h4>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-brand-subtext transform transition-transform duration-300 ${isFibonacciVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              id={fibId}
              className={`transition-all duration-500 ease-in-out overflow-hidden ${isFibonacciVisible ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
            >
                <div className="space-y-2">
                  {FIB_LEVEL_ORDER.map(levelKey => {
                    const price = signal.fibonacciLevels?.[levelKey];
                    if (!price) return null;

                    const percentage = parseFloat(levelKey.split('_')[1].replace('_', '.'));
                    
                    let colorClass = 'bg-gray-100 text-gray-800';
                    if (percentage <= 38.2) colorClass = 'bg-red-100 text-red-800';
                    else if (percentage >= 61.8) colorClass = 'bg-green-100 text-green-800';
                    else colorClass = 'bg-yellow-100 text-yellow-800';

                    return (
                      <div key={levelKey} className={`flex justify-between items-center p-2 rounded-md transition-colors ${colorClass}`}>
                        <span className="font-semibold">{percentage.toFixed(1)}% {levelKey === 'level_0' ? '(High)' : levelKey === 'level_100' ? '(Low)' : ''}</span>
                        <span className="font-bold text-md sm:text-lg">{price}</span>
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>
      )}
    </div>
  );
};
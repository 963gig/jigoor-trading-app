import React, { useState, useCallback } from 'react';
import { SignalCard } from './components/SignalCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchTradingSignals as fetchGeminiSignals, fetchNewsAnalysis } from './services/geminiService';
import { TradingSignal, GroundingSource, AssetType } from './types';
import { BrandLogo } from './components/BrandLogo';
import { SourceLink } from './components/SourceLink';
import { CoinInput } from './components/CoinInput';

// Define the priority order for sorting signals. Lower number = higher priority.
const signalPriority: Record<TradingSignal['signal'], number> = {
  'Strong Buy': 1,
  'Buy': 2,
  'Accumulate': 3,
  'Hold': 4,
  'Sell': 5,
  'Strong Sell': 6,
};

const ApiKeyError: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="font-sans p-8 text-center text-red-800 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto shadow-lg">
      <h1 className="text-2xl font-bold">Application Configuration Error</h1>
      <p className="mt-4">
        The Google Gemini API key is missing or could not be loaded. The application cannot start without it.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Please ensure the <code className="bg-red-100 p-1 rounded">API_KEY</code> environment variable is correctly set in your deployment service (e.g., Netlify) and the site has been redeployed.
      </p>
    </div>
  </div>
);


const App: React.FC = () => {
  // Check for the API key at the very beginning of the component's lifecycle.
  // This is a robust way to ensure the app doesn't run without its configuration.
  const apiKey = (window as any).process?.env?.API_KEY;
  if (!apiKey) {
    return <ApiKeyError />;
  }

  const [tags, setTags] = useState<string[]>(['BTC', 'ETH', 'EURUSD']);
  const [inputValue, setInputValue] = useState('');
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzingNewsFor, setAnalyzingNewsFor] = useState<string | null>(null);
  // Using a static rate for reliability instead of a live API call.
  const [usdToCadRate] = useState<number>(1.37);

  const handleSearch = useCallback(async () => {
    // Split any remaining input value by space or comma, and combine with existing tags
    const finalTags = inputValue
      .split(/[\s,]+/)
      .map(tag => tag.trim().toUpperCase())
      .filter(Boolean); // remove empty strings

    // Combine with existing tags and remove duplicates using a Set
    const allTags = [...new Set([...tags, ...finalTags])];

    if (allTags.length === 0) {
      setError(`Please enter at least one ticker or pair.`);
      return;
    }

    // Update state for UI and clear input
    setTags(allTags);
    setInputValue('');
    
    setIsLoading(true);
    setError(null);
    setSignals([]);
    setSources([]);

    try {
      const result = await fetchGeminiSignals(allTags);
      
      // Sort signals based on profitability/importance
      const sortedSignals = [...result.signals].sort((a, b) => {
        const priorityA = signalPriority[a.signal] ?? 99;
        const priorityB = signalPriority[b.signal] ?? 99;
        return priorityA - priorityB;
      });

      setSignals(sortedSignals);
      setSources(result.sources);
    } catch (e) {
      const err = e as Error;
      setError(`Failed to fetch signals from Gemini AI. ${err.message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [tags, inputValue]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const addTag = (tagsToAdd: string) => {
    // Split by comma or space, filter out empty strings, and find unique new tags
    const newTags = tagsToAdd
      .split(/[\s,]+/)
      .map(tag => tag.trim().toUpperCase())
      .filter(tag => tag && !tags.includes(tag));

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
    }
    setInputValue(''); // Clear input after adding
  };
  
  const handleNewsAnalysis = useCallback(async (assetNameToAnalyze: string, assetType: AssetType) => {
    setAnalyzingNewsFor(assetNameToAnalyze);
    setError(null);

    try {
        const result = await fetchNewsAnalysis(assetNameToAnalyze, assetType);

        setSignals(prevSignals => {
            return prevSignals.map(signal => {
                if (signal.assetName === assetNameToAnalyze) {
                    return {
                        ...signal,
                        newsAnalysis: result.analysis,
                        newsSources: result.sources,
                    };
                }
                return signal;
            });
        });
    } catch (e) {
        const err = e as Error;
        setError(`Failed to fetch news analysis. ${err.message}`);
        console.error(e);
    } finally {
        setAnalyzingNewsFor(null);
    }
  }, []);

  const placeholder = "Enter tickers or pairs (e.g., BTC, EURUSD)";

  return (
    <div className="min-h-screen bg-brand-background text-brand-dark font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <BrandLogo />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-red-600 text-transparent bg-clip-text">
            Jigoor Trading Signal
          </h1>
        </div>
        <p className="text-brand-subtext text-lg mb-6">
          Find your next crypto or forex trade. <br/> Enter tickers/pairs, then press Enter or click the button to search.
        </p>
      </header>

      <main className="w-full max-w-4xl">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2 mb-8">
          <CoinInput 
            tags={tags} 
            setTags={setTags}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onAddTag={addTag}
            placeholder={placeholder}
          />
          <button
            type="submit"
            disabled={isLoading || (tags.length === 0 && inputValue.trim() === '')}
            className="w-full sm:w-auto flex-shrink-0 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner /> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
            <span>{isLoading ? 'Searching...' : 'Find Signals'}</span>
          </button>
        </form>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg text-center">{error}</div>}
        
        {isLoading && (
            <div className="text-center p-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                <p className="mt-4 text-brand-subtext">
                  Analyzing market data...
                </p>
            </div>
        )}

        {!isLoading && signals.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Trading Signals Found
            </h2>
            {signals.map((signal, index) => (
              <SignalCard 
                key={`${signal.assetName}-${index}`} 
                signal={signal} 
                usdToCadRate={usdToCadRate}
                onAnalyzeNews={handleNewsAnalysis}
                analyzingNewsFor={analyzingNewsFor}
              />
            ))}
          </div>
        )}
        
        {!isLoading && sources.length > 0 && (
          <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-300 shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-brand-subtext">Analysis Sources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sources.map((source, index) => (
                      <SourceLink key={index} source={source} />
                  ))}
              </div>
          </div>
        )}

        {!isLoading && !error && signals.length === 0 && (
            <div className="text-center text-brand-subtext mt-12 p-8 bg-white/60 backdrop-blur-sm rounded-lg">
                <p>
                  Enter one or more cryptocurrency tickers or forex pairs above to get started.
                </p>
                <p className="text-sm mt-2">
                  e.g., BTC, ETH, SOL, EURUSD, GBPJPY
                </p>
            </div>
        )}

      </main>
      <footer className="mt-12 text-center text-brand-subtext text-sm space-y-2">
        <p>
            Signals are for informational purposes only.
        </p>
        <p>
            <strong>Disclaimer:</strong> This app is for educational purposes and is not financial advice. Please act wisely and do not risk money you cannot afford to lose.
        </p>
      </footer>
    </div>
  );
};

export default App;

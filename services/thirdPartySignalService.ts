
import { TradingSignal } from '../types';

// IMPORTANT: The following values are placeholders.
const API_BASE_URL = 'https://api.example-crypto-signals.com/v1/latest'; // <-- REPLACE with actual API endpoint
const API_KEY = 'tm-49131308-82dd-44ef-885e-43bb101a30aa'; // Your key

const allMockSignals: TradingSignal[] = [
    {
        assetName: 'Chainlink (LINK)',
        assetType: 'crypto',
        signal: 'Strong Buy',
        analysis: 'Data from external API shows a strong accumulation pattern for LINK, with on-chain metrics pointing to an imminent breakout above the $20 resistance level.',
        currentPrice: '$18.85',
        entryPrice: '$18.50 - $19.00',
        exitPrice: '$25.00',
        stopLoss: '$17.00',
        timeline: '2-3 weeks',
    },
    {
        assetName: 'Avalanche (AVAX)',
        assetType: 'crypto',
        signal: 'Hold',
        analysis: 'AVAX is currently consolidating. The API data suggests waiting for a clear break of the current range before entering a new position.',
        currentPrice: '$36.50',
        entryPrice: 'N/A',
        exitPrice: 'N/A',
        stopLoss: 'N/A',
        timeline: '1 week',
    },
    {
        assetName: 'Cardano (ADA)',
        assetType: 'crypto',
        signal: 'Sell',
        analysis: 'According to the signal provider, Cardano has hit a major resistance point and is expected to pull back in the short term.',
        currentPrice: '$0.47',
        entryPrice: '$0.48 - $0.49',
        exitPrice: '$0.42',
        stopLoss: '$0.51',
        timeline: '4-6 days',
    },
    {
        assetName: 'Bitcoin (BTC)',
        assetType: 'crypto',
        signal: 'Buy',
        analysis: 'Mock API data suggests Bitcoin is holding a key support level and is poised for a move higher. Institutional interest remains strong.',
        currentPrice: '$67,300',
        entryPrice: '$67,000 - $67,500',
        exitPrice: '$71,000',
        stopLoss: '$65,000',
        timeline: '1-2 weeks',
    },
    {
        assetName: 'Ethereum (ETH)',
        assetType: 'crypto',
        signal: 'Hold',
        analysis: 'Mock API suggests ETH is in a consolidation phase before its next major move. Watch for a breakout above $3,800.',
        currentPrice: '$3,550',
        entryPrice: 'N/A',
        exitPrice: 'N/A',
        stopLoss: 'N/A',
        timeline: '2 weeks',
    },
    {
        assetName: 'Solana (SOL)',
        assetType: 'crypto',
        signal: 'Buy',
        analysis: 'Solana is showing strong support at the $150 level, with potential for a bounce towards the next resistance. Trading volume has increased, suggesting accumulation.',
        currentPrice: '$152.70',
        entryPrice: '$150 - $155',
        exitPrice: '$175',
        stopLoss: '$142',
        timeline: '5-7 days',
    },
];

/**
 * Fetches trading signals from the third-party API.
 * 
 * NOTE: This is a placeholder implementation.
 * @param query A comma-separated string of coin tickers.
 * @param numSignals The number of signals requested.
 * @returns A promise that resolves to an array of trading signals.
 */
export const fetchThirdPartySignals = async (query: string, numSignals: number): Promise<TradingSignal[]> => {
    console.log(`Fetching signals from third-party API for query: "${query}" with a limit of ${numSignals} signals.`);

    // --- Placeholder: Simulating API call ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    const requestedCoins = query.toUpperCase().split(',').filter(c => c.trim() !== '');

    if (requestedCoins.length > 0) {
        const filteredSignals = allMockSignals.filter(signal => 
            requestedCoins.some(coin => signal.assetName.toUpperCase().includes(`(${coin})`))
        );
        // If we found any signals matching the query, return them.
        if (filteredSignals.length > 0) {
            return filteredSignals;
        }
    }
    
    // Fallback for general queries or if no specific coins are found
    return allMockSignals.slice(0, numSignals);
};
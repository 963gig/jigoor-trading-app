
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TradingSignal, GroundingSource, AssetType } from '../types';

let ai: GoogleGenAI | null = null;

// Lazily initialize the AI client on first use to ensure the API key is available.
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }

    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set or not available at the time of API call.");
    }
    
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
};


const parseJsonResponse = (text: string): TradingSignal[] => {
    try {
        // The model might wrap the JSON in markdown backticks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);
        if (data && Array.isArray(data.signals)) {
            return data.signals;
        }
        // Fallback for flat array structure
        if (Array.isArray(data)) {
            return data;
        }
        throw new Error("Parsed JSON does not contain a 'signals' array.");
    } catch (error) {
        console.error("Failed to parse JSON response from AI:", text, error);
        throw new Error("The AI returned a response in an unexpected format. Please try again.");
    }
};

const parseNewsAnalysisResponse = (text: string): { summary: string, outlook: string } => {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);
        if (data && typeof data.summary === 'string' && typeof data.outlook === 'string') {
            return data;
        }
        throw new Error("Parsed JSON does not contain 'summary' and 'outlook' properties.");
    } catch (error) {
        console.error("Failed to parse news analysis JSON response from AI:", text, error);
        throw new Error("The AI returned a news analysis in an unexpected format. Please try again.");
    }
};

export const fetchNewsAnalysis = async (assetName: string, assetType: AssetType): Promise<{ analysis: { summary: string; outlook: string; }, sources: GroundingSource[] }> => {
    const aiClient = getAiClient();
    const model = 'gemini-2.5-flash';

    const specialization = assetType === 'crypto' ? 'cryptocurrency' : 'Forex markets';

    const prompt = `
        You are a financial analyst specializing in ${specialization}. Your task is to analyze the absolute latest news and market sentiment for ${assetName}.
        Use your web search capabilities to find breaking news, economic data releases, central bank statements, and social media sentiment from the last 24-48 hours.

        Based on your findings, provide:
        1.  A "summary": A concise 2-3 sentence summary of the key news and sentiment drivers affecting ${assetName}.
        2.  An "outlook": A single-word revised outlook based on the news. The outlook must be one of the following: "Bullish", "Slightly Bullish", "Neutral", "Slightly Bearish", "Bearish".

        Your final output MUST be a single, valid JSON object with two keys: "summary" and "outlook". Do not include any other text or formatting.
        
        Example JSON structure:
        {
          "summary": "Recent positive developments regarding a partnership with a major tech firm have boosted investor confidence. Social media sentiment is overwhelmingly positive, pointing towards a potential short-term price increase.",
          "outlook": "Bullish"
        }
    `;

    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const analysis = parseNewsAnalysisResponse(response.text);
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources: GroundingSource[] = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled Source'
            }))
            .filter(source => source.uri) || [];

        const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

        return { analysis, sources: uniqueSources };

    } catch (error) {
        console.error(`Error fetching news analysis for ${assetName} from Gemini API:`, error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching news analysis.");
    }
};


export const fetchTradingSignals = async (tags: string[]): Promise<{ signals: TradingSignal[], sources: GroundingSource[] }> => {
    const aiClient = getAiClient();
    const model = 'gemini-2.5-flash';

    const prompt = `
        You are an expert financial analyst specializing in both cryptocurrency and Forex markets.
        The user wants a detailed trading signal analysis for the following assets: ${tags.join(', ')}.

        For each of the ${tags.length} assets requested, perform the following steps:
        1.  Identify whether the asset is a 'crypto' or 'forex' pair.
        2.  Provide a single, detailed trading signal analysis based on its type.

        For each signal you identify, provide:
        1.  The asset name (e.g., "Bitcoin (BTC)" for crypto, "EUR/USD" for forex).
        2.  The asset type, which MUST be either "crypto" or "forex".
        3.  The signal type (e.g., "Strong Buy", "Buy", "Accumulate", "Hold", "Sell", "Strong Sell").
        4.  A concise, data-driven analysis (2-3 sentences) explaining the reason for the signal. Use your web search capabilities to find the most up-to-date information, including economic data for forex and on-chain metrics for crypto.
        5.  The asset's current price.
        6.  A target entry price range.
        7.  A target exit price for taking profit.
        8.  A stop loss price for risk management.
        9.  An estimated trade timeline (e.g., "1-3 days", "2 weeks", "Intraday").
        10. Key Fibonacci Retracement Levels based on the most recent significant swing high and swing low.
        
        Your final output MUST be a single, valid JSON object with a single key "signals" which is an array of signal objects. Do not include any other text or formatting.
        The number of objects in the "signals" array should be exactly ${tags.length}.
        The JSON object for each signal must contain these exact keys: "assetName", "assetType", "signal", "analysis", "currentPrice", "entryPrice", "exitPrice", "stopLoss", "timeline", and "fibonacciLevels".
        The "fibonacciLevels" object must contain keys for the 0% (swing high), 23.6%, 38.2%, 50%, 61.8%, 78.6%, and 100% (swing low) levels, with keys like "level_0", "level_23_6", etc.

        Example JSON structure for a mixed request of "BTC" and "EURUSD":
        {
          "signals": [
            {
              "assetName": "Bitcoin (BTC)",
              "assetType": "crypto",
              "signal": "Strong Buy",
              "analysis": "Bitcoin is showing strong bullish momentum after breaking a key resistance level. Increased institutional inflow supports a continued upward trend.",
              "currentPrice": "$69,123.45",
              "entryPrice": "$68,500 - $69,200",
              "exitPrice": "$74,000",
              "stopLoss": "$66,500",
              "timeline": "1-2 weeks",
              "fibonacciLevels": { "level_0": "$73,777", "level_23_6": "$70,100", "level_38_2": "$67,950", "level_50": "$66,200", "level_61_8": "$64,450", "level_78_6": "$62,100", "level_100": "$58,623" }
            },
            {
              "assetName": "EUR/USD",
              "assetType": "forex",
              "signal": "Sell",
              "analysis": "The EUR/USD is facing strong resistance at the 1.0850 level. Hawkish comments from the Federal Reserve are strengthening the USD.",
              "currentPrice": "1.0845",
              "entryPrice": "1.0830 - 1.0850",
              "exitPrice": "1.0720",
              "stopLoss": "1.0890",
              "timeline": "3-5 days",
              "fibonacciLevels": { "level_0": "1.0916", "level_23_6": "1.0855", "level_38_2": "1.0818", "level_50": "1.0788", "level_61_8": "1.0758", "level_78_6": "1.0718", "level_100": "1.0660" }
            }
          ]
        }
    `;

    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const signals = parseJsonResponse(response.text);
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources: GroundingSource[] = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled Source'
            }))
            .filter(source => source.uri) || [];

        // Deduplicate sources based on URI
        const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

        return { signals, sources: uniqueSources };

    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching trading signals.");
    }
};

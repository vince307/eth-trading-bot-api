import Coingecko from "@coingecko/coingecko-typescript";
// import { insert } from "./supabaseController";
// Initialize a single, reusable client instance.
// This is the recommended approach for application-wide use.
export const client = new Coingecko({
	// proAPIKey is used for paid plans. For the free public API, this is not needed.
	//   proAPIKey: process.env.COINGECKO_PRO_API_KEY,
	demoAPIKey: process.env.COINGECKO_DEMO_API_KEY, // Optional, for Demo API access
	maxRetries: 3, // The SDK handles automatic retries for rate limits.
	environment: "demo", // 'demo' to initialize the client with Demo API access
});

export async function getBitcoinPrice(): Promise<number | null> {
	try {
		const params: Coingecko.Simple.PriceGetParams = {
			ids: "bitcoin",
			vs_currencies: "usd",
			include_market_cap: true,
			include_24hr_vol: true,
			include_24hr_change: true,
			include_last_updated_at: true,
			precision: "2",
		};
		const priceData: Coingecko.Simple.PriceGetResponse =
			await client.simple.price.get(params);
		return priceData?.bitcoin?.usd || null;
	} catch (err) {
		if (err instanceof Coingecko.RateLimitError) {
			console.error("Rate limit exceeded. Try again later.");
		} else {
			console.error("An error occurred:", err);
		}
		return null;
	}
}

/**
 * Fetches the current price and market data for Ethereum (ETH) in USD.
 *
 * @returns A Promise resolving to the price of Ethereum in USD, or null if an error occurs.
 */
export async function fetchBitcoinPriceData(): Promise<Coingecko.Coins.MarketChartGetResponse | null> {
	try {
		const priceData: Coingecko.Coins.MarketChartGetResponse =
			await client.coins.marketChart.get("bitcoin", {
				days: "days",
				vs_currency: "usd",
			});
		return priceData || null;
	} catch (err) {
		if (err instanceof Coingecko.RateLimitError) {
			console.error("Rate limit exceeded. Try again later.");
		} else {
			console.error("An error occurred:", err);
		}
		return null;
	}
}

/**
 * Fetches the current price and market data for Ethereum (ETH) in USD.
 *
 * @returns A Promise resolving to the price of Ethereum in USD, or null if an error occurs.
 */
// export async function fetchBitcoinPriceDataPastMonth(): Promise<Coingecko.Coins.MarketChartGetResponse | null> {
// 	try {
// 		insert();
// 		const to = Math.floor(Date.now() / 1000); // Current time in seconds
// 		const from = to - 30 * 24 * 60 * 60; // 30 days in seconds

// 		const priceData: Coingecko.Coins.MarketChartGetResponse =
// 			await client.coins.marketChart.getRange("bitcoin", {
// 				from,
// 				to,
// 				vs_currency: "usd",
// 			});
// 		return priceData || null;
// 	} catch (err) {
// 		if (err instanceof Coingecko.RateLimitError) {
// 			console.error("Rate limit exceeded. Try again later.");
// 		} else {
// 			console.error("An error occurred:", err);
// 		}
// 		return null;
// 	}
// }

/**
 * Fetches historical price data for Bitcoin for a custom date range.
 *
 * @param from - The start timestamp (in seconds) for the range.
 * @param to - The end timestamp (in seconds) for the range.
 * @returns A Promise resolving to the market chart data for Bitcoin within the specified range, or null if an error occurs.
 */
// export async function fetchBitcoinPriceDataPastDay(): Promise<Coingecko.Coins.MarketChartGetRangeResponse | null> {
// 	try {
// 		const to = Math.floor(Date.now() / 1000); // Current time in seconds
// 		const from = to - 1 * 24 * 60 * 60; // 1 day in seconds

// 		const priceData: Coingecko.Coins.MarketChartGetRangeResponse =
// 			await client.coins.marketChart.getRange("bitcoin", {
// 				from,
// 				to,
// 				vs_currency: "usd",
// 			});
// 		return priceData || null;
// 	} catch (err) {
// 		if (err instanceof Coingecko.RateLimitError) {
// 			console.error("Rate limit exceeded. Try again later.");
// 		} else {
// 			console.error("An error occurred:", err);
// 		}
// 		return null;
// 	}
// }

export interface ETHData {
	created_at?: string;
	usd: number;
	usd_market_cap: number;
	usd_24h_vol: number;
	usd_24h_change: number;
	last_updated_at: number;
}

export async function fetchETHData(): Promise<ETHData | null> {
	try {
		const params: Coingecko.Simple.PriceGetParams = {
			ids: "ethereum",
			vs_currencies: "usd",
			include_market_cap: true,
			include_24hr_vol: true,
			include_24hr_change: true,
			include_last_updated_at: true,
			precision: "2",
		};
		const priceData: Coingecko.Simple.PriceGetResponse =
			await client.simple.price.get(params);

		const ethData = priceData?.ethereum;
		if (!ethData) {
			return null;
		}

		return {
			created_at: new Date().toISOString(),
			usd: ethData.usd || 0,
			usd_market_cap: ethData.usd_market_cap || 0,
			usd_24h_vol: ethData.usd_24h_vol || 0,
			usd_24h_change: ethData.usd_24h_change || 0,
			last_updated_at: ethData.last_updated_at || 0,
		};
	} catch (err) {
		if (err instanceof Coingecko.RateLimitError) {
			console.error("Rate limit exceeded. Try again later.");
		} else {
			console.error("An error occurred:", err);
		}
		return null;
	}
}

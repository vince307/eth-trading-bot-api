import { Request, Response } from "express";
import { scrapeUrl } from "./firecrawlController";
// import { getBitcoinPrice, fetchBitcoinPriceDataPastDay } from "./coinGeckoController";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_ANON_KEY || "",
);

/**
 * Aggregates data from web scraping and CoinGecko, then stores it in Supabase
 *
 * @param url - The URL to scrape data from
 * @returns A Promise resolving to the aggregated data record, or null if an error occurs
 */
// export async function aggregateAndStoreData(url: string): Promise<any | null> {
// 	try {
// 		// 1. Fetch data from the provided URL using Firecrawl
// 		console.log(`Scraping data from: ${url}`);
// 		const scrapedData = await scrapeUrl(url);

// 		if (!scrapedData) {
// 			console.error("Failed to scrape data from URL");
// 			return null;
// 		}

// 		// 2. Fetch Bitcoin price data from CoinGecko
// 		console.log("Fetching Bitcoin price data...");
// 		const bitcoinPrice = await getBitcoinPrice();
// 		const bitcoinPriceHistory = await fetchBitcoinPriceDataPastDay();

// 		if (bitcoinPrice === null) {
// 			console.error("Failed to fetch Bitcoin price");
// 			return null;
// 		}

// 		// 3. Prepare the aggregated data
// 		const aggregatedData = {
// 			scraped_url: url,
// 			scraped_content: scrapedData.markdown || scrapedData.content || JSON.stringify(scrapedData),
// 			scraped_title: scrapedData.title || "No title",
// 			bitcoin_price_usd: bitcoinPrice,
// 			bitcoin_price_history: bitcoinPriceHistory,
// 			timestamp: new Date().toISOString(),
// 			created_at: new Date().toISOString(),
// 		};

// 		// 4. Insert the aggregated data into Supabase
// 		console.log("Storing aggregated data in Supabase...");
// 		const { data, error } = await supabase
// 			.from("aggregated_data")
// 			.insert(aggregatedData)
// 			.select()
// 			.single();

// 		if (error) {
// 			console.error("Error inserting data into Supabase:", error);
// 			return null;
// 		}

// 		console.log("Successfully stored aggregated data:", data.id);
// 		return data;
// 	} catch (err) {
// 		console.error("An error occurred during data aggregation:", err);
// 		return null;
// 	}
// }

/**
 * Express controller function to handle data aggregation API requests
 */
// export const aggregateData = async (req: Request, res: Response) => {
// 	try {
// 		const { url } = req.body;

// 		if (!url) {
// 			return res.status(400).json({
// 				error: "URL is required in request body"
// 			});
// 		}

// 		const result = await aggregateAndStoreData(url);

// 		if (!result) {
// 			return res.status(500).json({
// 				error: "Failed to aggregate and store data"
// 			});
// 		}

// 		res.status(201).json({
// 			message: "Data aggregated and stored successfully",
// 			data: result,
// 		});
// 	} catch (err) {
// 		console.error("Error in aggregateData controller:", err);
// 		res.status(500).json({
// 			error: "Internal server error"
// 		});
// 	}
// };

/**
 * Express controller function to get all aggregated data
 */
export const getAggregatedData = async (req: Request, res: Response) => {
	try {
		const { data, error } = await supabase
			.from("aggregated_data")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching aggregated data:", error);
			return res.status(500).json({
				error: "Failed to fetch data",
			});
		}

		res.json({
			message: "Aggregated data retrieved successfully",
			data: data,
			count: data.length,
		});
	} catch (err) {
		console.error("Error in getAggregatedData controller:", err);
		res.status(500).json({
			error: "Internal server error",
		});
	}
};

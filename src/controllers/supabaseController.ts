import { createClient } from "@supabase/supabase-js";
import type { ETHData } from "./coinGeckoController";
import type { TechnicalAnalysisData } from "../utils/technicalAnalysisParser";

// Create a single supabase client for interacting with your database
const supabase = createClient(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_ANON_KEY || "",
);

// export async function insert(): Promise<number | null> {
// 	try {
// 		const { error } = await supabase
// 			.from("test_table")
// 			.insert({ timestamp: new Date().toISOString() });
// 		if (error) {
// 			console.error(" inserting email:", error);
// 		} else {
// 			console.log(" successfully inserted.");
// 		}
// 		return null;
// 	} catch (err) {
// 		console.error("An error occurred:", err);

// 		return null;
// 	}
// }

export async function insertETHData(ethData: ETHData): Promise<boolean> {
	try {
		const { data, error } = await supabase.from("eth_market_history").insert({
			created_at: ethData.created_at,
			usd: ethData.usd,
			usd_market_cap: ethData.usd_market_cap,
			usd_24h_vol: ethData.usd_24h_vol,
			usd_24h_change: ethData.usd_24h_change,
			last_updated_at: ethData.last_updated_at,
		});

		if (error) {
			console.error("Error inserting ETH data:", error);
			return false;
		}

		console.log("ETH data successfully inserted:", data);
		return true;
	} catch (err) {
		console.error("An error occurred while inserting ETH data:", err);
		return false;
	}
}

export async function insertTechnicalAnalysisData(analysisData: TechnicalAnalysisData): Promise<boolean> {
	try {
		const { data, error } = await supabase.from("technical_analysis").insert({
			symbol: analysisData.symbol,
			price: analysisData.price,
			price_change: analysisData.priceChange,
			price_change_percent: analysisData.priceChangePercent,
			overall_summary: analysisData.summary.overall,
			technical_indicators_summary: analysisData.summary.technicalIndicators,
			moving_averages_summary: analysisData.summary.movingAverages,
			technical_indicators: JSON.stringify(analysisData.technicalIndicators),
			moving_averages: JSON.stringify(analysisData.movingAverages),
			pivot_points: JSON.stringify(analysisData.pivotPoints),
			source_url: analysisData.sourceUrl,
			scraped_at: analysisData.scrapedAt,
			created_at: new Date().toISOString()
		});

		if (error) {
			console.error("Error inserting technical analysis data:", error);
			return false;
		}

		console.log("Technical analysis data successfully inserted:", data);
		return true;
	} catch (err) {
		console.error("An error occurred while inserting technical analysis data:", err);
		return false;
	}
}

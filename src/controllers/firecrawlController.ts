import { Request, Response } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";
import { TechnicalAnalysisParser } from "../utils/technicalAnalysisParser";
import { insertTechnicalAnalysisData } from "./supabaseController";
import crypto from "crypto";

// Initialize a single, reusable client instance.
// This is the recommended approach for application-wide use.
export const client = new FirecrawlApp({
	apiKey: process.env.FIRECRAWL_API_KEY || "",
});

/**
 * Scrapes a single URL and returns the content.
 *
 * @param url - The URL to scrape.
 * @returns A Promise resolving to the scraped content, or null if an error occurs.
 */
export async function scrapeUrl(
	url: string,
	bustCache: boolean = false,
): Promise<any | null> {
	try {
		// Add cache-busting parameter if requested
		const targetUrl = bustCache
			? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
			: url;
		const maxAge = bustCache ? 0 : undefined; // Force fresh data if busting cache

		console.log(`🔄 Scraping URL: ${targetUrl}`);
		console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

		const scrapeResult = await client.scrape(targetUrl, {
			maxAge,
			formats: ["markdown", "html"],
			// Add options to bypass potential caching
			waitFor: 1000, // Wait 1 second for dynamic content
			actions: [
				{
					type: "wait",
					milliseconds: 1000,
				},
			],
		});

		if (scrapeResult) {
			console.log(
				`✅ Scraping successful - Content length: ${scrapeResult.markdown?.length || 0} chars`,
			);
			console.log(
				`📄 Status Code: ${(scrapeResult as any).statusCode || "N/A"}`,
			);

			// Create hash to detect content changes
			const contentHash = crypto
				.createHash("md5")
				.update(scrapeResult.markdown || "")
				.digest("hex");
			console.log(`🔑 Content hash: ${contentHash}`);

			// Log a small sample of content to verify it's changing
			const sample = scrapeResult.markdown?.substring(0, 200) || "";
			console.log(`📝 Content sample: ${sample}...`);
		}

		return scrapeResult || null;
	} catch (err) {
		console.error("An error occurred while scraping URL:", err);
		return null;
	}
}

/**
 * Crawls a website starting from a given URL.
 *
 * @param url - The starting URL for crawling.
 * @param options - Crawling options (optional).
 * @returns A Promise resolving to the crawl job ID, or null if an error occurs.
 */
export async function crawlWebsite(
	url: string,
	options?: any,
): Promise<string | null> {
	try {
		const crawlResult = await client.crawl(url, {
			formats: ["markdown"],
			...options,
		});
		return crawlResult?.status || null;
	} catch (err) {
		console.error("An error occurred while crawling website:", err);
		return null;
	}
}

/**
 * Checks the status of a crawl job.
 *
 * @param jobId - The ID of the crawl job to check.
 * @returns A Promise resolving to the job status, or null if an error occurs.
 */
export async function getCrawlStatus(jobId: string): Promise<any | null> {
	try {
		const statusResult = await client.getCrawlStatus(jobId);
		return statusResult || null;
	} catch (err) {
		console.error("An error occurred while checking crawl status:", err);
		return null;
	}
}

/**
 * Searches the web using Firecrawl's search functionality.
 *
 * @param query - The search query.
 * @param options - Search options (optional).
 * @returns A Promise resolving to search results, or null if an error occurs.
 */
export async function searchWeb(
	query: string,
	options?: any,
): Promise<any | null> {
	try {
		const searchResult = await client.search(query, {
			formats: ["markdown"],
			...options,
		});
		return searchResult || null;
	} catch (err) {
		console.error("An error occurred while searching:", err);
		return null;
	}
}

/**
 * Express controller function to test Firecrawl scraping with hardcoded URL
 */
export const testFirecrawl = async (req: Request, res: Response) => {
	try {
		// Hardcoded URL - you can change this later
		const testUrl = "https://www.investing.com/crypto/ethereum/technical";

		console.log(`Testing Firecrawl with URL: ${testUrl}`);

		const scrapedData = await scrapeUrl(testUrl);
		console.log("scrapedData", JSON.stringify(scrapedData.markdown));
		// console.log("scrapedData", JSON.stringify(scrapedData.json));
		// console.log("scrapedData", JSON.stringify(scrapedData.html));

		if (!scrapedData) {
			console.log("❌ Failed to scrape data");
			return res.status(500).json({
				error: "Failed to scrape data from URL",
			});
		}

		console.log("✅ Successfully scraped data!");
		console.log("📄 Title:", scrapedData.title || "No title");
		console.log(
			"📝 Content length:",
			scrapedData.markdown?.length || 0,
			"characters",
		);
		console.log("🔗 URL:", scrapedData.url || testUrl);

		// Log first 200 characters of content
		if (scrapedData.markdown) {
			// console.log(
			// 	"📖 Content preview:",
			// 	scrapedData.markdown.substring(0, 200) + "...",
			// );
			// console.log(1);
			// console.log(
			// 	"scrapedData.markdown.substring",
			// 	JSON.stringify(scrapedData.markdown),
			// );
		}

		res.json({
			message: "Firecrawl test completed successfully",
			url: testUrl,
			title: scrapedData.title,
			contentLength: scrapedData.markdown?.length || 0,
			preview: scrapedData.markdown?.substring(0, 200) + "..." || "No content",
		});
	} catch (err) {
		console.error("❌ Error in testFirecrawl:", err);
		res.status(500).json({
			error: "Internal server error",
		});
	}
};

/**
 * Express controller function to fetch technical analysis data from external sites
 */
export const fetchTechnicalAnalysis = async (req: Request, res: Response) => {
	try {
		// Get URL from query parameter or use default
		const targetUrl =
			(req.query.url as string) ||
			"https://www.investing.com/crypto/ethereum/technical";
		// Check if user wants to save to database
		const saveToDb = req.query.save === "true";
		// Check if user wants to bust cache
		const bustCache = req.query.fresh === "true";

		console.log(`🔍 Fetching technical analysis from: ${targetUrl}`);
		console.log(`🕒 Request timestamp: ${new Date().toISOString()}`);
		if (saveToDb) {
			console.log(`💾 Will save parsed data to database`);
		}
		if (bustCache) {
			console.log(`🔄 Cache busting enabled - forcing fresh data`);
		}

		const scrapedData = await scrapeUrl(targetUrl, bustCache);

		if (!scrapedData) {
			console.log("❌ Failed to scrape technical analysis data");
			return res.status(500).json({
				success: false,
				error: "Failed to scrape technical analysis data from URL",
				url: targetUrl,
			});
		}

		console.log("✅ Successfully scraped technical analysis data!");
		console.log("📄 Title:", scrapedData.title || "No title");
		console.log(
			"📝 Content length:",
			scrapedData.markdown?.length || 0,
			"characters",
		);

		// Parse the technical analysis data
		const parsedData = TechnicalAnalysisParser.parseMarkdown(
			scrapedData.markdown || "",
			targetUrl,
		);
		// console.log("parsedData", parsedData);

		let savedToDb = false;
		if (!parsedData) {
			console.log("⚠️ Failed to parse technical analysis data");
		} else {
			console.log(
				"🔍 Parsed technical indicators:",
				parsedData.technicalIndicators.length,
			);
			console.log(
				"📊 Parsed moving averages:",
				parsedData.movingAverages.length,
			);
			console.log("📈 Overall summary:", parsedData.summary.overall);

			// Save to database if requested
			if (saveToDb) {
				console.log("💾 Saving parsed data to database...");
				savedToDb = await insertTechnicalAnalysisData(parsedData);
				if (savedToDb) {
					console.log("✅ Data successfully saved to database");
				} else {
					console.log("❌ Failed to save data to database");
				}
			}
		}

		// Return structured response with technical analysis data
		res.json({
			success: true,
			message: `Technical analysis data fetched and parsed successfully${savedToDb ? ", and saved to database" : ""}`,
			data: {
				raw: {
					url: targetUrl,
					title: scrapedData.title,
					content: scrapedData.markdown,
					html: scrapedData.html,
					contentLength: scrapedData.markdown?.length || 0,
					scrapedAt: new Date().toISOString(),
					metadata: {
						statusCode: (scrapedData as any).statusCode,
						originalUrl: (scrapedData as any).url,
					},
				},
				parsed: parsedData,
				savedToDatabase: savedToDb,
			},
		});
	} catch (err) {
		console.error("❌ Error in fetchTechnicalAnalysis:", err);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: err instanceof Error ? err.message : "Unknown error",
		});
	}
};

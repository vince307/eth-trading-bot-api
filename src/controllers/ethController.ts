import { Request, Response } from "express";
import { fetchETHData } from "./coinGeckoController";
import { insertETHData } from "./supabaseController";

export async function fetchAndStoreETHData(req: Request, res: Response): Promise<void> {
	try {
		// Fetch ETH data from CoinGecko
		const ethData = await fetchETHData();

		if (!ethData) {
			res.status(500).json({
				success: false,
				error: "Failed to fetch ETH data from CoinGecko"
			});
			return;
		}

		// Insert data into Supabase
		const insertSuccess = await insertETHData(ethData);

		if (!insertSuccess) {
			res.status(500).json({
				success: false,
				error: "Failed to insert ETH data into database",
				data: ethData
			});
			return;
		}

		// Return success response with the data
		res.status(200).json({
			success: true,
			message: "ETH data successfully fetched and stored",
			data: ethData
		});

	} catch (error) {
		console.error("Error in fetchAndStoreETHData:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error"
		});
	}
}
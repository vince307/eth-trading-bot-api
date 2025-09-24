import { Request, Response, NextFunction } from "express";

// Extend Request interface to include apiKey
declare global {
	namespace Express {
		interface Request {
			apiKey?: string;
		}
	}
}

/**
 * Simple API Key authentication middleware
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
	const apiKey = req.headers["x-api-key"] as string;
	const validApiKey = process.env.API_KEY;

	if (!validApiKey) {
		console.warn("⚠️ API_KEY not set in environment variables");
		return res.status(500).json({
			error: "Server configuration error"
		});
	}

	if (!apiKey) {
		return res.status(401).json({
			error: "API key required. Include 'x-api-key' header."
		});
	}

	if (apiKey !== validApiKey) {
		console.log(`❌ Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
		return res.status(403).json({
			error: "Invalid API key"
		});
	}

	req.apiKey = apiKey;
	console.log(`✅ Valid API key authenticated`);
	next();
};

/**
 * Optional API Key authentication - allows requests without API key for public endpoints
 */
export const optionalApiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
	const apiKey = req.headers["x-api-key"] as string;
	const validApiKey = process.env.API_KEY;

	if (apiKey && validApiKey && apiKey === validApiKey) {
		req.apiKey = apiKey;
		console.log(`✅ Valid API key authenticated`);
	}

	next();
};

/**
 * IP Whitelist middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const clientIP = req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

		// Handle localhost variations
		const normalizedIP = clientIP === "::1" || clientIP === "::ffff:127.0.0.1" ? "127.0.0.1" : clientIP;

		if (!allowedIPs.includes(normalizedIP as string)) {
			console.log(`❌ Blocked IP attempt: ${clientIP}`);
			return res.status(403).json({
				error: "Access denied from this IP address"
			});
		}

		console.log(`✅ Allowed IP: ${clientIP}`);
		next();
	};
};
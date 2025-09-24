import { Request, Response, NextFunction } from "express";

/**
 * URL validation middleware
 */
export const validateUrl = (req: Request, res: Response, next: NextFunction) => {
	const { url } = req.body;

	if (!url) {
		return res.status(400).json({
			error: "URL is required in request body"
		});
	}

	// Basic URL validation
	try {
		const urlObj = new URL(url);

		// Check if protocol is HTTP or HTTPS
		if (!["http:", "https:"].includes(urlObj.protocol)) {
			return res.status(400).json({
				error: "URL must use HTTP or HTTPS protocol"
			});
		}

		// Optional: Block localhost/private IPs in production
		if (process.env.NODE_ENV === "production") {
			const hostname = urlObj.hostname;
			if (
				hostname === "localhost" ||
				hostname === "127.0.0.1" ||
				hostname.startsWith("192.168.") ||
				hostname.startsWith("10.") ||
				hostname.startsWith("172.")
			) {
				return res.status(400).json({
					error: "Private/local URLs are not allowed"
				});
			}
		}

		console.log(`✅ Valid URL: ${url}`);
		next();
	} catch (error) {
		return res.status(400).json({
			error: "Invalid URL format"
		});
	}
};

/**
 * Request size validation
 */
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
	const contentLength = req.headers["content-length"];
	const maxSize = 1024 * 1024; // 1MB

	if (contentLength && parseInt(contentLength) > maxSize) {
		return res.status(413).json({
			error: "Request too large"
		});
	}

	next();
};

/**
 * Sanitize input to prevent injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
	// Remove dangerous characters from URL
	if (req.body.url) {
		req.body.url = req.body.url.trim();

		// Check for potential script injection
		const dangerousPatterns = [
			/<script/i,
			/javascript:/i,
			/data:/i,
			/vbscript:/i
		];

		for (const pattern of dangerousPatterns) {
			if (pattern.test(req.body.url)) {
				return res.status(400).json({
					error: "URL contains potentially dangerous content"
				});
			}
		}
	}

	next();
};
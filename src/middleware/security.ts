import { Request, Response, NextFunction } from "express";

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
	// Prevent clickjacking
	res.setHeader("X-Frame-Options", "DENY");

	// Prevent MIME type sniffing
	res.setHeader("X-Content-Type-Options", "nosniff");

	// Enable XSS protection
	res.setHeader("X-XSS-Protection", "1; mode=block");

	// Hide server information
	res.removeHeader("X-Powered-By");

	// Referrer policy
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

	// Content Security Policy
	res.setHeader(
		"Content-Security-Policy",
		"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
	);

	next();
};

/**
 * CORS middleware with configurable options
 */
export const corsConfig = (allowedOrigins: string[] = ["http://localhost:3000"]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const origin = req.headers.origin;

		// Allow requests without origin (e.g., mobile apps, Postman)
		if (!origin || allowedOrigins.includes(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin || "*");
		}

		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS"
		);

		res.setHeader(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key"
		);

		res.setHeader("Access-Control-Allow-Credentials", "true");

		// Handle preflight requests
		if (req.method === "OPTIONS") {
			return res.status(200).end();
		}

		next();
	};
};

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
	const timestamp = new Date().toISOString();
	const ip = req.ip || req.connection.remoteAddress;
	const userAgent = req.headers["user-agent"];
	const method = req.method;
	const url = req.url;

	console.log(`🔍 [${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);

	// Log suspicious activity
	const suspiciousPatterns = [
		/admin/i,
		/config/i,
		/\.env/i,
		/password/i,
		/secret/i,
		/token/i
	];

	if (suspiciousPatterns.some(pattern => pattern.test(url))) {
		console.warn(`⚠️ Suspicious request detected: ${method} ${url} from ${ip}`);
	}

	next();
};
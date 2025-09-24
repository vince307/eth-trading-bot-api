import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export class RateLimiter {
	private store: RateLimitStore = {};
	private windowMs: number;
	private maxRequests: number;

	constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
		this.windowMs = windowMs; // 15 minutes default
		this.maxRequests = maxRequests; // 100 requests default

		// Clean up expired entries every 5 minutes
		setInterval(() => this.cleanup(), 5 * 60 * 1000);
	}

	private cleanup() {
		const now = Date.now();
		for (const key in this.store) {
			if (this.store[key].resetTime < now) {
				delete this.store[key];
			}
		}
	}

	private getKey(req: Request): string {
		// Use API key if available, otherwise fall back to IP
		return req.apiKey || req.ip || req.connection.remoteAddress || "unknown";
	}

	middleware() {
		return (req: Request, res: Response, next: NextFunction) => {
			const key = this.getKey(req);
			const now = Date.now();

			// Initialize or reset if window expired
			if (!this.store[key] || this.store[key].resetTime < now) {
				this.store[key] = {
					count: 0,
					resetTime: now + this.windowMs
				};
			}

			this.store[key].count++;

			// Set rate limit headers
			const remaining = Math.max(0, this.maxRequests - this.store[key].count);
			const resetTime = Math.ceil((this.store[key].resetTime - now) / 1000);

			res.set({
				"X-RateLimit-Limit": this.maxRequests.toString(),
				"X-RateLimit-Remaining": remaining.toString(),
				"X-RateLimit-Reset": resetTime.toString()
			});

			if (this.store[key].count > this.maxRequests) {
				console.log(`🚫 Rate limit exceeded for ${key}: ${this.store[key].count}/${this.maxRequests}`);
				return res.status(429).json({
					error: "Rate limit exceeded",
					retryAfter: resetTime
				});
			}

			console.log(`📊 Rate limit: ${this.store[key].count}/${this.maxRequests} for ${key}`);
			next();
		};
	}
}

// Create different rate limiters for different endpoints
export const generalLimiter = new RateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const strictLimiter = new RateLimiter(15 * 60 * 1000, 20);   // 20 requests per 15 minutes
export const publicLimiter = new RateLimiter(15 * 60 * 1000, 50);   // 50 requests per 15 minutes
import { Router } from "express";
import { getUsers, createUser } from "./userController";
import {
	// aggregateData,
	getAggregatedData,
} from "./controllers/dataAggregatorController";
import { testFirecrawl, fetchTechnicalAnalysis } from "./controllers/firecrawlController";
import { fetchAndStoreETHData } from "./controllers/ethController";

// Security middleware
import { apiKeyAuth, optionalApiKeyAuth } from "./middleware/auth";
import {
	generalLimiter,
	strictLimiter,
	publicLimiter,
} from "./middleware/rateLimiter";
import {
	validateUrl,
	sanitizeInput,
	validateRequestSize,
} from "./middleware/validation";

const router = Router();

// Public endpoints (no auth required, basic rate limiting)
// router.get("/users", publicLimiter.middleware(), getUsers);

// Semi-protected endpoints (optional auth, moderate rate limiting)
// router.post("/users", generalLimiter.middleware(), optionalApiKeyAuth, createUser);
router.get(
	"/test-firecrawl",
	generalLimiter.middleware(),
	apiKeyAuth,
	testFirecrawl,
);
// router.get(
// 	"/aggregated-data",
// 	generalLimiter.middleware(),
// 	optionalApiKeyAuth,
// 	getAggregatedData,
// );
router.post(
	"/eth-data",
	generalLimiter.middleware(),
	apiKeyAuth,
	fetchAndStoreETHData,
);
router.get(
	"/technical-analysis",
	generalLimiter.middleware(),
	apiKeyAuth,
	fetchTechnicalAnalysis,
);

// Protected endpoints (auth required, strict rate limiting, validation)
// router.post(
// 	"/aggregate",
// 	strictLimiter.middleware(),
// 	apiKeyAuth,
// 	validateRequestSize,
// 	sanitizeInput,
// 	validateUrl,
// 	aggregateData,
// );

export default router;

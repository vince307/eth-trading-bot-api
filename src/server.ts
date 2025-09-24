import express from "express";
import path from "node:path";
import "./config";
import routes from "./routes";
// import {
// 	fetchBitcoinPriceData,
// 	fetchBitcoinPriceDataPastMonth,
// } from "../controllers/coinGeckoController";

// Security middleware
import {
	securityHeaders,
	corsConfig,
	securityLogger,
} from "./middleware/security";

const app = express();
const port = 3000;

// Enable trust proxy for proper IP detection
app.set("trust proxy", true);

// Global security middleware
app.use(securityLogger);
app.use(securityHeaders);
app.use(corsConfig(["http://localhost:3000", "http://localhost:3001"])); // Add your frontend URLs

// Serve static files from /public
app.use(express.static(path.join(__dirname, "..", "public")));
// Middleware to parse JSON bodies
app.use(express.json({ limit: "1mb" })); // Limit JSON payload size

// Main route handler for all API endpoints
app.use("/api", routes);

// Health check
app.get("/healthz", (req, res) => {
	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// app.get("/bitcoin", (req, res) => {
// 	fetchBitcoinPriceDataPastMonth().then((price) => {
// 		if (price !== null) {
// 			console.log(`Bitcoin price in USD: $${price}`);
// 		}
// 	});
// 	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
// });

// app.get("/bitcoin2", (req, res) => {
// 	fetchBitcoinPriceData().then((price) => {
// 		if (price !== null) {
// 			console.log(`Bitcoin price in USD: $${price}`);
// 		}
// 	});
// 	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
// });

// Local dev listener (ignored on Vercel)
app.listen(port, () =>
	console.log(`Server is running at http://localhost:${port}`),
);

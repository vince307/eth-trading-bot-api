export interface TechnicalIndicator {
	name: string;
	value: number | string;
	action: string; // Buy, Sell, Neutral, Overbought, Oversold, etc.
	rawValue?: string; // Original string representation
}

export interface MovingAverage {
	period: number;
	simple: {
		value: number;
		action: string;
	};
	exponential: {
		value: number;
		action: string;
	};
}

export interface PivotPoint {
	name: string;
	s3?: number;
	s2?: number;
	s1?: number;
	pivot: number;
	r1?: number;
	r2?: number;
	r3?: number;
}

export interface TechnicalAnalysisSummary {
	recommendation: string;
	buyCount: number;
	sellCount: number;
	neutralCount?: number;
}

export interface TechnicalAnalysisData {
	symbol: string;
	price: number;
	priceChange: number;
	priceChangePercent: number;
	summary: {
		overall: string;
		technicalIndicators: string;
		movingAverages: string;
	};
	technicalIndicatorsSummary: TechnicalAnalysisSummary;
	movingAveragesSummary: TechnicalAnalysisSummary;
	technicalIndicators: TechnicalIndicator[];
	movingAverages: MovingAverage[];
	pivotPoints: PivotPoint[];
	scrapedAt: string;
	sourceUrl: string;
}

export class TechnicalAnalysisParser {

	/**
	 * Parse markdown content to extract technical analysis data
	 */
	static parseMarkdown(markdown: string, sourceUrl: string): TechnicalAnalysisData | null {
		try {
			const data: TechnicalAnalysisData = {
				symbol: this.extractSymbol(markdown),
				price: this.extractPrice(markdown),
				priceChange: this.extractPriceChange(markdown),
				priceChangePercent: this.extractPriceChangePercent(markdown),
				summary: this.extractSummary(markdown),
				technicalIndicatorsSummary: this.extractTechnicalIndicatorsSummary(markdown),
				movingAveragesSummary: this.extractMovingAveragesSummary(markdown),
				technicalIndicators: this.extractTechnicalIndicators(markdown),
				movingAverages: this.extractMovingAverages(markdown),
				pivotPoints: this.extractPivotPoints(markdown),
				scrapedAt: new Date().toISOString(),
				sourceUrl: sourceUrl
			};

			return data;
		} catch (error) {
			console.error('Error parsing technical analysis markdown:', error);
			return null;
		}
	}

	/**
	 * Extract symbol (e.g., ETH, BTC) from markdown
	 */
	private static extractSymbol(markdown: string): string {
		// Look for title or header patterns
		const titleMatch = markdown.match(/# (.*?)(\n|$)/);
		if (titleMatch) {
			const title = titleMatch[1].toLowerCase();
			if (title.includes('ethereum') || title.includes('eth')) return 'ETH';
			if (title.includes('bitcoin') || title.includes('btc')) return 'BTC';
		}

		// Look for ETH/USD or similar patterns
		const symbolMatch = markdown.match(/(ETH|BTC|ADA|SOL|DOT)\/USD/i);
		if (symbolMatch) {
			return symbolMatch[1].toUpperCase();
		}

		return 'UNKNOWN';
	}

	/**
	 * Extract current price from markdown
	 */
	private static extractPrice(markdown: string): number {
		// Look for price patterns like "4,484.17" followed by change
		const pricePatterns = [
			// Pattern: price on one line, change on next line: "4,491.64\n+11.46(+0.26%)"
			/([0-9,]+\.[0-9]+)\s*\n\s*[+\-]([0-9,]+\.[0-9]+)\s*\([+\-]([0-9,]+\.[0-9]+)%\)/,
			// Pattern: price with USD: "4,484.17 USD"
			/([0-9,]+\.?[0-9]*)\s*USD/i,
			// Pattern: labeled price: "Price: $4,484.17"
			/Price[:\s]*\$?([0-9,]+\.?[0-9]*)/i,
			// Pattern: simple price in 4,xxx.xx format (ETH range)
			/(4,[0-9]{3}\.[0-9]{2})/
		];

		for (const pattern of pricePatterns) {
			const match = markdown.match(pattern);
			if (match) {
				const priceStr = match[1];
				if (priceStr) {
					return parseFloat(priceStr.replace(/,/g, ''));
				}
			}
		}

		return 0;
	}

	/**
	 * Extract price change from markdown
	 */
	private static extractPriceChange(markdown: string): number {
		// Look for price change pattern: "+11.46(+0.26%)" or "-11.46(-0.26%)"
		const changePatterns = [
			// Pattern from price with change: "4,491.64\n+11.46(+0.26%)"
			/([0-9,]+\.[0-9]+)\s*\n\s*([+\-])([0-9,]+\.[0-9]+)\s*\([+\-]([0-9,]+\.[0-9]+)%\)/,
			// Simple change pattern: "+11.46(+0.26%)"
			/([+\-])([0-9,]+\.?\d*)\s*\([+\-]([0-9,]+\.?\d*)%\)/
		];

		for (const pattern of changePatterns) {
			const match = markdown.match(pattern);
			if (match) {
				if (match.length === 5) {
					// First pattern (with price)
					const sign = match[2] === '+' ? 1 : -1;
					return sign * parseFloat(match[3].replace(/,/g, ''));
				} else if (match.length === 4) {
					// Second pattern (change only)
					const sign = match[1] === '+' ? 1 : -1;
					return sign * parseFloat(match[2].replace(/,/g, ''));
				}
			}
		}
		return 0;
	}

	/**
	 * Extract price change percentage from markdown
	 */
	private static extractPriceChangePercent(markdown: string): number {
		// Look for price change percentage pattern: "+11.46(+0.26%)" or "-11.46(-0.26%)"
		const changePatterns = [
			// Pattern from price with change: "4,491.64\n+11.46(+0.26%)"
			/([0-9,]+\.[0-9]+)\s*\n\s*[+\-]([0-9,]+\.[0-9]+)\s*\(([+\-])([0-9,]+\.[0-9]+)%\)/,
			// Simple change pattern: "+11.46(+0.26%)"
			/[+\-]([0-9,]+\.?\d*)\s*\(([+\-])([0-9,]+\.?\d*)%\)/
		];

		for (const pattern of changePatterns) {
			const match = markdown.match(pattern);
			if (match) {
				if (match.length === 5) {
					// First pattern (with price)
					const sign = match[3] === '+' ? 1 : -1;
					return sign * parseFloat(match[4].replace(/,/g, ''));
				} else if (match.length === 4) {
					// Second pattern (change only)
					const sign = match[2] === '+' ? 1 : -1;
					return sign * parseFloat(match[3].replace(/,/g, ''));
				}
			}
		}
		return 0;
	}

	/**
	 * Extract summary information
	 */
	private static extractSummary(markdown: string): { overall: string; technicalIndicators: string; movingAverages: string } {
		const summary = {
			overall: 'Neutral',
			technicalIndicators: 'Neutral',
			movingAverages: 'Neutral'
		};

		// Look for summary sections
		const summaryMatch = markdown.match(/## Summary:(\w+)/i);
		if (summaryMatch) {
			summary.overall = summaryMatch[1];
		}

		// Look for technical indicators summary
		const techIndicatorsMatch = markdown.match(/Technical Indicators.*?(\w+)\s+Buy:\s*\((\d+)\)\s+Sell:\s*\((\d+)\)/is);
		if (techIndicatorsMatch) {
			summary.technicalIndicators = techIndicatorsMatch[1];
		}

		// Look for moving averages summary
		const movingAvgMatch = markdown.match(/Moving Averages.*?(\w+)\s+Buy:\s*\((\d+)\)\s+Sell:\s*\((\d+)\)/is);
		if (movingAvgMatch) {
			summary.movingAverages = movingAvgMatch[1];
		}

		return summary;
	}

	/**
	 * Extract technical indicators like RSI, STOCH, MACD, etc.
	 */
	private static extractTechnicalIndicators(markdown: string): TechnicalIndicator[] {
		const indicators: TechnicalIndicator[] = [];

		// Simply search through all lines for indicator patterns - much simpler approach
		const lines = markdown.split('\n');

		// Define patterns for each indicator
		const indicatorPatterns = [
			{ name: 'RSI(14)', pattern: /\|\s*RSI\(14\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'STOCH(9,6)', pattern: /\|\s*STOCH\(9,6\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'STOCHRSI(14)', pattern: /\|\s*STOCHRSI\(14\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'MACD(12,26)', pattern: /\|\s*MACD\(12,26\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'ADX(14)', pattern: /\|\s*ADX\(14\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'Williams %R', pattern: /\|\s*Williams %R\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'CCI(14)', pattern: /\|\s*CCI\(14\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'ATR(14)', pattern: /\|\s*ATR\(14\)\s*\|\s*([\d.]+)\s*\|\s*([\w\s]+)/i },
			{ name: 'Ultimate Oscillator', pattern: /\|\s*Ultimate Oscillator\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'ROC', pattern: /\|\s*ROC\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'Bull/Bear Power(13)', pattern: /\|\s*Bull\/Bear Power\(13\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
			{ name: 'Highs/Lows(14)', pattern: /\|\s*Highs\/Lows\(14\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i }
		];

		// Search each line for matches
		for (const line of lines) {
			if (!line.includes('|')) continue; // Skip non-table lines

			for (const { name, pattern } of indicatorPatterns) {
				const match = line.match(pattern);
				if (match) {
					// For ATR, the action might be multi-word
					const action = match[2] ? match[2].trim() : (match.length > 3 ? match[3].trim() : 'Unknown');
					indicators.push({
						name,
						value: parseFloat(match[1]) || match[1],
						action: action,
						rawValue: line.trim()
					});
					break; // Only match one pattern per line
				}
			}
		}

		return indicators;
	}

	/**
	 * Parse individual indicator rows from content
	 */
	private static parseIndicatorRows(content: string): TechnicalIndicator[] {
		const indicators: TechnicalIndicator[] = [];

		// Look for table rows with | Name | Value | Action | pattern
		const rows = content.split('\n').filter(line => line.includes('|') && !line.includes('---'));

		for (const row of rows) {
			// Parse different indicator patterns - simpler approach
			const indicatorPatterns = [
				{ name: 'RSI(14)', pattern: /\|\s*RSI\(14\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'STOCH(9,6)', pattern: /\|\s*STOCH\(9,6\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'STOCHRSI(14)', pattern: /\|\s*STOCHRSI\(14\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'MACD(12,26)', pattern: /\|\s*MACD\(12,26\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'ADX(14)', pattern: /\|\s*ADX\(14\)\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'Williams %R', pattern: /\|\s*Williams %R\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'CCI(14)', pattern: /\|\s*CCI\(14\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'ATR(14)', pattern: /\|\s*ATR\(14\)\s*\|\s*([\d.]+)\s*\|\s*([\w\s]+)/i },
				{ name: 'Ultimate Oscillator', pattern: /\|\s*Ultimate Oscillator\s*\|\s*([\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'ROC', pattern: /\|\s*ROC\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'Bull/Bear Power(13)', pattern: /\|\s*Bull\/Bear Power\(13\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i },
				{ name: 'Highs/Lows(14)', pattern: /\|\s*Highs\/Lows\(14\)\s*\|\s*([-\d.]+)\s*\|\s*(\w+)/i }
			];

			for (const { name, pattern } of indicatorPatterns) {
				const match = row.match(pattern);
				if (match) {
					const action = match[2] ? match[2].trim() : (match.length > 3 ? match[3].trim() : 'Unknown');
					indicators.push({
						name,
						value: parseFloat(match[1]) || match[1],
						action: action,
						rawValue: row.trim()
					});
					break; // Only match one pattern per row
				}
			}
		}

		return indicators;
	}

	/**
	 * Extract moving averages data
	 */
	private static extractMovingAverages(markdown: string): MovingAverage[] {
		// Simply search through all lines for MA patterns - much simpler approach
		return this.parseMovingAverageRows(markdown);
	}

	/**
	 * Parse individual moving average rows from content
	 */
	private static parseMovingAverageRows(content: string): MovingAverage[] {
		const movingAverages: MovingAverage[] = [];

		// Look for table rows with MA data
		const rows = content.split('\n').filter(line => line.includes('|') && line.includes('MA') && !line.includes('---'));

		for (const row of rows) {
			// Extract MA periods and values - updated pattern based on actual format: | MA5 | 4488.29 | Buy | 4488.00 | Buy |
			const maPatterns = [
				{ period: 5, pattern: /\|\s*MA5\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|/i },
				{ period: 10, pattern: /\|\s*MA10\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|/i },
				{ period: 20, pattern: /\|\s*MA20\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|/i },
				{ period: 50, pattern: /\|\s*MA50\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|/i },
				{ period: 100, pattern: /\|\s*MA100\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|/i },
				{ period: 200, pattern: /\|\s*MA200\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|\s*([\d.]+)\s*\|\s*(\w+)\s*\|/i }
			];

			for (const { period, pattern } of maPatterns) {
				const match = row.match(pattern);
				if (match) {
					movingAverages.push({
						period,
						simple: {
							value: parseFloat(match[1]),
							action: match[2].trim()
						},
						exponential: {
							value: parseFloat(match[3]),
							action: match[4].trim()
						}
					});
					break; // Only match one pattern per row
				}
			}
		}

		return movingAverages;
	}

	/**
	 * Extract pivot points data
	 */
	private static extractPivotPoints(markdown: string): PivotPoint[] {
		const pivotPoints: PivotPoint[] = [];

		// Look for pivot points table
		const pivotSection = markdown.match(/## \[Pivot Points\].*?\n([\s\S]*?)(?=##|$)/i);
		if (!pivotSection) return pivotPoints;

		const tableContent = pivotSection[1];

		// Extract different pivot point types
		const pivotPatterns = [
			{
				name: 'Classic',
				pattern: /Classic\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i
			},
			{
				name: 'Fibonacci',
				pattern: /Fibonacci\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i
			},
			{
				name: 'Camarilla',
				pattern: /Camarilla\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i
			},
			{
				name: 'Woodie\'s',
				pattern: /Woodie's\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i
			}
		];

		for (const { name, pattern } of pivotPatterns) {
			const match = tableContent.match(pattern);
			if (match) {
				pivotPoints.push({
					name,
					s3: parseFloat(match[1]),
					s2: parseFloat(match[2]),
					s1: parseFloat(match[3]),
					pivot: parseFloat(match[4]),
					r1: parseFloat(match[5]),
					r2: parseFloat(match[6]),
					r3: parseFloat(match[7])
				});
			}
		}

		return pivotPoints;
	}

	/**
	 * Extract technical indicators summary table data
	 */
	private static extractTechnicalIndicatorsSummary(markdown: string): TechnicalAnalysisSummary {
		// Look for pattern: | Technical Indicators: | Strong Buy | Buy: (9) | Sell: (0) |
		const pattern = /\|\s*Technical Indicators:\s*\|\s*([^|]+)\s*\|\s*Buy:\s*\((\d+)\)\s*\|\s*Sell:\s*\((\d+)\)\s*\|/i;
		const match = markdown.match(pattern);

		if (match) {
			return {
				recommendation: match[1].trim(),
				buyCount: parseInt(match[2]),
				sellCount: parseInt(match[3]),
				neutralCount: 0 // Calculate from other indicators if needed
			};
		}

		// Fallback to default values
		return {
			recommendation: 'Neutral',
			buyCount: 0,
			sellCount: 0,
			neutralCount: 0
		};
	}

	/**
	 * Extract moving averages summary table data
	 */
	private static extractMovingAveragesSummary(markdown: string): TechnicalAnalysisSummary {
		// Look for pattern: | Moving Averages: | Buy | Buy: (8) | Sell: (4) |
		const pattern = /\|\s*Moving Averages:\s*\|\s*([^|]+)\s*\|\s*Buy:\s*\((\d+)\)\s*\|\s*Sell:\s*\((\d+)\)\s*\|/i;
		const match = markdown.match(pattern);

		if (match) {
			return {
				recommendation: match[1].trim(),
				buyCount: parseInt(match[2]),
				sellCount: parseInt(match[3]),
				neutralCount: 0 // Calculate from other indicators if needed
			};
		}

		// Fallback to default values
		return {
			recommendation: 'Neutral',
			buyCount: 0,
			sellCount: 0,
			neutralCount: 0
		};
	}
}
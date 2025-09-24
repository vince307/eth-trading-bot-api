# ETH Trading Bot API

A comprehensive TypeScript/Express.js API for Ethereum trading operations, providing real-time market data collection, technical analysis parsing, and automated data storage capabilities.

## 🚀 Features

### Core Functionality
- **ETH Market Data Collection**: Fetch real-time Ethereum price, market cap, volume, and price changes from CoinGecko
- **Technical Analysis Parsing**: Advanced web scraping and parsing of technical indicators from investing.com
- **Automated Data Storage**: Seamless integration with Supabase for persistent data storage
- **API Rate Limiting**: Built-in protection against API abuse with configurable rate limits
- **Security Middleware**: API key authentication, input validation, and security headers

### Technical Analysis Features
- **12+ Technical Indicators**: RSI(14), STOCH(9,6), STOCHRSI(14), MACD(12,26), ADX(14), Williams %R, CCI(14), ATR(14), Ultimate Oscillator, ROC, Bull/Bear Power(13), Highs/Lows(14)
- **Moving Averages**: MA5, MA10, MA20, MA50, MA100, MA200 with both simple and exponential calculations
- **Pivot Points**: Classic, Fibonacci, Camarilla, and Woodie's pivot point calculations
- **Summary Analytics**: Buy/Sell/Neutral recommendations with counts and overall market sentiment
- **Cache Busting**: Fresh data retrieval with `?fresh=true` parameter support

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Security](#security)
- [Contributing](#contributing)

## 🛠 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- CoinGecko API key (optional for higher rate limits)
- Firecrawl API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd eth-trading-bot-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create `.env.local` file in the root directory:
   ```env
   # Database Configuration
   POSTGRES_URL=your_supabase_postgres_url
   POSTGRES_PRISMA_URL=your_supabase_prisma_url
   POSTGRES_URL_NON_POOLING=your_supabase_non_pooling_url
   POSTGRES_USER=your_postgres_user
   POSTGRES_HOST=your_postgres_host
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DATABASE=your_postgres_database

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret

   # API Keys
   COINGECKO_DEMO_API_KEY=your_coingecko_api_key
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   API_KEY=your_secure_api_key

   # Environment
   NODE_ENV=development
   ```

4. **Database Setup**

   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # The schema is available in database_schema.sql
   ```

5. **Build and Start**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## ⚙️ Configuration

### API Key Authentication
All protected endpoints require an `X-API-Key` header:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/endpoint
```

### Rate Limiting
- **General endpoints**: 100 requests per 15 minutes per IP
- **Strict endpoints**: 10 requests per 15 minutes per IP
- **Public endpoints**: 50 requests per 15 minutes per IP

## 🛣️ API Endpoints

### ETH Market Data

#### `POST /api/eth-data`
Fetch current ETH market data from CoinGecko and store in database.

**Headers:**
- `X-API-Key`: Required

**Response:**
```json
{
  "success": true,
  "message": "ETH data fetched and stored successfully",
  "data": {
    "usd": 4488.00,
    "usd_market_cap": 539876543210,
    "usd_24h_vol": 12345678901,
    "usd_24h_change": 2.34,
    "last_updated_at": 1703123456,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### Technical Analysis

#### `GET /api/technical-analysis?fresh=true`
Scrape and parse technical analysis data from investing.com.

**Headers:**
- `X-API-Key`: Required

**Query Parameters:**
- `fresh` (optional): Set to `true` to bypass cache and fetch fresh data
- `save` (optional): Set to `true` to save parsed data to database
- `url` (optional): Custom URL to scrape (defaults to ETH technical analysis page)

**Response:**
```json
{
  "success": true,
  "message": "Technical analysis data fetched and parsed successfully",
  "data": {
    "raw": {
      "url": "https://www.investing.com/crypto/ethereum/technical",
      "title": "Ethereum Technical Analysis",
      "contentLength": 50000,
      "scrapedAt": "2024-01-01T12:00:00.000Z"
    },
    "parsed": {
      "symbol": "ETH",
      "price": 4488.00,
      "priceChange": 7.82,
      "priceChangePercent": 0.17,
      "summary": {
        "overall": "Strong Buy",
        "technicalIndicators": "Buy",
        "movingAverages": "Neutral"
      },
      "technicalIndicatorsSummary": {
        "recommendation": "Strong Buy",
        "buyCount": 9,
        "sellCount": 0,
        "neutralCount": 3
      },
      "movingAveragesSummary": {
        "recommendation": "Buy",
        "buyCount": 7,
        "sellCount": 5,
        "neutralCount": 0
      },
      "technicalIndicators": [
        {
          "name": "RSI(14)",
          "value": 57.18,
          "action": "Buy",
          "rawValue": "| RSI(14) | 57.18 | Buy |"
        }
      ],
      "movingAverages": [
        {
          "period": 5,
          "simple": {
            "value": 4488.29,
            "action": "Buy"
          },
          "exponential": {
            "value": 4488.00,
            "action": "Buy"
          }
        }
      ],
      "pivotPoints": [
        {
          "name": "Classic",
          "s3": 4475.91,
          "s2": 4480.11,
          "s1": 4488.52,
          "pivot": 4492.72,
          "r1": 4501.13,
          "r2": 4505.33,
          "r3": 4513.74
        }
      ]
    }
  }
}
```

#### `GET /api/test-firecrawl`
Test endpoint for Firecrawl integration.

**Headers:**
- `X-API-Key`: Required

## 🗄️ Database Schema

### ETH Market History Table
```sql
CREATE TABLE eth_market_history (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usd DECIMAL(20, 8) NOT NULL,
    usd_market_cap BIGINT NOT NULL,
    usd_24h_vol BIGINT NOT NULL,
    usd_24h_change DECIMAL(10, 4) NOT NULL,
    last_updated_at BIGINT NOT NULL
);
```

### Technical Analysis Table
```sql
CREATE TABLE technical_analysis (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    price_change DECIMAL(20, 8) DEFAULT 0,
    price_change_percent DECIMAL(10, 4) DEFAULT 0,
    overall_summary VARCHAR(50) DEFAULT 'Neutral',
    technical_indicators_summary VARCHAR(50) DEFAULT 'Neutral',
    moving_averages_summary VARCHAR(50) DEFAULT 'Neutral',
    technical_indicators JSONB,
    moving_averages JSONB,
    pivot_points JSONB,
    source_url TEXT NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL
);
```

## 📁 Project Structure

```
eth-trading-bot-api/
├── src/
│   ├── controllers/           # API endpoint controllers
│   │   ├── coinGeckoController.ts    # CoinGecko API integration
│   │   ├── ethController.ts          # ETH data orchestration
│   │   ├── firecrawlController.ts    # Web scraping controller
│   │   ├── supabaseController.ts     # Database operations
│   │   └── dataAggregatorController.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # API key authentication
│   │   ├── rateLimiter.ts    # Rate limiting
│   │   ├── security.ts       # Security headers
│   │   └── validation.ts     # Input validation
│   ├── utils/                # Utility functions
│   │   └── technicalAnalysisParser.ts  # Technical analysis parsing
│   ├── config.ts             # Configuration management
│   ├── routes.ts             # API route definitions
│   └── server.ts             # Express server setup
├── database_schema.sql       # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 💻 Usage Examples

### Fetch ETH Market Data
```bash
curl -X POST \
  http://localhost:3000/api/eth-data \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json"
```

### Get Technical Analysis (Fresh Data)
```bash
curl -X GET \
  "http://localhost:3000/api/technical-analysis?fresh=true&save=true" \
  -H "X-API-Key: your_api_key"
```

### Node.js Integration
```javascript
const response = await fetch('http://localhost:3000/api/eth-data', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('ETH Price:', data.data.usd);
```

## 🔧 Development

### Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests (currently placeholder)
```

### Adding New Endpoints
1. Create controller function in appropriate controller file
2. Add route in `src/routes.ts`
3. Apply necessary middleware (auth, rate limiting, validation)
4. Update this README with endpoint documentation

### Technical Analysis Parser
The parser supports adding new indicators by:
1. Adding pattern matching in `technicalAnalysisParser.ts`
2. Updating the TypeScript interfaces
3. Testing with debug scripts (see `debug_*.js` files)

## 🔐 Security

### Features
- **API Key Authentication**: All protected endpoints require valid API keys
- **Rate Limiting**: IP-based rate limiting to prevent abuse
- **Input Validation**: Sanitization and validation of all inputs
- **Security Headers**: Helmet.js integration for security headers
- **Environment Variables**: Sensitive data stored in environment variables

### Best Practices
- Use strong, unique API keys
- Regularly rotate API keys
- Monitor rate limit usage
- Keep dependencies updated
- Use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add appropriate error handling
- Include JSDoc comments for public functions
- Update README for new features
- Test thoroughly before submitting

## 📊 Technical Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **External APIs**: CoinGecko, Firecrawl
- **Security**: Helmet.js, express-rate-limit
- **Development**: ts-node, nodemon

## 📈 Performance

### Optimizations
- Connection pooling for database operations
- Efficient regex patterns for parsing
- Background processing for heavy operations
- Cached responses where appropriate

### Monitoring
- Built-in logging for all operations
- Error tracking and reporting
- Performance metrics available via logs

## 🆘 Troubleshooting

### Common Issues

**API Key Invalid**
- Verify API key is set in environment variables
- Check header format: `X-API-Key: your_key`

**Database Connection Issues**
- Verify Supabase credentials
- Check network connectivity
- Ensure database schema is properly set up

**Rate Limiting**
- Check rate limit headers in response
- Implement backoff strategy in client code
- Consider upgrading to higher tier plans

**Web Scraping Failures**
- Sites may have changed structure
- Check Firecrawl API status
- Verify target URLs are accessible

## 📄 License

ISC License - see LICENSE file for details

---

**Built with ❤️ for the Ethereum community**
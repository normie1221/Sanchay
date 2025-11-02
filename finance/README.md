# AI-Powered Finance Manager Backend

A comprehensive Next.js backend system for personal finance management with AI-powered features including expense tracking, budget planning, fraud detection, and financial health analysis.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure authentication using Clerk
- **Income Management**: Track multiple income sources with categorization
- **Expense Tracking**: Record and categorize expenses with detailed metadata
- **Budget Planning**: Create and monitor budgets with AI recommendations
- **Financial Goals**: Set and track progress towards financial objectives
- **Dashboard Analytics**: Comprehensive overview of financial health

### AI/ML Features
- **Smart Budget Planning**: AI-generated budget recommendations based on historical data
- **Expense Prediction**: Forecast future expenses and identify recurring bills
- **Financial Health Analysis**: Calculate comprehensive financial health score (0-100)
- **Spending Pattern Analysis**: Identify trends and optimization opportunities
- **Personalized Recommendations**: Tailored financial advice based on user data

### Security Features
- **Fraud Detection**: Real-time anomaly detection using behavioral analytics
- **Risk Scoring**: Automatic risk assessment for suspicious transactions
- **Behavioral Profiling**: Learn normal spending patterns to detect anomalies
- **Alert System**: Immediate notifications for potentially fraudulent activity
- **Data Encryption**: Sensitive data encrypted using AES-256-GCM
- **Rate Limiting**: API protection against abuse

### Reporting
- **Monthly Summaries**: Comprehensive financial overview reports
- **Expense Analysis**: Detailed breakdown of spending patterns
- **CSV Export**: Download financial data for external analysis
- **Custom Reports**: Generate reports for specific date ranges and categories

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (NeonDB recommended)
- Clerk account for authentication
- Git

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Clerk Authentication (Get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Database (Get from neon.tech)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Encryption (Generate: openssl rand -hex 32)
ENCRYPTION_KEY=your_secure_32_character_key_here
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📚 Complete Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed installation instructions
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation

## 🏗️ Project Structure

```
finance-manager-backend/
├── app/api/              # API routes
│   ├── income/          # Income management
│   ├── expenses/        # Expense tracking
│   ├── budgets/         # Budget management
│   ├── goals/           # Financial goals
│   ├── analytics/       # AI analytics
│   ├── fraud/           # Fraud detection
│   ├── reports/         # Report generation
│   └── dashboard/       # Dashboard data
├── lib/                 # Utility libraries
├── services/            # Business logic
├── prisma/              # Database schema
└── middleware.ts        # Clerk authentication

```

## 🔌 API Endpoints Overview

### Financial Data Management
- `GET/POST /api/income` - Income tracking
- `GET/POST /api/expenses` - Expense management
- `GET/POST /api/budgets` - Budget planning
- `GET/POST /api/goals` - Financial goals

### AI & Analytics
- `GET /api/analytics/health` - Financial health score
- `GET /api/analytics/spending` - Spending analysis
- `GET /api/analytics/predictions` - Expense predictions
- `GET /api/analytics/budget-recommendations` - AI budget suggestions
- `GET /api/analytics/recommendations` - Personalized tips

### Fraud Detection
- `GET /api/fraud/alerts` - Fraud alerts
- `POST /api/fraud/analyze/[id]` - Analyze expense
- `POST /api/fraud/scan` - Scan for fraud

### Reporting & Dashboard
- `GET/POST /api/reports` - Generate reports
- `GET /api/dashboard` - Dashboard overview

## 🎯 Key Features Explained

### AI Budget Planning
Analyzes 6 months of historical data to generate optimized budget recommendations:
- Calculates average spending per category
- Adds buffer based on standard deviation
- Provides confidence scores
- Auto-adjusts based on spending patterns

### Fraud Detection System
Multi-layered approach:
1. **Amount Anomaly**: Detects transactions 2x above average
2. **Merchant Analysis**: Flags unfamiliar merchants
3. **Location Tracking**: Identifies unusual locations
4. **Duplicate Detection**: Catches potential duplicates
5. **Behavioral Profiling**: Learns normal spending patterns

### Financial Health Score
Comprehensive scoring system (0-100):
- Savings Rate (30% weight)
- Budget Adherence (25% weight)
- Income Stability (20% weight)
- Goal Progress (15% weight)
- Emergency Fund (10% weight)

## 🔒 Security

- **Authentication**: Clerk-based JWT authentication
- **Authorization**: User-level data isolation
- **Encryption**: AES-256-GCM for sensitive data
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📊 Database Schema

Key models:
- **User** - User profiles linked to Clerk
- **Income** - Income tracking with categories
- **Expense** - Detailed expense records
- **Budget** - Budget limits and tracking
- **FinancialGoal** - Goal management
- **FraudAlert** - Fraud detection alerts
- **UserBehavior** - Behavioral patterns for ML
- **Report** - Generated reports
- **Insight** - AI-generated insights

See `prisma/schema.prisma` for complete schema.

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# View database
npx prisma studio
```

## 📈 Performance

- Database indexes on frequently queried fields
- Parallel data fetching with Promise.all()
- Efficient Prisma queries
- Rate limiting for API protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Create a Pull Request

## 📝 License

MIT License

## 🆘 Support

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for installation help
- Review [API_REFERENCE.md](./API_REFERENCE.md) for API usage
- Create GitHub issues for bugs
- Check Clerk docs: https://clerk.com/docs
- Check Prisma docs: https://www.prisma.io/docs

## 🔮 Future Enhancements

- [ ] Machine Learning model integration (Python/TensorFlow)
- [ ] Real-time WebSocket notifications
- [ ] Multi-currency support
- [ ] Bank account integration (Plaid)
- [ ] Investment portfolio tracking
- [ ] Tax calculation features
- [ ] Receipt OCR scanning
- [ ] Voice command interface
- [ ] Mobile app (React Native)
- [ ] Email/SMS notifications

## 👥 Project Info

Developed as a mini-project demonstrating:
- AI/ML integration in finance management
- Secure backend architecture
- RESTful API design
- Database design and optimization
- Fraud detection algorithms
- Financial analytics

---

**Note**: This is a backend system. Build a frontend (React, Next.js, or mobile app) to consume these APIs.

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

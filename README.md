# AI Finance Manager - Complete Full-Stack Application

A comprehensive AI-powered personal finance management system with a Next.js frontend and backend, featuring machine learning-based budgeting, expense prediction, fraud detection, and financial health analysis.

## 🚀 Project Structure

```
MiniProject/
├── finance-manager-backend/    # Backend API (Port 3000)
│   ├── app/api/               # API routes
│   ├── lib/                   # Utilities
│   ├── services/              # AI/ML services
│   ├── prisma/                # Database schema
│   └── middleware.ts          # Clerk authentication
│
└── finance-manager-frontend/   # Frontend UI (Port 3001)
    ├── app/                   # Pages and layouts
    ├── lib/                   # API client
    ├── types/                 # TypeScript types
    └── middleware.ts          # Clerk authentication
```

## ✨ Features

### Backend (API)
- ✅ **Authentication**: Clerk-based user authentication
- ✅ **Income Management**: CRUD operations for income sources
- ✅ **Expense Tracking**: Comprehensive expense management with AI categorization
- ✅ **Budget Planning**: AI-powered budget recommendations and tracking
- ✅ **Financial Goals**: Goal setting and progress tracking
- ✅ **Analytics APIs**:
  - Financial health scoring (0-100)
  - Spending analysis and patterns
  - Personalized recommendations
  - Budget recommendations
  - Expense predictions (ML-based)
- ✅ **Fraud Detection**: Real-time anomaly detection and risk scoring
- ✅ **Reports**: CSV export and monthly summaries
- ✅ **Security**: AES-256-GCM encryption, rate limiting

### Frontend (UI)
- ✅ **Landing Page**: Beautiful hero section with feature highlights
- ✅ **Dashboard**: Comprehensive financial overview
  - Financial health score visualization
  - Income/Expense/Savings summary
  - Budget progress tracking
  - Financial goals progress
  - Fraud alerts
  - Recent transactions
- ✅ **Authentication**: Clerk sign-in/sign-up integration
- ✅ **Responsive Design**: Mobile-friendly Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Clerk
- **Validation**: Zod
- **Security**: bcryptjs, crypto (AES-256-GCM)
- **TypeScript**: Full type safety

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts**: Recharts
- **TypeScript**: Full type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (NeonDB recommended)
- Clerk account (https://clerk.com)

### 1. Clone and Install

```bash
# Navigate to project directory
cd /Users/adityakumar/Desktop/MiniProject

# Install backend dependencies
cd finance-manager-backend
npm install

# Install frontend dependencies  
cd ../finance-manager-frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env.local)
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (NeonDB PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Frontend (.env.local)
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Database Setup

```bash
cd finance-manager-backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### 4. Run the Application

#### Start Backend (Terminal 1)
```bash
cd finance-manager-backend
npm run dev
# Backend runs on http://localhost:3000
```

#### Start Frontend (Terminal 2)
```bash
cd finance-manager-frontend
npm run dev -- -p 3001
# Frontend runs on http://localhost:3001
```

### 5. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **API Documentation**: See `finance-manager-backend/API_REFERENCE.md`

## 📋 API Endpoints

### Authentication
All API endpoints require Clerk authentication via JWT tokens.

### Main Endpoints

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| **Income** | `/api/income` | GET, POST | Manage income sources |
| **Expenses** | `/api/expenses` | GET, POST | Track expenses |
| **Budgets** | `/api/budgets` | GET, POST | Budget management |
| **Goals** | `/api/goals` | GET, POST | Financial goals |
| **Analytics** | `/api/analytics/health` | GET | Financial health score |
| | `/api/analytics/spending` | GET | Spending analysis |
| | `/api/analytics/recommendations` | GET | AI recommendations |
| | `/api/analytics/predictions` | GET | Expense predictions |
| **Fraud** | `/api/fraud/alerts` | GET | Fraud alerts |
| | `/api/fraud/scan` | POST | Scan for fraud |
| **Dashboard** | `/api/dashboard` | GET | Dashboard overview |
| **Reports** | `/api/reports` | POST | Generate reports |

## 🤖 AI Features

### 1. Budget Planning Service
- Analyzes 6 months of spending history
- Generates category-wise budget recommendations
- Creates adaptive budgets automatically
- Confidence scoring for recommendations

### 2. Expense Prediction Service
- Predicts next month's expenses by category
- Detects recurring expenses
- Forecasts upcoming bills
- Trend analysis with dampening

### 3. Financial Health Service
- Calculates comprehensive health score (0-100)
- Weighted scoring:
  - Savings Rate: 30%
  - Budget Adherence: 25%
  - Income Stability: 20%
  - Goal Progress: 15%
  - Emergency Fund: 10%
- Personalized recommendations
- Spending pattern analysis

### 4. Fraud Detection Service
- Real-time anomaly detection
- Behavioral profiling
- Multi-factor risk assessment:
  - Amount anomalies (Z-score analysis)
  - Merchant analysis
  - Location tracking
  - Duplicate detection
- Risk scoring (0-100)

## 🎨 Frontend Pages

### Current Pages
- ✅ **/** - Landing page with feature showcase
- ✅ **/dashboard** - Main dashboard with financial overview
- ✅ **Authentication** - Clerk sign-in/sign-up modals

### Planned Pages
- [ ] **/expenses** - Expense list and management
- [ ] **/expenses/new** - Add new expense
- [ ] **/income** - Income list and management
- [ ] **/budgets** - Budget management
- [ ] **/goals** - Financial goals
- [ ] **/analytics** - Advanced analytics and predictions
- [ ] **/fraud/alerts** - Fraud alert management
- [ ] **/reports** - Report generation and export

## 🔒 Security Features

- **Authentication**: Clerk JWT-based authentication
- **Encryption**: AES-256-GCM for sensitive data
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM
- **HTTPS**: SSL/TLS encryption (production)

## 📊 Database Schema

Key models:
- **User**: Clerk-integrated user management
- **Income**: Income sources and tracking
- **Expense**: Detailed expense records with AI fields
- **Budget**: Budget tracking with AI generation
- **FinancialGoal**: Goal management
- **FraudAlert**: Fraud detection records
- **UserBehavior**: ML pattern learning
- **Report**: Generated reports
- **Insight**: AI-generated insights

## 🚢 Deployment

### Backend
1. Deploy to Vercel, Railway, or similar platform
2. Configure environment variables
3. Set up PostgreSQL database (NeonDB recommended)
4. Run migrations

### Frontend
1. Deploy to Vercel or similar platform
2. Configure environment variables
3. Set `NEXT_PUBLIC_API_URL` to backend URL

## 📝 Documentation

- **Backend API**: `finance-manager-backend/API_REFERENCE.md`
- **Setup Guide**: `finance-manager-backend/SETUP_GUIDE.md`
- **Deployment**: `finance-manager-backend/DEPLOYMENT.md`
- **Quick Start**: `finance-manager-backend/QUICKSTART.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎯 Roadmap

- [ ] Complete all frontend pages
- [ ] Add charts and visualizations
- [ ] Implement file upload for receipts
- [ ] Add mobile app
- [ ] Integration with banking APIs
- [ ] Enhanced ML models
- [ ] Multi-currency support
- [ ] Social features (sharing goals)
- [ ] Notifications system

## 💡 Tips

- **Development**: Use `npm run dev` in both directories simultaneously
- **Database**: Use Prisma Studio (`npx prisma studio`) to view database
- **Testing**: Test API endpoints at http://localhost:3000/api
- **Debugging**: Check browser console and terminal logs

## 🐛 Troubleshooting

### "Publishable key not valid"
- Ensure Clerk keys are correctly copied from dashboard
- Check `.env.local` files in both backend and frontend
- Restart both servers after updating env variables

### Database connection errors
- Verify DATABASE_URL is correct
- Check database is running
- Run `npx prisma migrate dev`

### Port already in use
- Change port: `npm run dev -- -p 3002`
- Or kill process using the port

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Open an issue on GitHub

---

**Built with ❤️ using Next.js, Prisma, Clerk, and AI/ML**
# Sanchay

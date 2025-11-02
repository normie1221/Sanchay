# 🚀 Quick Start - AI Finance Manager Backend

Get up and running in 5 minutes!

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

---

## Step 1: Environment Setup (2 minutes)

### Get Clerk API Keys
1. Visit https://clerk.com and sign up
2. Create new application
3. Copy **Publishable Key** and **Secret Key**

### Get NeonDB Connection
1. Visit https://neon.tech and sign up
2. Create new project
3. Copy **Connection String**

---

## Step 2: Configure Project (1 minute)

```bash
# Navigate to project
cd finance-manager-backend

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Add your Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Add your NeonDB connection
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Generate encryption key (run: openssl rand -hex 32)
ENCRYPTION_KEY=your_32_character_secure_key_here
```

---

## Step 3: Install & Setup (2 minutes)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

---

## Step 4: Start Development Server

```bash
npm run dev
```

✅ Server running at: http://localhost:3000

---

## Step 5: Test the Setup

### Option A: Use Prisma Studio
```bash
npx prisma studio
```
Opens database viewer in browser

### Option B: Test API Endpoint
1. Sign up at: http://localhost:3000/sign-up
2. After login, test dashboard:
   ```bash
   curl http://localhost:3000/api/dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## Common Issues & Fixes

### Database Connection Error
```bash
# Verify connection
npx prisma db push
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Clerk Error
- Double-check your API keys
- Ensure no extra spaces in .env.local
- Verify Clerk app is active

---

## What's Next?

### Explore the API
Check out `API_REFERENCE.md` for all available endpoints

### View Data
```bash
npx prisma studio
```

### Read Documentation
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `DEPLOYMENT.md` - Deploy to production

---

## Quick API Examples

### Create Income
```bash
curl -X POST http://localhost:3000/api/income \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 5000,
    "source": "Salary",
    "category": "SALARY",
    "frequency": "MONTHLY",
    "date": "2024-01-01"
  }'
```

### Create Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 50,
    "category": "Food",
    "merchant": "Coffee Shop",
    "date": "2024-01-15"
  }'
```

### Get Financial Health
```bash
curl http://localhost:3000/api/analytics/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Development Tips

### Watch Database Changes
```bash
npx prisma studio
```

### View Logs
Check your terminal where `npm run dev` is running

### Hot Reload
Changes automatically reload - just save your files!

---

## Need Help?

1. **Setup Issues**: Check `SETUP_GUIDE.md`
2. **API Questions**: Check `API_REFERENCE.md`
3. **Deployment**: Check `DEPLOYMENT.md`
4. **Overview**: Check `PROJECT_SUMMARY.md`

---

## Project Structure Quick View

```
finance-manager-backend/
├── app/api/           # All API endpoints
├── services/          # Business logic
├── lib/              # Utilities
├── prisma/           # Database schema
└── middleware.ts     # Authentication
```

---

**Ready to build something amazing! 🚀**

For detailed documentation, see README.md

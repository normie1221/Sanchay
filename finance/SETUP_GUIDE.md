# Setup Guide

## Step 1: Prerequisites

Make sure you have:
- Node.js 18 or higher
- npm or yarn
- A code editor (VS Code recommended)
- Git

## Step 2: Database Setup with NeonDB

### Create NeonDB Account
1. Go to https://neon.tech
2. Sign up for a free account
3. Click "Create Project"
4. Choose a project name (e.g., "finance-manager")
5. Select a region close to you
6. Click "Create Project"

### Get Connection String
1. In your project dashboard, click "Connection Details"
2. Copy the connection string (should look like):
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```
3. Save this for later

## Step 3: Clerk Authentication Setup

### Create Clerk Account
1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application
4. Choose authentication methods (Email, Google, etc.)

### Get API Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)
3. Save these for later

### Configure URLs
In Clerk dashboard → Settings → Paths:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

## Step 4: Environment Configuration

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   # Paste your Clerk keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   
   # Paste your NeonDB connection string
   DATABASE_URL="postgresql://..."
   
   # Generate a secure encryption key (32 characters)
   # You can use: openssl rand -hex 32
   ENCRYPTION_KEY=your_secure_32_character_key_here
   ```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Verify setup (optional)
npx prisma studio
```

This will open Prisma Studio in your browser where you can see your database tables.

## Step 7: Run the Application

```bash
npm run dev
```

The server should start at http://localhost:3000

## Step 8: Test the Setup

### Test 1: Check if server is running
Open http://localhost:3000 in your browser

### Test 2: Test authentication
1. Navigate to `/sign-up` (you should see Clerk's sign-up form)
2. Create a test account
3. You should be redirected after signing up

### Test 3: Test API endpoint
```bash
# Replace YOUR_TOKEN with your Clerk session token
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Database Connection Error
- Verify your DATABASE_URL is correct
- Check if NeonDB project is active
- Ensure the connection string includes `?sslmode=require`

### Clerk Authentication Error
- Verify your Clerk keys are correct
- Check if both publishable and secret keys are set
- Ensure Clerk app is not in development mode restrictions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Prisma Migration Error
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name init
```

## Next Steps

1. **Test the APIs**: Use the API documentation to test endpoints
2. **Create Test Data**: Use Prisma Studio or API endpoints to add sample data
3. **Build Frontend**: Create a React/Next.js frontend to consume these APIs
4. **Deploy**: Follow deployment guide for production

## Development Tips

### View Database
```bash
npx prisma studio
```

### Check Logs
- Check terminal for server logs
- Check browser console for client errors
- Check Clerk dashboard for auth logs

### Hot Reload
The Next.js dev server has hot reload enabled. Just save your files and changes will reflect immediately.

### Database Schema Changes
After modifying `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

## Production Checklist

Before deploying to production:

- [ ] Set strong ENCRYPTION_KEY
- [ ] Use production Clerk keys
- [ ] Set up production database
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS
- [ ] Set up backup strategy
- [ ] Configure rate limiting
- [ ] Review security settings
- [ ] Set up error tracking (Sentry, etc.)

## Need Help?

- Check the README.md for detailed documentation
- Review API_REFERENCE.md for API usage
- Check GitHub issues
- Review Clerk documentation: https://clerk.com/docs
- Review Prisma documentation: https://www.prisma.io/docs

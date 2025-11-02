# Deployment Guide

## Prerequisites

Before deploying, ensure:
- All environment variables are set
- Database is accessible from production
- Clerk is configured for production domain
- You have tested locally

---

## Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

### Step 1: Prepare Your Repository

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Import Project"
4. Select your repository
5. Configure project:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```env
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Production Database
DATABASE_URL=postgresql://...

# Encryption
ENCRYPTION_KEY=your_production_key

# API URL (use your Vercel domain)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Step 4: Update Clerk for Production

1. Go to Clerk dashboard
2. Navigate to your application
3. Under "Domains" → Add your Vercel domain
4. Update allowed origins and redirect URLs

### Step 5: Deploy

Click "Deploy" in Vercel dashboard.

Your app will be live at: `https://your-app.vercel.app`

### Continuous Deployment

Every push to your main branch will automatically deploy to Vercel.

---

## Option 2: Railway

Railway is another great option with built-in PostgreSQL.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### Step 3: Add PostgreSQL

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will create a database
3. Copy the DATABASE_URL from Variables tab

### Step 4: Configure Environment

Add all environment variables in Settings → Variables

### Step 5: Deploy

Railway automatically deploys. Your app will be at:
`https://your-app.up.railway.app`

---

## Option 3: DigitalOcean App Platform

### Step 1: Create App

1. Go to DigitalOcean
2. Create → Apps → Deploy from GitHub
3. Select repository

### Step 2: Configure

- **Environment**: Node.js
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **HTTP Port**: 3000

### Step 3: Add Database

1. Create managed PostgreSQL database
2. Add DATABASE_URL to environment

### Step 4: Deploy

App will be available at: `https://your-app.ondigitalocean.app`

---

## Option 4: AWS (Advanced)

### Using AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize:
```bash
eb init
```

3. Create environment:
```bash
eb create production
```

4. Deploy:
```bash
eb deploy
```

### Using AWS Amplify

1. Go to AWS Amplify Console
2. Connect GitHub repository
3. Configure build settings
4. Deploy

---

## Option 5: Self-Hosted (VPS)

### Requirements
- Ubuntu 20.04+ server
- Node.js 18+
- Nginx
- PostgreSQL
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### Step 2: Database Setup

```bash
sudo -u postgres psql

# Create database and user
CREATE DATABASE finance_manager;
CREATE USER finance_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE finance_manager TO finance_user;
\q
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
git clone YOUR_REPO_URL finance-manager
cd finance-manager

# Install dependencies
npm install

# Create .env.local with production values
nano .env.local

# Build application
npm run build

# Start with PM2
pm2 start npm --name "finance-api" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/finance-manager
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/finance-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=finance_manager
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] App loads without errors
- [ ] Authentication works
- [ ] Database connection successful
- [ ] API endpoints respond correctly

### 2. Test Critical Paths

```bash
# Test health endpoint (if created)
curl https://your-app.com/api/health

# Test authentication
# Sign up and sign in through the UI

# Test API endpoint
curl https://your-app.com/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Configure Monitoring

**Vercel**: Built-in analytics and logs

**Self-hosted**: Set up monitoring with:
- PM2 monitoring: `pm2 monit`
- Log aggregation (e.g., Papertrail, Logtail)
- Uptime monitoring (e.g., UptimeRobot)
- Error tracking (e.g., Sentry)

### 4. Set Up Backups

**Database Backups**:

```bash
# Automated daily backup
0 2 * * * pg_dump -U user database > /backups/db_$(date +\%Y\%m\%d).sql
```

### 5. Security Hardening

- [ ] Enable HTTPS only
- [ ] Set secure headers
- [ ] Configure CORS properly
- [ ] Review rate limiting
- [ ] Enable database connection pooling
- [ ] Set up firewall rules

### 6. Performance Optimization

- [ ] Enable caching where appropriate
- [ ] Configure CDN for static assets
- [ ] Optimize database queries
- [ ] Monitor response times
- [ ] Set up connection pooling

---

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost/finance_dev
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db/finance_staging
NEXT_PUBLIC_API_URL=https://staging.your-app.com
```

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod-db/finance_production
NEXT_PUBLIC_API_URL=https://your-app.com
```

---

## Rollback Strategy

### Vercel
- Go to Deployments
- Click "..." on previous deployment
- Click "Promote to Production"

### PM2 (Self-hosted)
```bash
# Stop current version
pm2 stop finance-api

# Checkout previous version
git checkout PREVIOUS_COMMIT_HASH

# Reinstall and rebuild
npm install
npm run build

# Restart
pm2 restart finance-api
```

---

## Scaling Considerations

### Horizontal Scaling
- Deploy to multiple regions
- Use load balancer
- Implement database replication

### Vertical Scaling
- Increase server resources
- Optimize database
- Implement caching (Redis)

### Database Optimization
- Add appropriate indexes
- Use connection pooling (PgBouncer)
- Implement read replicas
- Consider database sharding for large scale

---

## Maintenance

### Regular Tasks

**Weekly**:
- Review error logs
- Check performance metrics
- Monitor disk space

**Monthly**:
- Update dependencies
- Review security patches
- Optimize database
- Review and clean up old data

**Quarterly**:
- Full security audit
- Performance review
- Cost optimization
- Backup restoration test

---

## Troubleshooting

### App Won't Start
```bash
# Check logs
pm2 logs finance-api

# Check environment variables
env | grep DATABASE_URL

# Test database connection
npx prisma studio
```

### Database Connection Issues
- Verify DATABASE_URL format
- Check firewall rules
- Verify SSL requirements
- Test connection with psql

### High Memory Usage
```bash
# Monitor PM2
pm2 monit

# Restart if needed
pm2 restart finance-api

# Check for memory leaks in logs
```

---

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review platform-specific documentation
5. Create GitHub issue with logs

---

**Remember**: Always test thoroughly in staging before deploying to production!

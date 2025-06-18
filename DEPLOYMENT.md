# Deployment Guide for Render.com

This guide will walk you through deploying the Bitespeed Identity Reconciliation System to Render.com.

## Prerequisites

1. **GitHub Account** with your code repository
2. **Render.com Account** (free tier available)
3. **PostgreSQL Database** (can be created on Render.com)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository contains:
- ✅ `package.json` with proper scripts
- ✅ `render.yaml` configuration file
- ✅ `src/` directory with your source code
- ✅ `prisma/` directory with database schema
- ✅ `.gitignore` excluding `node_modules` and `.env`

### 2. Create PostgreSQL Database on Render

1. **Login to Render.com**
2. **Create a new PostgreSQL database:**
   - Click "New +" → "PostgreSQL"
   - **Name:** `bitespeed-db`
   - **Database:** `bitespeed`
   - **User:** `bitespeed_user`
   - **Plan:** Free
3. **Copy the connection string** from the database dashboard

### 3. Deploy the Web Service

1. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - **Connect your GitHub repository**

2. **Configure the service:**
   - **Name:** `bitespeed-identity-reconciliation`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Build Command:** `npm install && npm run prisma:generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

3. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `[Your PostgreSQL connection string from Step 2]`
   - `PORT` = `3000`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build to complete (usually 2-5 minutes)

### 4. Run Database Migrations

After deployment, you need to run database migrations:

1. **Access your service logs** in the Render dashboard
2. **Add a temporary environment variable:**
   - `RUN_MIGRATIONS` = `true`
3. **Redeploy** the service
4. **Remove the temporary variable** after successful migration

### 5. Test Your Deployment

Once deployed, test your API:

```bash
# Test the live endpoint
curl -X POST https://your-app-name.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "555-1234"}'
```

## Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `PORT` | `3000` | Server port (Render sets this automatically) |

## Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation works locally
   - Verify `render.yaml` syntax

2. **Database Connection Fails:**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Render
   - Check if migrations have been run

3. **Service Won't Start:**
   - Check logs for error messages
   - Verify `startCommand` in `render.yaml`
   - Ensure `dist/app.js` exists after build

### Useful Commands

```bash
# Check build logs
# View in Render dashboard

# Test database connection
# Check service logs in Render dashboard

# Verify environment variables
# Check in Render dashboard → Environment
```

## Monitoring

- **Logs:** Available in Render dashboard
- **Metrics:** Basic metrics provided by Render
- **Health Check:** Service automatically restarts on failure

## Cost

- **Free Tier:** Includes 750 hours/month
- **Database:** Free PostgreSQL with 1GB storage
- **Bandwidth:** 100GB/month included

## Security

- **HTTPS:** Automatically enabled
- **Environment Variables:** Securely stored
- **Database:** Isolated and secure

## Scaling

- **Free Tier:** Single instance
- **Paid Plans:** Auto-scaling available
- **Database:** Can be upgraded for more storage/performance

## Support

- **Render Documentation:** https://render.com/docs
- **Community:** Render Discord/Slack
- **Issues:** GitHub repository issues 
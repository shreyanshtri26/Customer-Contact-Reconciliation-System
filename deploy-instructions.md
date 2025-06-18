# 🚀 Render.com Deployment Instructions

## Quick Deployment Steps

Your code is now ready for deployment! Follow these steps:

### 1. Go to Render.com
- Visit: https://render.com
- Sign up or login with your GitHub account

### 2. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. **Name:** `bitespeed-db`
3. **Database:** `bitespeed`
4. **User:** `bitespeed_user`
5. **Plan:** Free
6. **Region:** Choose closest to you
7. Click "Create Database"
8. **Copy the connection string** from the database dashboard

### 3. Create Web Service
1. Click "New +" → "Web Service"
2. **Connect your GitHub repository:** `shreyanshtri26/Customer-Contact-Reconciliation-System`
3. **Name:** `bitespeed-identity-reconciliation`
4. **Environment:** `Node`
5. **Region:** Same as database
6. **Branch:** `main`
7. **Build Command:** `npm install && npm run prisma:generate && npm run build`
8. **Start Command:** `npm start`
9. **Plan:** Free

### 4. Add Environment Variables
Click "Environment" tab and add:
- `NODE_ENV` = `production`
- `DATABASE_URL` = `[Your PostgreSQL connection string from Step 2]`
- `PORT` = `3000`

### 5. Deploy
1. Click "Create Web Service"
2. Wait for build to complete (2-5 minutes)
3. Your API will be available at: `https://bitespeed-identity-reconciliation.onrender.com`

### 6. Run Database Migrations
After deployment:
1. Go to your service dashboard
2. Add environment variable: `RUN_MIGRATIONS` = `true`
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Remove the `RUN_MIGRATIONS` variable

### 7. Test Your API
```bash
# Test the live endpoint
curl -X POST https://bitespeed-identity-reconciliation.onrender.com/api/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "555-1234"}'

# Or run the test script
npm run test:live
```

## Your Live API Endpoint

Once deployed, your API will be available at:
**`https://bitespeed-identity-reconciliation.onrender.com/api/identify`**

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation works locally

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Render
- Check if migrations have been run

### Service Won't Start
- Check logs for error messages
- Verify environment variables are set correctly
- Ensure `dist/app.js` exists after build

## Support

- **Render Documentation:** https://render.com/docs
- **Your Repository:** https://github.com/shreyanshtri26/Customer-Contact-Reconciliation-System
- **Health Check:** `https://bitespeed-identity-reconciliation.onrender.com/health`

## Cost
- **Free Tier:** 750 hours/month
- **Database:** Free PostgreSQL with 1GB storage
- **Bandwidth:** 100GB/month included

🎉 **Your Bitespeed Identity Reconciliation System will be live and ready for testing!** 
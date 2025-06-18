# Deployment Guide

## Deploying to Vercel

### Prerequisites
1. Vercel account (free at https://vercel.com)
2. GitHub repository with your code
3. Render PostgreSQL database (already set up)

### Steps to Deploy

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=postgresql://bitespeed_user:xdtYDyqgtlTyln149VjoA341J7NNBUzz@dpg-d19bdifgi27c73flbrcg-a.oregon-postgres.render.com/bitespeed_2k3b
   NODE_ENV=production
   ```

4. **Deploy Settings**
   - Framework Preset: Node.js
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Post-Deployment

1. **Test the API**
   ```bash
   curl -X POST https://your-app-name.vercel.app/api/identify \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
   ```

2. **Update README**
   - Replace the placeholder URL with your actual Vercel URL
   - Update the testing examples

### Troubleshooting

- **Build fails**: Check that all TypeScript errors are resolved
- **Database connection fails**: Verify the DATABASE_URL environment variable
- **API returns 500**: Check Vercel function logs for errors

### Environment Variables for Vercel

Make sure these are set in your Vercel project settings:

```
DATABASE_URL=postgresql://bitespeed_user:xdtYDyqgtlTyln149VjoA341J7NNBUzz@dpg-d19bdifgi27c73flbrcg-a.oregon-postgres.render.com/bitespeed_2k3b
NODE_ENV=production
``` 
# Deployment Guide

This guide covers deploying the AI Interview Platform to production.

## Architecture Overview

```
Frontend (Vercel) → Backend (Render) → Database (MongoDB Atlas)
                           ↓
                    OpenAI API
```

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas account (free tier available)
- OpenAI API key with credits

## Step 1: Setup MongoDB Atlas

1. **Create Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set privileges to "Read and write to any database"

4. **Configure Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-interview-platform`

## Step 2: Deploy Backend to Render

1. **Push Code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/ai-interview-platform.git
   git push -u origin main
   ```

2. **Create Render Account:**
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** ai-interview-backend
     - **Region:** Choose closest to your users
     - **Branch:** main
     - **Root Directory:** backend
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free

4. **Add Environment Variables:**
   Click "Environment" and add:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_production
   JWT_EXPIRE=7d
   OPENAI_API_KEY=sk-your-openai-api-key
   MAX_FILE_SIZE=5242880
   FRONTEND_URL=https://your-app.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://ai-interview-backend.onrender.com`

## Step 3: Deploy Frontend to Vercel

1. **Install Vercel CLI (Optional):**
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [Vercel](https://vercel.com/)
   - Sign up with GitHub
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset:** Create React App
     - **Root Directory:** frontend
     - **Build Command:** `npm run build`
     - **Output Directory:** build

3. **Add Environment Variables:**
   ```
   REACT_APP_API_URL=https://ai-interview-backend.onrender.com
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Your app will be live at: `https://your-app.vercel.app`

5. **Update Backend CORS:**
   - Go back to Render
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

## Step 4: Configure Custom Domain (Optional)

### Vercel (Frontend)
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Render (Backend)
1. Go to your service settings
2. Click "Custom Domains"
3. Add your custom domain (e.g., api.yourdomain.com)
4. Update DNS records as instructed

## Step 5: Verify Deployment

1. **Test Backend:**
   ```bash
   curl https://ai-interview-backend.onrender.com/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **Test Frontend:**
   - Visit your Vercel URL
   - Register a new account
   - Upload a resume
   - Start an interview

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with correct API URL
- [ ] CORS configured correctly
- [ ] OpenAI API key has sufficient credits
- [ ] Test user registration and login
- [ ] Test resume upload and analysis
- [ ] Test interview creation and voice features
- [ ] SSL/HTTPS enabled (automatic on Vercel and Render)
- [ ] Error monitoring setup (optional)

## Monitoring and Maintenance

### Render Monitoring
- View logs: Dashboard → Your Service → Logs
- Monitor metrics: CPU, Memory, Response time
- Set up alerts for downtime

### Vercel Monitoring
- View deployment logs
- Monitor function execution
- Check analytics

### MongoDB Atlas Monitoring
- Monitor database performance
- Set up alerts for high usage
- Review slow queries

## Scaling

### Free Tier Limitations
- **Render Free:** 
  - Spins down after 15 minutes of inactivity
  - 750 hours/month
  - Limited CPU and memory

- **Vercel Free:**
  - 100 GB bandwidth/month
  - Unlimited deployments

- **MongoDB Atlas Free:**
  - 512 MB storage
  - Shared CPU

### Upgrade Path
1. **Render:** Upgrade to Starter ($7/month) for always-on service
2. **Vercel:** Upgrade to Pro ($20/month) for more bandwidth
3. **MongoDB Atlas:** Upgrade to M10 ($57/month) for dedicated cluster

## Troubleshooting

### Backend Not Responding
- Check Render logs for errors
- Verify environment variables
- Ensure MongoDB connection string is correct
- Check if service is sleeping (free tier)

### CORS Errors
- Verify `FRONTEND_URL` in backend matches Vercel URL
- Check CORS configuration in `server.js`
- Ensure both URLs use HTTPS

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Test connection string locally first

### OpenAI API Errors
- Verify API key is correct
- Check OpenAI account has credits
- Monitor rate limits

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate API keys regularly

2. **Database:**
   - Use strong database passwords
   - Enable MongoDB Atlas encryption
   - Regular backups

3. **API:**
   - Implement rate limiting (already configured)
   - Use HTTPS only
   - Validate all inputs

4. **Monitoring:**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API usage
   - Track failed login attempts

## Backup Strategy

### Database Backups
- MongoDB Atlas provides automatic backups on paid tiers
- For free tier, export data regularly:
  ```bash
  mongodump --uri="your_connection_string"
  ```

### Code Backups
- Keep code in GitHub
- Tag releases
- Maintain changelog

## Cost Estimation

### Free Tier (Good for MVP/Testing)
- Render: Free
- Vercel: Free
- MongoDB Atlas: Free
- OpenAI: Pay per use (~$0.002 per 1K tokens)

**Estimated Monthly Cost:** $5-20 (mostly OpenAI usage)

### Production Tier (Recommended for Launch)
- Render Starter: $7/month
- Vercel Pro: $20/month
- MongoDB Atlas M10: $57/month
- OpenAI: $50-200/month (depending on usage)

**Estimated Monthly Cost:** $134-284

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Rollback Procedure

If deployment fails:

1. **Render:**
   - Go to "Events" tab
   - Click "Rollback" on previous successful deployment

2. **Vercel:**
   - Go to "Deployments"
   - Click "..." on previous deployment
   - Select "Promote to Production"

3. **Database:**
   - Restore from MongoDB Atlas backup
   - Or use your manual backup

## Next Steps After Deployment

1. Set up custom domain
2. Configure email notifications
3. Add analytics (Google Analytics, Mixpanel)
4. Implement error tracking (Sentry)
5. Set up CI/CD pipeline
6. Add automated tests
7. Configure CDN for static assets
8. Implement caching strategy

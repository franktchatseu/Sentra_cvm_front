# Deployment Guide

## Vercel Deployment

### Important: HTTPS Configuration

When deploying to Vercel (or any HTTPS platform), you **must** ensure your backend API is also served over HTTPS. Browsers block HTTP requests from HTTPS pages (Mixed Content error).

### Environment Variables

Set the following environment variables in your Vercel project settings:

1. **API_BASE_URL** (Optional)
   - The backend API base URL
   - Default in production: `https://cvm.groupngs.com/api/database-service`
   - Only set this if your backend URL is different
   - **Important**: Must use HTTPS protocol, not HTTP

#### Setting Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the variable:
   - **Name**: `API_BASE_URL`
   - **Value**: `https://cvm.groupngs.com/api/database-service` (or your backend URL)
   - **Environments**: Select Production, Preview, and Development as needed

### Backend Server Requirements

Your backend server (`cvm.groupngs.com`) must:
1. ✅ Support HTTPS connections
2. ✅ Have a valid SSL/TLS certificate
3. ✅ Be accessible on port 443 (default HTTPS) or specify custom port in URL
4. ✅ Allow CORS from your Vercel domain

### Common Issues

#### Mixed Content Error
**Error**: `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'`

**Solution**: 
- Ensure `API_BASE_URL` uses `https://` protocol
- Check that your backend server supports HTTPS
- If using a custom port, include it in the URL: `https://cvm.groupngs.com:8443/api/database-service`

#### CORS Issues
If you get CORS errors after fixing HTTPS:
- Verify your backend allows requests from your Vercel domain
- Check that the proxy.js CORS configuration includes your domain

### Deployment Steps

1. **Push your code** to GitHub
   ```bash
   git add .
   git commit -m "Fix HTTPS configuration for production"
   git push
   ```

2. **Vercel will auto-deploy** if connected to your repo
   - Or manually deploy: `vercel --prod`

3. **Verify** the deployment
   - Check browser console for errors
   - Test API calls in the Network tab

### Local Development

For local development, the app uses HTTP by default:
- Frontend: `http://localhost:5173`
- Backend (expected): `http://localhost:8080`

No special configuration needed for local development.

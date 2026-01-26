# Vercel Deployment Guide

## Quick Setup

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Connect to Vercel

#### Option A: Web Dashboard (Recommended)
1. Go to https://vercel.com
2. Sign up or log in
3. Click "New Project"
4. Import from GitHub (connect your repo)
5. Select this project
6. Click "Deploy"

#### Option B: CLI
```bash
vercel
```
Follow the prompts to authenticate and deploy.

### 3. Set Environment Variables

On Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:
   ```
   VITE_APPWRITE_ENDPOINT = https://sgp.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID = 697777ab003b4896ab21
   ```

### 4. Deploy

The project will automatically deploy when you:
- Push to main branch
- Merge a pull request
- Use `vercel deploy` command

---

## Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "./dist",
  "framework": "vite",
  "env": {
    "VITE_APPWRITE_ENDPOINT": "@appwrite_endpoint",
    "VITE_APPWRITE_PROJECT_ID": "@appwrite_project_id"
  }
}
```

### .vercelignore
Excludes unnecessary files from deployment:
- node_modules
- .git
- .env files
- dist (rebuilt during deploy)
- logs and cache

### public/_redirects
Enables SPA routing - all routes redirect to index.html

---

## Build & Deployment

### Local Build
```bash
npm run build
```
Creates `dist/` folder ready for deployment.

### Build Output
- HTML: 1.03 KB
- CSS: 74.01 KB
- JavaScript: 563.33 KB
- Build time: ~9 seconds

### Vercel Build
- Runs `npm run build` automatically
- Uses Node.js 18+ (default)
- Deploys from `dist/` folder

---

## Domains & Custom URLs

### Free Domains
- `project-name.vercel.app` (automatic)

### Custom Domains
1. Dashboard → Settings → Domains
2. Add your domain
3. Follow DNS setup instructions
4. Verify ownership

---

## Environment Variables

### Development (.env.local)
```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=697777ab003b4896ab21
```

### Vercel Dashboard
Set same variables in Project Settings → Environment Variables

---

## Troubleshooting

### Build Fails
- Check Node version: `node --version`
- Clear cache: `npm ci` (instead of npm install)
- Verify build locally: `npm run build`

### 404 Errors
- Enable SPA routing (uses `public/_redirects`)
- Vercel should serve index.html for all routes

### Module Load Errors
- Make sure `npm run build` succeeds locally
- Verify all imports are correct
- Check environment variables are set

### Slow Builds
- Can optimize with dynamic imports
- Current build: ~7-9 seconds (acceptable)

---

## Preview & Production

### Preview Deployments
- Automatic for pull requests
- Temporary URLs for testing
- Full feature parity with production

### Production Deployments
- Triggered on push to main
- Gets `project.vercel.app` URL
- Permanent deployment

---

## Logs & Monitoring

### View Logs
```bash
vercel logs
```

### Dashboard
- Deployments → Select deployment → Logs
- See build output and errors

### Monitor Performance
- Analytics dashboard available
- Real-time metrics
- Error tracking

---

## Rollback & Revert

### Revert to Previous Version
1. Dashboard → Deployments
2. Find previous version
3. Click "Promote to Production"

### Via CLI
```bash
vercel promote <deployment-id>
```

---

## GitHub Integration

### Auto Deploy
1. Connect GitHub repo in Vercel dashboard
2. Select main branch
3. Auto-deploys on push

### Pull Request Preview
- Automatic preview URL on each PR
- Test before merging to main
- Full staging environment

---

## Performance Tips

### Reduce Bundle Size
- Use dynamic imports for large features
- Lazy load components
- Tree-shake unused code

### Optimize Images
- Use WebP format
- Compress images
- Use CDN (Vercel provides)

### Caching
- Vercel caches assets automatically
- Use cache headers for assets

---

## Deployment Checklist

- [ ] GitHub repo created and connected
- [ ] Environment variables set in Vercel dashboard
- [ ] `vercel.json` configured
- [ ] `.vercelignore` in place
- [ ] `public/_redirects` for SPA routing
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Test locally (`npm run dev`)
- [ ] Deploy via dashboard or CLI
- [ ] Verify custom domain (if using)
- [ ] Test all routes on deployed site

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Next.js on Vercel](https://vercel.com/docs/next.js)
- [Vercel Support](https://vercel.com/support)

---

**Ready for Deployment! 🚀**

For detailed steps, see Vercel Dashboard or contact support.

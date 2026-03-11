# SalesCareerHub - Render Deployment

## 🚀 Ready for Render

This application is fully configured and ready for deployment on Render.com.

## 📋 Required Environment Variables

Set these in your Render Dashboard → Environment Variables:

### MongoDB Connection
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/salescareerhub?retryWrites=true&w=majority&appName=salescareerhub
```

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_EMAILS=admin@deine-domain.de
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
NEXT_PUBLIC_APP_NAME=SalesCareerHub
NODE_ENV=production
```

## 🔧 Firebase Setup

1. **Firebase Console Settings**:
   - Add your Render URL (`https://your-app-name.onrender.com`) to Authentication → Settings → Authorized domains
   - Enable Google sign-in in Authentication → Sign-in method
   - Enable Apple sign-in in Authentication → Sign-in method
   - Download service account key for Admin SDK

2. **Google Sign-In**:
   - Add the Render URL to Firebase Authorized Domains
   - If you use a custom domain, add that domain as well

3. **Apple Sign-In**:
   - Create an Apple Sign In capability in your Apple Developer account
   - Register the Firebase redirect URL from the Apple provider setup in Firebase
   - Add the production Render domain and the final custom domain in Firebase Authorized Domains
   - Without the Apple Developer configuration, Apple login will not complete in production

4. **Admin Login**:
   - Set `ADMIN_EMAILS` to a comma-separated list of email addresses
   - Users with one of these emails are automatically synchronized as `admin`

2. **MongoDB Atlas** (recommended):
   - Create a free cluster
   - Add your Render IP to Network Access
   - Get connection string

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── lib/          # All packages (auth, db, types, config, utils)
│   ├── app/          # Next.js App Router pages
│   └── components/   # React components
├── prisma/           # Database schema
├── .env             # Environment variables
└── render.yaml      # Render configuration
```

## 🏗️ Build Process

The build command runs automatically:
```bash
npm install && npm run build
```

This includes:
1. Prisma client generation
2. TypeScript compilation
3. Next.js production build

## 🌐 Deployment

### Option 1: Automatic (render.yaml)
1. Connect your GitHub repository to Render
2. Render will automatically detect and deploy using `render.yaml`

### Option 2: Manual
1. Create new Web Service on Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add all environment variables
5. Deploy!

## ✅ Pre-flight Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Firebase project configured with Render URL
- [ ] All environment variables set in Render
- [ ] Firebase Admin SDK service account key downloaded
- [ ] Database seeded with initial data (optional)

## 🔄 Post-Deployment

1. **Database Setup**: Run seed script if needed
2. **Test Authentication**: Try login/register
3. **Verify Features**: Test all major features
4. **Monitor Logs**: Check Render logs for any issues

## 🐛 Troubleshooting

### Common Issues:
- **Workspace errors**: Fixed - no longer using pnpm workspaces
- **Import errors**: Fixed - all imports converted to local paths
- **Environment variables**: Double-check all are set in Render
- **Firebase auth**: Ensure Render URL is in Firebase authorized domains

### Build Errors:
Check that all environment variables are properly set before deployment.

### Runtime Errors:
1. Check Render logs
2. Verify database connection
3. Confirm Firebase configuration

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Ensure Firebase/MongoDB are properly configured
4. Test locally with same environment variables

---

**Ready to deploy! 🎉**

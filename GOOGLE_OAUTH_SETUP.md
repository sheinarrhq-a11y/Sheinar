# Google OAuth 2.0 Configuration Guide

## Overview
This guide helps you configure Google OAuth 2.0 for your application's authentication system.

## Step-by-Step Setup

### 1. Create a Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (or use an existing one)
- Note the Project ID

### 2. Enable Google Identity APIs
- In Google Cloud Console, go to **APIs & Services** > **Library**
- Search for "Google Identity Services API"
- Click Enable
- Also search for and enable "Google+ API" (if required)

### 3. Create OAuth 2.0 Credentials
- Go to **APIs & Services** > **Credentials**
- Click **Create Credentials** > **OAuth client ID**
- If prompted, set up the OAuth consent screen first:
  - Choose **External** user type
  - Fill in App name, Support email, and Developer contact
  - Add scopes: `openid`, `email`, `profile`
  - Add test users (your email during development)

### 4. Configure OAuth Client
- Application type: **Web application**
- Name: Something like "Maison Web App"
- **Authorized JavaScript origins** - Add your domains:
  ```
  http://localhost:5173
  http://localhost:3000
  https://yourdomain.com
  https://www.yourdomain.com
  ```
- **Authorized redirect URIs** - Add your backend callback URLs:
  ```
  http://localhost:5173
  http://localhost:3000
  https://yourdomain.com
  https://yourdomain.com/api/auth/callback
  https://www.yourdomain.com
  ```
- Copy the **Client ID** - you'll need this

### 5. Set Environment Variables

#### Frontend (.env in my-app/)
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
VITE_API_URL=http://localhost:5000/api
```

#### Backend (.env in backend/)
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE (if needed)
JWT_SECRET=your_jwt_secret_here
```

### 6. Verify Backend Setup
The backend auth route at `/api/auth/google` should:
- Accept POST requests with a `token` field (Google ID token)
- Verify the token using `google-auth-library`
- Return user data and JWT token

Example flow:
```
Frontend: User clicks "Sign in with Google"
    ↓
Google: Returns ID token to frontend
    ↓
Frontend: Sends ID token to /api/auth/google
    ↓
Backend: Verifies token, creates/updates user, returns JWT
    ↓
Frontend: Stores JWT, logs in user
```

### 7. Test Your Setup

#### Local Testing
1. Start backend: `npm start` (in backend/)
2. Start frontend: `npm run dev` (in my-app/)
3. Go to http://localhost:5173
4. Click "Sign in with Google" in the user panel
5. Verify you can sign in and see your account dashboard at /account

#### Troubleshooting Common Issues

**Issue: "Google sign-in is not available"**
- Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend .env
- Check that Google script loaded (check browser console)
- Ensure Client ID is correct in Google Cloud Console

**Issue: "Google token is required" / "Invalid Google token"**
- Verify `GOOGLE_CLIENT_ID` is correct in backend
- Check that the origin is in Authorized JavaScript Origins
- Ensure the redirect URI is in Authorized Redirect URIs

**Issue: FedCM warnings in console**
- These are deprecation notices from Google
- The app is prepared for FedCM migration
- See [Migration Guide](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)

**Issue: CORS errors**
- The backend should have CORS headers
- Check backend CORS configuration
- Verify frontend origin is allowed

### 8. Production Deployment

1. Add your production domain to Google Cloud Console:
   - **Authorized JavaScript origins**: `https://yourdomain.com`, `https://www.yourdomain.com`
   - **Authorized redirect URIs**: Your production URLs

2. Update environment variables:
   - Set `VITE_API_URL` to your production backend URL
   - Ensure `VITE_GOOGLE_CLIENT_ID` matches production credentials

3. Security checklist:
   - Use HTTPS only in production
   - Keep `GOOGLE_CLIENT_SECRET` secure (backend only)
   - Rotate credentials periodically
   - Enable 2FA on Google Cloud Console

## File Changes Made

### Fixed Issues
1. ✅ **CheckoutPage Export** - Moved component to `/components/checkout/Checkout.tsx` to fix code-splitting warning
2. ✅ **Google Auth UI** - Updated to use `renderButton()` instead of deprecated `prompt()` to reduce FedCM warnings
3. ✅ **User Dashboard** - Created account page at `/account` to display user info, orders, and saved items
4. ✅ **Auth Utils** - Updated with better error handling and FedCM migration notes

### New Routes
- `/account` - User dashboard (shows orders, saved items, account info)
- `/checkout` - Checkout page (uses Checkout component)

### Improved Components
- `UserPanel.tsx` - Better Google auth handling
- `auth.ts` - FedCM migration documentation and improved types

## References
- [Google Identity Services Documentation](https://developers.google.com/identity)
- [FedCM Migration Guide](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)

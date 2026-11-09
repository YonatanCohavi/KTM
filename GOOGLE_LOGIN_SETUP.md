# Google Login Setup Guide

This app now supports optional Google login for persistent user IDs. Users can link their Google account to maintain their game progress across devices.

## How It Works

1. **Anonymous Mode (Default)**: Users get a random browser UUID stored in localStorage
2. **Google Login**: Users can sign in with Google in Settings to replace their browser UUID with their Google user ID
3. **Persistent ID**: The Google user ID (`sub` claim from the JWT) is used as the permanent user identifier
4. **Profile Sync**: User name from Google is automatically saved to their profile

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google Identity Services API"
4. Create an OAuth 2.0 credential (choose "Web application")
5. Add your domain(s) to Authorized JavaScript origins:
   - Development: `http://localhost:5173`
   - Production: Your deployed domain (e.g., `https://app.yourdomain.com`)
6. Copy the **Client ID** (you'll need this)

### 2. Add Environment Variables

Create or update `.env.development` and `.env.production`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_from_step_1
```

### 3. Deploy

The Google sign-in button will automatically appear in the Settings page once the environment variable is set.

## Features

- ✅ Google Sign-In button in Settings page
- ✅ Extracts user ID and name from Google token
- ✅ Stores Google ID in localStorage
- ✅ Automatic logout button when authenticated
- ✅ Seamless integration with existing user system

## Files Modified

- `src/client/src/contexts/userContext.tsx` - Added Google ID handling
- `src/client/src/components/GoogleLogin.tsx` - New component for sign-in
- `src/client/src/Pages/SettingsPage.tsx` - Integrated Google login
- `src/client/.env.example` - Added VITE_GOOGLE_CLIENT_ID example

## User Experience

1. User opens Settings page
2. Sees "Sign in with Google" section at top
3. Clicks Google button and authorizes
4. User ID and name are saved to localStorage and sent to server
5. A logout button appears if authenticated
6. All subsequent API calls use the Google user ID instead of browser UUID

## Backend Integration

No backend changes required! The Google user ID is passed just like the browser UUID:

- Login: `POST /api/user/{googleUserId}/stats`
- Update name: `PATCH /api/user/{googleUserId}` with `{ name: "..." }`
- Leaderboard sync works automatically

## Notes

- Google Sign-In uses the secure JWT token (no API key exposure)
- User can logout anytime from Settings to return to anonymous mode
- Google ID persists even after logout until explicitly cleared
- The `sub` claim (user ID) is extracted from the JWT payload without server verification (acceptable for client-side auth association)

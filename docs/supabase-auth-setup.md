# Complete Supabase Authentication Setup Guide for Expo React Native

> **Last Updated**: December 2024  
> **Source**: Official Supabase Documentation

This comprehensive guide covers everything you need to set up Supabase authentication in your Expo React Native application, including email/password auth, social logins, deep linking, and session management.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Expo App Setup](#expo-app-setup)
4. [Install Dependencies](#install-dependencies)
5. [Configure Supabase Client](#configure-supabase-client)
6. [Implement Authentication](#implement-authentication)
7. [Deep Linking Setup](#deep-linking-setup)
8. [Session Management](#session-management)
9. [Social Authentication (Apple, Google)](#social-authentication)
10. [Environment Variables](#environment-variables)
11. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Prerequisites

- Node.js installed (v16 or higher)
- Expo CLI installed (`npm install -g expo-cli`)
- A Supabase account ([sign up here](https://supabase.com))
- Basic knowledge of React Native and TypeScript

---

## Supabase Project Setup

### 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Project Name**: Your app name
   - **Database Password**: Strong password (save this securely)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for database to launch (1-2 minutes)

### 2. Set Up Database Schema

You need to create tables for user management:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"User Management Starter"** under Community > Quickstarts
3. Click **"Run"** to execute the SQL

**Or manually run this SQL:**

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up Realtime
alter publication supabase_realtime add table profiles;

-- Create a trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Get API Credentials

1. Go to **Settings** > **API** in your Supabase Dashboard
2. Copy the following values:

#### **Project URL**
```
https://your-project-ref.supabase.co
```

#### **API Keys**

> **Important**: Supabase is transitioning to new API keys

**Option 1: New Publishable Key (Recommended)**
- Go to **Settings** > **API** > **API Keys** tab
- If you don't have a publishable key, click **"Create new API Keys"**
- Copy the **Publishable key** (format: `sb_publishable_xxx`)

**Option 2: Legacy Anon Key**
- Go to **Settings** > **API** > **Legacy API Keys** tab
- Copy the **anon** key

Both keys are safe to use in your Expo app due to Row Level Security (RLS).

---

## Expo App Setup

### Initialize Your Expo Project

If you haven't created your Expo app yet:

```bash
npx create-expo-app -t expo-template-blank-typescript my-app
cd my-app
```

For existing projects, skip to the next section.

---

## Install Dependencies

Install all required packages:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
```

### Optional Dependencies

For UI components (if you want to use pre-built components):
```bash
npx expo install @rneui/themed @rneui/base
```

For URL polyfill (required for some environments):
```bash
npm install react-native-url-polyfill
```

---

## Configure Supabase Client

### 1. Create Supabase Configuration File

Create `lib/supabase.ts` (or `src/lib/supabase.ts`):

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Configuration Options Explained

- **`storage: AsyncStorage`**: Stores user session locally
- **`autoRefreshToken: true`**: Automatically refreshes auth tokens
- **`persistSession: true`**: Keeps users logged in across app restarts
- **`detectSessionInUrl: false`**: Disable for mobile (we'll use deep linking instead)

---

## Implement Authentication

### 1. Create Auth Component

Create `components/Auth.tsx`:

```typescript
import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, TextInput, Pressable, Text } from 'react-native';
import { supabase } from '../lib/supabase';

// Auto-refresh session when app comes to foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 2. Create Account/Profile Component

Create `components/Account.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StyleSheet, View, Alert, TextInput, Pressable, Text } from 'react-native';
import { Session } from '@supabase/supabase-js';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single();
      
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      Alert.alert('Profile updated!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={session?.user?.email} editable={false} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username || ''}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          value={website || ''}
          onChangeText={setWebsite}
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.buttonDanger]}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 3. Update App.tsx (or _layout.tsx)

```typescript
import 'react-native-url-polyfill/auto';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Account from './components/Account';
import { View } from 'react-native';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {session && session.user ? <Account session={session} /> : <Auth />}
    </View>
  );
}
```

---

## Deep Linking Setup

Deep linking is **required** for:
- Email verification links
- Password reset links
- Magic link authentication
- OAuth redirects (Apple, Google, etc.)

### 1. Configure app.json

Add the `scheme` to your `app.json`:

```json
{
  "expo": {
    "scheme": "yourappname",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourappname"
    },
    "android": {
      "package": "com.yourcompany.yourappname"
    }
  }
}
```

### 2. Update Supabase Auth Settings

1. Go to **Authentication** > **URL Configuration** in Supabase Dashboard
2. Add your redirect URL:
   ```
   yourappname://auth/callback
   ```
3. For development, also add:
   ```
   exp://localhost:8081/--/auth/callback
   ```

### 3. Handle Deep Links in Your App

Update your Supabase client configuration:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Handle deep links
Linking.addEventListener('url', ({ url }) => {
  if (url) {
    const { queryParams } = Linking.parse(url);
    if (queryParams?.access_token && queryParams?.refresh_token) {
      supabase.auth.setSession({
        access_token: queryParams.access_token as string,
        refresh_token: queryParams.refresh_token as string,
      });
    }
  }
});
```

---

## Session Management

### Auto-Refresh Sessions

The configuration already handles auto-refresh, but you can manually control it:

```typescript
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

### Check Current Session

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Listen to Auth Changes

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
  
  if (event === 'SIGNED_IN') {
    // User signed in
  } else if (event === 'SIGNED_OUT') {
    // User signed out
  } else if (event === 'TOKEN_REFRESHED') {
    // Token was refreshed
  }
});
```

---

## Social Authentication

### Sign in with Apple

#### 1. Install Dependencies

```bash
npx expo install expo-apple-authentication
```

#### 2. Configure Apple Provider in Supabase

1. Go to **Authentication** > **Providers** > **Apple**
2. Enable Apple provider
3. Follow Apple's setup instructions to get:
   - Services ID
   - Team ID
   - Key ID
   - Private Key (.p8 file)

> **Important**: Apple requires secret key rotation every 6 months for OAuth flow

#### 3. Implement Apple Sign In

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../lib/supabase';

async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Sign in with Supabase
    const { error, data } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!,
    });

    if (error) throw error;

    // Save full name (only available on first sign-in)
    if (credential.fullName) {
      await supabase.auth.updateUser({
        data: {
          full_name: `${credential.fullName.givenName} ${credential.fullName.familyName}`,
          given_name: credential.fullName.givenName,
          family_name: credential.fullName.familyName,
        },
      });
    }
  } catch (e) {
    if (e.code === 'ERR_CANCELED') {
      // User canceled
    } else {
      console.error(e);
    }
  }
}
```

### Sign in with Google

#### 1. Install Dependencies

```bash
npx expo install expo-auth-session expo-crypto
```

#### 2. Configure Google Provider

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google provider in Supabase Dashboard
3. Add your Google Client ID and Secret

#### 3. Implement Google Sign In

```typescript
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });
    }
  }, [response]);

  return { promptAsync };
}
```

---

## Environment Variables

### Create .env file

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Production

Use Expo's environment variable system:

```bash
# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

---

## Testing & Troubleshooting

### Disable Email Verification (Development Only)

1. Go to **Authentication** > **Providers** > **Email**
2. Disable **"Confirm email"**
3. **Remember to re-enable for production!**

### Common Issues

#### "Invalid API key"
- Check your environment variables are correct
- Ensure you're using the correct key (anon or publishable)
- Restart Expo dev server after changing .env

#### "Session not persisting"
- Verify AsyncStorage is installed
- Check `persistSession: true` in Supabase client config
- Clear app data and reinstall

#### "Deep links not working"
- Verify `scheme` in app.json matches redirect URL
- Check URL configuration in Supabase Dashboard
- Test with `npx uri-scheme open yourappname://auth/callback --ios`

#### "Email verification not working"
- Implement deep linking properly
- Check redirect URLs in Supabase Dashboard
- Verify email template has correct redirect URL

### Testing Commands

```bash
# Test iOS deep link
npx uri-scheme open yourappname://auth/callback --ios

# Test Android deep link
npx uri-scheme open yourappname://auth/callback --android

# Clear Expo cache
npx expo start -c
```

---

## Security Best Practices

1. **Never commit .env files** - Add to `.gitignore`
2. **Use Row Level Security (RLS)** - Always enable RLS on tables
3. **Validate on server** - Don't trust client-side validation alone
4. **Rotate secrets regularly** - Especially Apple's .p8 key (every 6 months)
5. **Use HTTPS only** - Never use HTTP in production
6. **Implement rate limiting** - Prevent brute force attacks
7. **Monitor auth logs** - Check for suspicious activity in Supabase Dashboard

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Documentation](https://docs.expo.dev)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Deep Linking Guide](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Install dependencies
3. ✅ Configure Supabase client
4. ✅ Implement authentication
5. ✅ Set up deep linking
6. ⬜ Add social authentication (optional)
7. ⬜ Implement profile management
8. ⬜ Add file uploads (avatars)
9. ⬜ Set up push notifications
10. ⬜ Deploy to production

---

**Happy coding! 🚀**

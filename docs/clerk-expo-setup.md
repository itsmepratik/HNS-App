# Clerk Expo Setup Guide

## Enable Native API

In the Clerk Dashboard, navigate to the **Native Applications** page and ensure that the **Native API** is enabled. This is required to integrate Clerk in your native application.

## Create an Expo app

Run the following commands to create a new Expo app.

```terminal
npx create-expo-app@latest clerk-expo --template react-ts
cd clerk-expo
npm install
npm run dev
```

## Install @clerk/clerk-expo

The Clerk Expo SDK gives you access to prebuilt components, hooks, and helpers to make user authentication easier.

Run the following command to install the SDK:

```terminal
npm install @clerk/clerk-expo
```

## Set your Clerk API keys

Add your Clerk Publishable Key to your `.env` file. It can always be retrieved from the API keys page in the Clerk Dashboard.

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aGVyb2ljLW11c3RhbmctMTMuY2xlcmsuYWNjb3VudHMuZGV2JA
```

## Add `<ClerkProvider>` to your root layout

The `<ClerkProvider>` component provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with `<ClerkProvider>` to make authentication globally accessible. See the [reference docs](https://clerk.com/docs) for other configuration options.

Add the component to your root layout as shown in the following example:

**app/_layout.tsx**

```tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'

export default function RootLayout() {
  return (
    <ClerkProvider>
      <Slot />
    </ClerkProvider>
  )
}
```

## Configure the token cache

Clerk stores the active user's session token in memory by default. In Expo apps, the recommended way to store sensitive data, such as tokens, is by using `expo-secure-store` which encrypts the data before storing it.

To use `expo-secure-store` as your token cache:

1. Run the following command to install the library:

```terminal
npm install expo-secure-store
```

2. Update your root layout to use the secure token cache:

**app/_layout.tsx**

```tsx
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  )
}
```

> [!TIP]
> When you sign a user out with `signOut()`, Clerk will remove the user's session JWT from the token cache.

## Add sign-up and sign-in pages

Clerk currently only supports [control components](https://clerk.com/docs) for Expo native. UI components are only available for Expo web. Instead, you must build custom flows using Clerk's API. The following sections demonstrate how to build custom email/password sign-up and sign-in flows. If you want to use different authentication methods, such as passwordless or OAuth, see the dedicated custom flow guides.

### Layout page

First, protect your sign-up and sign-in pages.

1. Create an `(auth)` route group. This will group your sign-up and sign-in pages.
2. In the `(auth)` group, create a `_layout.tsx` file with the following code. The `useAuth()` hook is used to access the user's authentication state. If the user is already signed in, they will be redirected to the home page.

**app/(auth)/_layout.tsx**

```tsx
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack />
}
```

### Sign-up page

In the `(auth)` group, create a `sign-up.tsx` file with the following code. The `useSignUp()` hook is used to create a sign-up flow. The user can sign up using their email and password and will receive an email verification code to confirm their email.

**app/(auth)/sign-up.tsx**

```tsx
import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    console.log(emailAddress, password)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    )
  }

  return (
    <View>
      <>
        <Text>Sign up</Text>
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />
        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <TouchableOpacity onPress={onSignUpPress}>
          <Text>Continue</Text>
        </TouchableOpacity>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
          <Text>Already have an account?</Text>
          <Link href="/sign-in">
            <Text>Sign in</Text>
          </Link>
        </View>
      </>
    </View>
  )
}
```

### Sign-in page

In the `(auth)` group, create a `sign-in.tsx` file with the following code. The `useSignIn()` hook is used to create a sign-in flow. The user can sign in using email address and password, or navigate to the sign-up page.

**app/(auth)/sign-in.tsx**

```tsx
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View>
      <Text>Sign in</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <TouchableOpacity onPress={onSignInPress}>
        <Text>Continue</Text>
      </TouchableOpacity>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <Text>Don't have an account?</Text>
        <Link href="/sign-up">
          <Text>Sign up</Text>
        </Link>
      </View>
    </View>
  )
}
```

> [!NOTE]
> For more information about building these custom flows, including guided comments in the code examples, see the [Build a custom email/password authentication flow](https://clerk.com/docs) guide.

## Add a sign-out button

At this point, your users can sign up or in, but they need a way to sign out.

In the `components/` folder, create a `SignOutButton.tsx` file with the following code. The `useClerk()` hook is used to access the `signOut()` function, which is called when the user clicks the "Sign out" button.

**app/components/SignOutButton.tsx**

```tsx
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      router.replace('/')
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign out</Text>
    </TouchableOpacity>
  )
}
```

## Conditionally render content

You can control which content signed-in and signed-out users can see with Clerk's [prebuilt control components](https://clerk.com/docs). For this quickstart, you'll use:

- `<SignedIn>`: Children of this component can only be seen while signed in.
- `<SignedOut>`: Children of this component can only be seen while signed out.

To get started:

1. Create a `(home)` route group.
2. In the `(home)` group, create a `_layout.tsx` file with the following code.

**app/(home)/_layout.tsx**

```tsx
import { Stack } from 'expo-router/stack'

export default function Layout() {
  return <Stack />
}
```

3. Then, in the same folder, create an `index.tsx` file with the following code. If the user is signed in, it displays their email and a sign-out button. If they're not signed in, it displays sign-in and sign-up links.

**app/(home)/index.tsx**

```tsx
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { SignOutButton } from '@/app/components/SignOutButton'

export default function Page() {
  const { user } = useUser()

  return (
    <View>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </View>
  )
}
```

## Create your first user

Run your project with the following command:

```terminal
npm start
```

Now visit your app's homepage at http://localhost:8081. Sign up to create your first user.

## Enable OTA updates

Though not required, it is recommended to implement over-the-air (OTA) updates in your Expo app. This enables you to easily roll out Clerk's feature updates and security patches as they're released without having to resubmit your app to mobile marketplaces.

See the [expo-updates library](https://docs.expo.dev/versions/latest/sdk/updates/) to learn how to get started.
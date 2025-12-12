# Enable Biometric Sign-In for Returning Users in Expo

This guide demonstrates how to use the `useLocalCredentials()` hook in your Expo app to securely store a user's password credentials on their device, enabling biometric sign-in for returning users.

> [!WARNING]
> This feature requires `@clerk/clerk-expo` >= 2.2.0 and works only for sign-in attempts that use the password strategy.

## Table of Contents

- [Install the necessary peer dependencies](#install-the-necessary-peer-dependencies)
- [Update app.json](#update-appjson)
- [Securely store/access the user's credentials during sign in](#securely-storeaccess-the-users-credentials-during-sign-in)
- [Delete credentials while user is logged in](#delete-credentials-while-user-is-logged-in)
- [Update credentials while user is logged in](#update-credentials-while-user-is-logged-in)

---

## Install the necessary peer dependencies

The `useLocalCredentials()` hook requires the following packages to be installed in your project:

- **expo-local-authentication**: Provides biometric authentication functionality
- **expo-secure-store**: Enables secure storage of credentials on the device

### Installation

```bash
npm install expo-local-authentication expo-secure-store
```

---

## Update app.json

See the following Expo docs to update your `app.json` file with the necessary configurations for biometric sign-in. Replace `$(PRODUCT_NAME)` with your app's name as specified in the `"name"` field in your `app.json` file.

- [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## Securely store/access the user's credentials during sign in

The following example demonstrates how to use `useLocalCredentials()` in a custom flow for signing in users.

### Example: `app/sign-in.tsx`

```tsx
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, Button, View } from 'react-native'
import { useState } from 'react'
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials'

export default function Page() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()
  const { hasCredentials, setCredentials, authenticate, biometricType } = useLocalCredentials()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')

  const onSignInPress = async (useLocal: boolean) => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt =
        hasCredentials && useLocal
          ? await authenticate()
          : await signIn.create({
              identifier: emailAddress,
              password,
            })

      // If sign-in process is complete,
      // set the created session as active and redirect the user
      if (signInAttempt.status === 'complete') {
        console.log('status is complete?', signInAttempt.status)

        if (!useLocal) {
          await setCredentials({
            identifier: emailAddress,
            password,
          })
        }

        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why.
        // User may need to complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // For info on error handing,
      // see https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress: string) => setEmailAddress(emailAddress)}
      />

      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password: string) => setPassword(password)}
      />

      <Button title="Sign In" onPress={() => onSignInPress(false)} />

      {hasCredentials && biometricType && (
        <Button
          title={
            biometricType === 'face-recognition' ? 'Sign in with Face ID' : 'Sign in with Touch ID'
          }
          onPress={() => onSignInPress(true)}
        />
      )}

      <View>
        <Text>Don't have an account?</Text>

        <Link href="/sign-up">
          <Text>Sign up</Text>
        </Link>
      </View>
    </View>
  )
}
```

---

## Delete credentials while user is logged in

The following example demonstrates how to use the `userOwnsCredentials` and `clearCredentials` properties of the `useLocalCredentials()` hook in order to remove the stored credentials if those belong to the signed in user.

### Example: `app/user.tsx`

```tsx
import { useUser, useClerk } from '@clerk/clerk-expo'
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials'
import { View, Text, Button } from 'react-native'

export default function Page() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const { userOwnsCredentials, clearCredentials } = useLocalCredentials()

  return (
    <View>
      <Text>Settings, {user?.emailAddresses[0].emailAddress}</Text>
      <Button title="Sign out" onPress={() => signOut()} />
      {userOwnsCredentials && (
        <Button title="Remove biometric credentials" onPress={() => clearCredentials()} />
      )}
    </View>
  )
}
```

---

## Update credentials while user is logged in

The following example demonstrates how to use `userOwnsCredentials` and `setCredentials` properties of the `useLocalCredentials()` hook in order to update the stored credentials if those belong to the signed in user.

### Example: `app/update-user.tsx`

```tsx
import { useUser, useClerk } from '@clerk/clerk-expo'
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials'
import { View, Text, TextInput, Button } from 'react-native'
import React from 'react'

export default function Page() {
  const { user } = useUser()
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [password, setPassword] = React.useState('')

  const { userOwnsCredentials, setCredentials } = useLocalCredentials()

  const changePassword = React.useCallback(async () => {
    try {
      await user?.updatePassword({
        currentPassword: currentPassword,
        newPassword: password,
      })

      if (userOwnsCredentials) {
        await setCredentials({
          password,
        })
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [currentPassword, password])

  return (
    <View>
      <TextInput
        autoCapitalize="none"
        value={currentPassword}
        placeholder="Current password..."
        secureTextEntry={true}
        onChangeText={(currentPassword) => setCurrentPassword(currentPassword)}
      />
      <TextInput
        value={password}
        placeholder="Password..."
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <Button title="Update password" onPress={changePassword} />
    </View>
  )
}
```
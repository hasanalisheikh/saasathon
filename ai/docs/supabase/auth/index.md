## Overview

-   The auth methods can be accessed via the `supabase.auth` namespace.
    
-   By default, the supabase client sets `persistSession` to true and attempts to store the session in local storage. When using the supabase client in an environment that doesn't support local storage, you might notice the following warning message being logged:
    
    > No storage option exists to persist the session, which may result in unexpected behavior when using auth. If you want to set `persistSession` to true, please provide a storage option or you may set `persistSession` to false to disable this warning.
    
    This warning message can be safely ignored if you're not using auth on the server-side. If you are using auth and you want to set `persistSession` to true, you will need to provide a custom storage implementation that follows [this interface](https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/src/lib/types.ts#L1053).
    
-   Any email links and one-time passwords (OTPs) sent have a default expiry of 24 hours. We have the following [rate limits](/docs/guides/platform/going-into-prod#auth-rate-limits) in place to guard against brute force attacks.
    
-   The expiry of an access token can be set in the "JWT expiry limit" field in [your project's auth settings](/dashboard/project/_/auth/providers). A refresh token never expires and can only be used once.
    

```
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabase_url, publishable_key)
```

---

## Create a new user

`signUp(credentials)`

Creates a new user.

Be aware that if a user account exists in the system you may get back an error message that attempts to hide this information from the user. This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.

-   By default, the user needs to verify their email address before logging in. To turn this off, disable **Confirm email** in [your project](/dashboard/project/_/auth/providers).
-   **Confirm email** determines if users need to confirm their email address after signing up.
    -   If **Confirm email** is enabled, a `user` is returned but `session` is null.
    -   If **Confirm email** is disabled, both a `user` and a `session` are returned.
-   When the user confirms their email address, they are redirected to the [`SITE_URL`](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls) by default. You can modify your `SITE_URL` or add additional redirect URLs in [your project](/dashboard/project/_/auth/url-configuration).
-   If signUp() is called for an existing confirmed user:
    -   When both **Confirm email** and **Confirm phone** (even when phone provider is disabled) are enabled in [your project](/dashboard/project/_/auth/providers), an obfuscated/fake user object is returned.
    -   When either **Confirm email** or **Confirm phone** (even when phone provider is disabled) is disabled, the error message, `User already registered` is returned.
-   To fetch the currently logged-in user, refer to [`getUser()`](/docs/reference/javascript/auth-getuser).

### Parameters

-   credentials SignUpWithPasswordCredentials
    

### Return Type

Promise<One of the following options>

---

## Listen to auth events

`onAuthStateChange(callback)`

Receive a notification every time an auth event happens. Safe to use without an async function as callback.

-   Subscribes to important events occurring on the user's session.
-   Use on the frontend/client. It is less useful on the server.
-   Events are emitted across tabs to keep your application's UI up-to-date. Some events can fire very frequently, based on the number of tabs open. Use a quick and efficient callback function, and defer or debounce as many operations as you can to be performed outside of the callback.
-   **Important:** A callback can be an `async` function and it runs synchronously during the processing of the changes causing the event. You can easily create a dead-lock by using `await` on a call to another method of the Supabase library.
    -   Avoid using `async` functions as callbacks.
    -   Limit the number of `await` calls in `async` callbacks.
    -   Do not use other Supabase functions in the callback function. If you must, dispatch the functions once the callback has finished executing. Use this as a quick way to achieve this:
        
        ```
        supabase.auth.onAuthStateChange((event, session) => {
          setTimeout(async () => {
            // await on other Supabase function here
            // this runs right after the callback has finished
          }, 0)
        })
        ```
        
-   Emitted events:
    -   `INITIAL_SESSION`
        -   Emitted right after the Supabase client is constructed and the initial session from storage is loaded.
    -   `SIGNED_IN`
        -   Emitted each time a user session is confirmed or re-established, including on user sign in and when refocusing a tab.
        -   Avoid making assumptions as to when this event is fired, this may occur even when the user is already signed in. Instead, check the user object attached to the event to see if a new user has signed in and update your application's UI.
        -   This event can fire very frequently depending on the number of tabs open in your application.
    -   `SIGNED_OUT`
        -   Emitted when the user signs out. This can be after:
            -   A call to `supabase.auth.signOut()`.
            -   After the user's session has expired for any reason:
                -   User has signed out on another device.
                -   The session has reached its timebox limit or inactivity timeout.
                -   User has signed in on another device with single session per user enabled.
                -   Check the [User Sessions](/docs/guides/auth/sessions) docs for more information.
        -   Use this to clean up any local storage your application has associated with the user.
    -   `TOKEN_REFRESHED`
        -   Emitted each time a new access and refresh token are fetched for the signed in user.
        -   It's best practice and highly recommended to extract the access token (JWT) and store it in memory for further use in your application.
            -   Avoid frequent calls to `supabase.auth.getSession()` for the same purpose.
        -   There is a background process that keeps track of when the session should be refreshed so you will always receive valid tokens by listening to this event.
        -   The frequency of this event is related to the JWT expiry limit configured on your project.
    -   `USER_UPDATED`
        -   Emitted each time the `supabase.auth.updateUser()` method finishes successfully. Listen to it to update your application's UI based on new profile information.
    -   `PASSWORD_RECOVERY`
        -   Emitted instead of the `SIGNED_IN` event when the user lands on a page that includes a password recovery link in the URL.
        -   Use it to show a UI to the user where they can [reset their password](/docs/guides/auth/passwords#resetting-a-users-password-forgot-password).

### Parameters

-   callback function
    
    A callback function to be invoked when an auth event happens.
    

### Return Type

object

---

## Create an anonymous user

`signInAnonymously(credentials?)`

Creates a new anonymous user.

-   Returns an anonymous user
-   It is recommended to set up captcha for anonymous sign-ins to prevent abuse. You can pass in the captcha token in the `options` param.

### Parameters

-   credentials
    
    Optional
    
    SignInAnonymouslyCredentials
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.signInAnonymously({
  options: {
    captchaToken
  }
});
```

---

## Sign in a user

`signInWithPassword(credentials)`

Log in an existing user with an email and password or phone and password.

Be aware that you may get back an error message that will not distinguish between the cases where the account does not exist or that the email/phone and password combination is wrong or that the account can only be accessed via social login.

-   Requires either an email and password or a phone number and password.

### Parameters

-   credentials SignInWithPasswordCredentials
    

### Return Type

Promise<One of the following options>

---

## Sign in with ID token (native sign-in)

`signInWithIdToken(credentials)`

Allows signing in with an OIDC ID token. The authentication provider used should be enabled and configured.

-   Use an ID token to sign in.
-   Especially useful when implementing sign in using native platform dialogs in mobile or desktop apps using Sign in with Apple or Sign in with Google on iOS and Android.
-   You can also use Google's [One Tap](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap) and [Automatic sign-in](https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out) via this API.

### Parameters

-   credentials SignInWithIdTokenCredentials
    

### Return Type

Promise<One of the following options>

---

## Sign in a user through OTP

`signInWithOtp(credentials)`

Log in a user using magiclink or a one-time password (OTP).

If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent. If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent. If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.

Be aware that you may get back an error message that will not distinguish between the cases where the account does not exist or, that the account can only be accessed via social login.

Do note that you will need to configure a Whatsapp sender on Twilio if you are using phone sign in with the 'whatsapp' channel. The whatsapp channel is not supported on other providers at this time. This method supports PKCE when an email is passed.

-   Requires either an email or phone number.
-   This method is used for passwordless sign-ins where a OTP is sent to the user's email or phone number.
-   If the user doesn't exist, `signInWithOtp()` will signup the user instead. To restrict this behavior, you can set `shouldCreateUser` in `SignInWithPasswordlessCredentials.options` to `false`.
-   If you're using an email, you can configure whether you want the user to receive a magiclink or a OTP.
-   If you're using phone, you can configure whether you want the user to receive a OTP.
-   The magic link's destination URL is determined by the [`SITE_URL`](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls).
-   See [redirect URLs and wildcards](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls) to add additional redirect URLs to your project.
-   Magic links and OTPs share the same implementation. To send users a one-time code instead of a magic link, [modify the magic link email template](/dashboard/project/_/auth/templates) to include `{{ .Token }}` instead of `{{ .ConfirmationURL }}`.
-   See our [Twilio Phone Auth Guide](/docs/guides/auth/phone-login?showSMSProvider=Twilio) for details about configuring WhatsApp sign in.

### Parameters

-   credentials One of the following options
    

### Return Type

Promise<One of the following options>

---

## Sign in a user through OAuth

`signInWithOAuth(credentials)`

Log in an existing user via a third-party provider. This method supports the PKCE flow.

-   This method is used for signing in using [Social Login (OAuth) providers](/docs/guides/auth#configure-third-party-providers).
-   It works by redirecting your application to the provider's authorization screen, before bringing back the user to your app.

### Parameters

-   credentials SignInWithOAuthCredentials
    

### Return Type

Promise<One of the following options>

---

## Sign in a user through SSO

`signInWithSSO(params)`

Attempts a single-sign on using an enterprise Identity Provider. A successful SSO attempt will redirect the current page to the identity provider authorization page. The redirect URL is implementation and SSO protocol specific.

You can use it by providing a SSO domain. Typically you can extract this domain by asking users for their email address. If this domain is registered on the Auth instance the redirect will use that organization's currently active SSO Identity Provider for the login.

If you have built an organization-specific login page, you can use the organization's SSO Identity Provider UUID directly instead.

-   Before you can call this method you need to [establish a connection](/docs/guides/auth/sso/auth-sso-saml#managing-saml-20-connections) to an identity provider. Use the [CLI commands](/docs/reference/cli/supabase-sso) to do this.
-   If you've associated an email domain to the identity provider, you can use the `domain` property to start a sign-in flow.
-   In case you need to use a different way to start the authentication flow with an identity provider, you can use the `providerId` property. For example:
    -   Mapping specific user email addresses with an identity provider.
    -   Using different hints to identity the identity provider to be used by the user, like a company-specific page, IP address or other tracking information.

### Parameters

-   params One of the following options
    

### Return Type

Promise<One of the following options>

---

## Sign in a user through Web3 (Solana, Ethereum)

`signInWithWeb3(credentials)`

Signs in a user by verifying a message signed by the user's private key. Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards, both of which derive from the EIP-4361 standard With slight variation on Solana's side.

-   Uses a Web3 (Ethereum, Solana) wallet to sign a user in.
-   Read up on the [potential for abuse](/docs/guides/auth/auth-web3#potential-for-abuse) before using it.

### Parameters

-   credentials One of the following options
    

### Return Type

Promise<One of the following options>

---

## Sign in with a passkey

`signInWithPasskey(credentials?)`

### Parameters

-   credentials
    
    Optional
    
    SignInWithPasskeyCredentials
    

### Return Type

Promise<One of the following options>

---

---

## Get user claims from verified JWT

`getClaims(jwt?, options)`

Extracts the JWT claims present in the access token by first verifying the JWT against the server's JSON Web Key Set endpoint `/.well-known/jwks.json` which is often cached, resulting in significantly faster responses. Prefer this method over #getUser which always sends a request to the Auth server for each JWT.

If the project is not using an asymmetric JWT signing key (like ECC or RSA) it always sends a request to the Auth server (similar to #getUser) to verify the JWT.

-   Parses the user's [access token](/docs/guides/auth/sessions#access-token-jwt-claims) as a [JSON Web Token (JWT)](/docs/guides/auth/jwts) and returns its components if valid and not expired.
-   If your project is using asymmetric JWT signing keys, then the verification is done locally usually without a network request using the [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
-   A network request is sent to your project's JWT signing key discovery endpoint `https://project-id.supabase.co/auth/v1/.well-known/jwks.json`, which is cached locally. If your environment is ephemeral, such as a Lambda function that is destroyed after every request, a network request will be sent for each new invocation. Supabase provides a network-edge cache providing fast responses for these situations.
-   If the user's access token is about to expire when calling this function, the user's session will first be refreshed before validating the JWT.
-   If your project is using a symmetric secret to sign the JWT, it always sends a request similar to `getUser()` to validate the JWT at the server before returning the decoded token. This is also used if the WebCrypto API is not available in the environment. Make sure you polyfill it in such situations.
-   The returned claims can be customized per project using the [Custom Access Token Hook](/docs/guides/auth/auth-hooks/custom-access-token-hook).

### Parameters

-   jwt
    
    Optional
    
    string
    
    An optional specific JWT you wish to verify, not the one you can obtain from #getSession.
    
-   options object
    
    Various additional options that allow you to customize the behavior of this method.
    

### Return Type

Promise<One of the following options>

---

## Sign out a user

`signOut(options)`

Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.

For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`. There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.

If using `others` scope, no `SIGNED_OUT` event is fired!

**Warning:** the default `scope` is `'global'`. This signs the user out of **every device they are currently signed in on**, not just the current tab/session. If you only want to sign the user out of the current session (the behavior most other auth libraries default to), pass `{ scope: 'local' }` explicitly.

-   In order to use the `signOut()` method, the user needs to be signed in first.
-   By default, `signOut()` uses the **global** scope, which signs out the user on every device they are signed in on (not just the current one). Pass `{ scope: 'local' }` to only sign out the current session. This is usually what apps want on a "Sign out" button, especially when users sign in from multiple devices and do not expect signing out of one to terminate the others.
-   Since Supabase Auth uses JWTs for authentication, the access token JWT will be valid until it's expired. When the user signs out, Supabase revokes the refresh token and deletes the JWT from the client-side. This does not revoke the JWT and it will still be valid until it expires.

### Parameters

-   options SignOut
    

### Return Type

Promise<object>

---

## Send a password reset request

`resetPasswordForEmail(email, options)`

Sends a password reset request to an email address. This method supports the PKCE flow.

-   The password reset flow consist of 2 broad steps: (i) Allow the user to login via the password reset link; (ii) Update the user's password.
-   The `resetPasswordForEmail()` only sends a password reset link to the user's email. To update the user's password, see [`updateUser()`](/docs/reference/javascript/auth-updateuser).
-   A `PASSWORD_RECOVERY` event will be emitted when the password recovery link is clicked. You can use [`onAuthStateChange()`](/docs/reference/javascript/auth-onauthstatechange) to listen and invoke a callback function on these events.
-   When the user clicks the reset link in the email they are redirected back to your application. You can configure the URL that the user is redirected to with the `redirectTo` parameter. See [redirect URLs and wildcards](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls) to add additional redirect URLs to your project.
-   After the user has been redirected successfully, prompt them for a new password and call `updateUser()`:

```
const { data, error } = await supabase.auth.updateUser({
  password: new_password
})
```

### Parameters

-   email string
    
    The email address of the user.
    
-   options object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://example.com/update-password',
})
```

---

## Verify and log in through OTP

`verifyOtp(params)`

Log in a user given a User supplied OTP or TokenHash received through mobile or email.

-   The `verifyOtp` method takes in different verification types.
-   If a phone number is used, the type can either be:
    1.  `sms` – Used when verifying a one-time password (OTP) sent via SMS during sign-up or sign-in.
    2.  `phone_change` – Used when verifying an OTP sent to a new phone number during a phone number update process.
-   If an email address is used, the type can be one of the following (note: `signup` and `magiclink` types are deprecated):
    1.  `email` – Used when verifying an OTP sent to the user's email during sign-up or sign-in.
    2.  `recovery` – Used when verifying an OTP sent for account recovery, typically after a password reset request.
    3.  `invite` – Used when verifying an OTP sent as part of an invitation to join a project or organization.
    4.  `email_change` – Used when verifying an OTP sent to a new email address during an email update process.
-   The verification type used should be determined based on the corresponding auth method called before `verifyOtp` to sign up / sign-in a user.
-   The `TokenHash` is contained in the [email templates](/docs/guides/auth/auth-email-templates) and can be used to sign in. You may wish to use the hash for the PKCE flow for Server Side Auth. Read [the Password-based Auth guide](/docs/guides/auth/passwords) for more details.

### Parameters

-   params One of the following options
    

### Return Type

Promise<One of the following options>

---

## Retrieve a session

`getSession()`

Returns the session, refreshing it if necessary.

The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.

**IMPORTANT:** This method loads values directly from the storage attached to the client. If that storage is based on request cookies for example, the values in it may not be authentic and therefore it's strongly advised against using this method and its results in such circumstances. A warning will be emitted if this is detected. Use #getUser() instead.

-   Since the introduction of [asymmetric JWT signing keys](/docs/guides/auth/signing-keys), this method is considered low-level and we encourage you to use `getClaims()` or `getUser()` instead.
-   Retrieves the current [user session](/docs/guides/auth/sessions) from the storage medium (local storage, cookies).
-   The session contains an access token (signed JWT), a refresh token and the user object.
-   If the session's access token is expired or is about to expire, this method will use the refresh token to refresh the session.
-   When using in a browser, or you've called `startAutoRefresh()` in your environment (React Native, etc.) this function always returns a valid access token without refreshing the session itself, as this is done in the background. This function returns very fast.
-   **IMPORTANT SECURITY NOTICE:** If using an insecure storage medium, such as cookies or request headers, the user object returned by this function **must not be trusted**. Always verify the JWT using `getClaims()` or your own JWT verification library to securely establish the user's identity and access. You can also use `getUser()` to fetch the user object directly from the Auth server for this purpose.
-   When using in a browser, this function is synchronized across all tabs using the [LockManager](https://developer.mozilla.org/en-US/docs/Web/API/LockManager) API. In other environments make sure you've defined a proper `lock` property, if necessary, to make sure there are no race conditions while the session is being refreshed.

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.getSession()
```

---

## Retrieve a new session

`refreshSession(currentSession?)`

Returns a new session, regardless of expiry status. Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession(). If the current session's refresh token is invalid, an error will be thrown.

-   This method will refresh and return a new session whether the current one is expired or not.

### Parameters

-   currentSession
    
    Optional
    
    object
    
    The current session. If passed in, it must contain a refresh token.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.refreshSession()
const { session, user } = data
```

---

## Retrieve a user

`getUser(jwt?)`

Gets the current user details if there is an existing session. This method performs a network request to the Supabase Auth server, so the returned value is authentic and can be used to base authorization rules on.

-   This method fetches the user object from the database instead of local session.
-   This method is useful for checking if the user is authorized because it validates the user's access token JWT on the server.
-   Should always be used when checking for user authorization on the server. On the client, you can instead use `getSession().session.user` for faster results. `getSession` is insecure on the server.

### Parameters

-   jwt
    
    Optional
    
    string
    
    Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
    

### Return Type

Promise<One of the following options>

```
const { data: { user } } = await supabase.auth.getUser()
```

---

## Update a user

`updateUser(attributes, options)`

Updates user data for a logged in user.

-   In order to use the `updateUser()` method, the user needs to be signed in first.
-   By default, email updates sends a confirmation link to both the user's current and new email. To only send a confirmation link to the user's new email, disable **Secure email change** in your project's [email auth provider settings](/dashboard/project/_/auth/providers).

### Parameters

-   attributes UserAttributes
    
-   options object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.updateUser({
  email: 'new@email.com'
})
```

---

## Retrieve identities linked to a user

`getUserIdentities()`

Gets all the identities linked to a user.

-   The user needs to be signed in to call `getUserIdentities()`.

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.getUserIdentities()
```

---

## Link an identity to a user

`linkIdentity(credentials)`

Links an oauth identity to an existing user. This method supports the PKCE flow.

-   The **Enable Manual Linking** option must be enabled from your [project's authentication settings](/dashboard/project/_/auth/providers).
-   The user needs to be signed in to call `linkIdentity()`.
-   If the candidate identity is already linked to the existing user or another user, `linkIdentity()` will fail.
-   If `linkIdentity` is run in the browser, the user is automatically redirected to the returned URL. On the server, you should handle the redirect.

### Parameters

-   credentials One of the following options
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.linkIdentity({
  provider: 'github'
})
```

---

## Unlink an identity from a user

`unlinkIdentity(identity)`

Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.

-   The **Enable Manual Linking** option must be enabled from your [project's authentication settings](/dashboard/project/_/auth/providers).
-   The user needs to be signed in to call `unlinkIdentity()`.
-   The user must have at least 2 identities in order to unlink an identity.
-   The identity to be unlinked must belong to the user.

### Parameters

-   identity UserIdentity
    

### Return Type

Promise<One of the following options>

```
// retrieve all identities linked to a user
const identities = await supabase.auth.getUserIdentities()

// find the google identity
const googleIdentity = identities.find(
  identity => identity.provider === 'google'
)

// unlink the google identity
const { error } = await supabase.auth.unlinkIdentity(googleIdentity)
```

---

## Send a password reauthentication nonce

`reauthenticate()`

Sends a reauthentication OTP to the user's email or phone number. Requires the user to be signed-in.

-   This method is used together with `updateUser()` when a user's password needs to be updated.
-   If you require your user to reauthenticate before updating their password, you need to enable the **Secure password change** option in your [project's email provider settings](/dashboard/project/_/auth/providers).
-   A user is only require to reauthenticate before updating their password if **Secure password change** is enabled and the user **hasn't recently signed in**. A user is deemed recently signed in if the session was created in the last 24 hours.
-   This method will send a nonce to the user's email. If the user doesn't have a confirmed email address, the method will send the nonce to the user's confirmed phone number instead.
-   After receiving the OTP, include it as the `nonce` in your `updateUser()` call to finalize the password change.

### Return Type

Promise<One of the following options>

```
const { error } = await supabase.auth.reauthenticate()
```

---

## Resend an OTP

`resend(credentials)`

Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.

-   Resends a signup confirmation, email change or phone change email to the user.
-   Passwordless sign-ins can be resent by calling the `signInWithOtp()` method again.
-   Password recovery emails can be resent by calling the `resetPasswordForEmail()` method again.
-   This method will only resend an email or phone OTP to the user if there was an initial signup, email change or phone change request being made(note: For existing users signing in with OTP, you should use `signInWithOtp()` again to resend the OTP).
-   You can specify a redirect url when you resend an email link using the `emailRedirectTo` option.

### Parameters

-   credentials One of the following options
    

### Return Type

Promise<One of the following options>

---

## Set the session data

`setSession(currentSession)`

Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session. If the refresh token or access token in the current session is invalid, an error will be thrown.

-   This method sets the session using an `access_token` and `refresh_token`.
-   If successful, a `SIGNED_IN` event is emitted.

### Parameters

-   currentSession object
    
    The current session that minimally contains an access token and refresh token.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token
  })
```

---

## Exchange an auth code for a session

`exchangeCodeForSession(authCode)`

Log in an existing user by exchanging an Auth Code issued during the PKCE flow.

-   Used when `flowType` is set to `pkce` in client options.

### Parameters

-   authCode string
    

### Return Type

Promise<One of the following options>

```
supabase.auth.exchangeCodeForSession('34e770dd-9ff9-416c-87fa-43b31d7ef225')
```

---

## Start auto-refresh session (non-browser)

`startAutoRefresh()`

Starts an auto-refresh process in the background. The session is checked every few seconds. Close to the time of expiration a process is started to refresh the session. If refreshing fails it will be retried for as long as necessary.

If you set the GoTrueClientOptions#autoRefreshToken you don't need to call this function, it will be called for you.

On browsers the refresh process works only when the tab/window is in the foreground to conserve resources as well as prevent race conditions and flooding auth with requests. If you call this method any managed visibility change callback will be removed and you must manage visibility changes on your own.

On non-browser platforms the refresh process works _continuously_ in the background, which may not be desirable. You should hook into your platform's foreground indication mechanism and call these methods appropriately to conserve resources.

#stopAutoRefresh

-   Only useful in non-browser environments such as React Native or Electron.
-   The Supabase Auth library automatically starts and stops proactively refreshing the session when a tab is focused or not.
-   On non-browser platforms, such as mobile or desktop apps built with web technologies, the library is not able to effectively determine whether the application is _focused_ or not.
-   To give this hint to the application, you should be calling this method when the app is in focus and calling `supabase.auth.stopAutoRefresh()` when it's out of focus.

### Return Type

Promise<void>

---

## Stop auto-refresh session (non-browser)

`stopAutoRefresh()`

Stops an active auto refresh process running in the background (if any).

If you call this method any managed visibility change callback will be removed and you must manage visibility changes on your own.

See #startAutoRefresh for more details.

-   Only useful in non-browser environments such as React Native or Electron.
-   The Supabase Auth library automatically starts and stops proactively refreshing the session when a tab is focused or not.
-   On non-browser platforms, such as mobile or desktop apps built with web technologies, the library is not able to effectively determine whether the application is _focused_ or not.
-   When your application goes in the background or out of focus, call this method to stop the proactive refreshing of the session.

### Return Type

Promise<void>

---

## Initialize client session

`initialize()`

Initializes the client session either from the url or from storage. This method is automatically called when instantiating the client, but should also be called manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).

### Return Type

Promise<InitializeResult>

---

## Auth MFA

This section contains methods commonly used for Multi-Factor Authentication (MFA) and are invoked behind the `supabase.auth.mfa` namespace.

Currently, there is support for time-based one-time password (TOTP) and phone verification code as the 2nd factor. Recovery codes are not supported but users can enroll multiple factors, with an upper limit of 10.

Having a 2nd factor for recovery frees the user of the burden of having to store their recovery codes somewhere. It also reduces the attack surface since multiple recovery codes are usually generated compared to just having 1 backup factor.

Learn more about implementing MFA in your application [in the MFA guide](https://supabase.com/docs/guides/auth/auth-mfa#overview).

---

## Enroll a factor

`enroll(params)`

Starts the enrollment process for a new Multi-Factor Authentication (MFA) factor. This method creates a new `unverified` factor. To verify a factor, present the QR code or secret to the user and ask them to add it to their authenticator app. The user has to enter the code from their authenticator app to verify it.

Upon verifying a factor, all other sessions are logged out and the current session's authenticator level is promoted to `aal2`.

-   Use `totp` or `phone` as the `factorType` and use the returned `id` to create a challenge.
-   To create a challenge, see [`mfa.challenge()`](/docs/reference/javascript/auth-mfa-challenge).
-   To verify a challenge, see [`mfa.verify()`](/docs/reference/javascript/auth-mfa-verify).
-   To create and verify a TOTP challenge in a single step, see [`mfa.challengeAndVerify()`](/docs/reference/javascript/auth-mfa-challengeandverify).
-   To generate a QR code for the `totp` secret in Next.js, you can do the following:

```
<Image src={data.totp.qr_code} alt={data.totp.uri} layout="fill"></Image>
```

-   The `challenge` and `verify` steps are separated when using Phone factors as the user will need time to receive and input the code obtained from the SMS in challenge.

### Parameters

-   params One of the following options
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'your_friendly_name'
})

// Use the id to create a challenge.
// The challenge can be verified by entering the code generated from the authenticator app.
// The code will be generated upon scanning the qr_code or entering the secret into the authenticator app.
const { id, type, totp: { qr_code, secret, uri }, friendly_name } = data
const challenge = await supabase.auth.mfa.challenge({ factorId: id });
```

---

## Create a challenge

`challenge(params)`

Prepares a challenge used to verify that a user has access to a MFA factor.

-   An [enrolled factor](/docs/reference/javascript/auth-mfa-enroll) is required before creating a challenge.
-   To verify a challenge, see [`mfa.verify()`](/docs/reference/javascript/auth-mfa-verify).
-   A phone factor sends a code to the user upon challenge. The channel defaults to `sms` unless otherwise specified.

### Parameters

-   params One of the following options
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.mfa.challenge({
  factorId: '34e770dd-9ff9-416c-87fa-43b31d7ef225'
})
```

---

## Verify a challenge

`verify(params)`

Verifies a code against a challenge. The verification code is provided by the user by entering a code seen in their authenticator app.

-   To verify a challenge, please [create a challenge](/docs/reference/javascript/auth-mfa-challenge) first.

### Parameters

-   params One of the following options
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.mfa.verify({
  factorId: '34e770dd-9ff9-416c-87fa-43b31d7ef225',
  challengeId: '4034ae6f-a8ce-4fb5-8ee5-69a5863a7c15',
  code: '123456'
})
```

---

## Create and verify a challenge

`challengeAndVerify(params)`

Helper method which creates a challenge and immediately uses the given code to verify against it thereafter. The verification code is provided by the user by entering a code seen in their authenticator app.

-   Intended for use with only TOTP factors.
-   An [enrolled factor](/docs/reference/javascript/auth-mfa-enroll) is required before invoking `challengeAndVerify()`.
-   Executes [`mfa.challenge()`](/docs/reference/javascript/auth-mfa-challenge) and [`mfa.verify()`](/docs/reference/javascript/auth-mfa-verify) in a single step.

### Parameters

-   params MFAChallengeAndVerifyTOTPParams
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.mfa.challengeAndVerify({
  factorId: '34e770dd-9ff9-416c-87fa-43b31d7ef225',
  code: '123456'
})
```

---

## Unenroll a factor

`unenroll(params)`

Unenroll removes a MFA factor. A user has to have an `aal2` authenticator level in order to unenroll a `verified` factor.

### Parameters

-   params MFAUnenrollParams
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.mfa.unenroll({
  factorId: '34e770dd-9ff9-416c-87fa-43b31d7ef225',
})
```

---

## Get Authenticator Assurance Level

`getAuthenticatorAssuranceLevel(jwt?)`

Returns the Authenticator Assurance Level (AAL) for the active session.

-   `aal1` (or `null`) means that the user's identity has been verified only with a conventional login (email+password, OTP, magic link, social login, etc.).
-   `aal2` means that the user's identity has been verified both with a conventional login and at least one MFA factor.

When called without a JWT parameter, this method is fairly quick (microseconds) and rarely uses the network. When a JWT is provided (useful in server-side environments like Edge Functions where no session is stored), this method will make a network request to validate the user and fetch their MFA factors.

-   Authenticator Assurance Level (AAL) is the measure of the strength of an authentication mechanism.
-   In Supabase, having an AAL of `aal1` refers to having the 1st factor of authentication such as an email and password or OAuth sign-in while `aal2` refers to the 2nd factor of authentication such as a time-based, one-time-password (TOTP) or Phone factor.
-   If the user has a verified factor, the `nextLevel` field will return `aal2`, else, it will return `aal1`.
-   An optional `jwt` parameter can be passed to check the AAL level of a specific JWT instead of the current session.

### Parameters

-   jwt
    
    Optional
    
    string
    
    Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
const { currentLevel, nextLevel, currentAuthenticationMethods } = data
```

---

## List all factors for current user

`listFactors()`

Returns the list of MFA factors enabled for this user.

### Return Type

Promise<One of the following options>

---

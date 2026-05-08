## Auth Passkey

This section contains methods for WebAuthn passkey registration, authentication, and management. Methods are invoked behind the `supabase.auth.passkey` namespace.

Passkey support is an experimental feature. Enable it when creating the client:

```
const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    experimental: { passkey: true },
  },
})
```

---

## List passkeys

`list()`

---

## Update a passkey

`update(params)`

Updates a passkey's friendly name.

### Parameters

-   params PasskeyUpdateParams
    

### Return Type

Promise<One of the following options>

---

## Delete a passkey

`delete(params)`

Deletes a passkey for the currently signed-in user.

### Parameters

-   params PasskeyDeleteParams
    

### Return Type

Promise<One of the following options>

---

## Start passkey registration

`startRegistration()`

Starts the passkey registration ceremony. Fetches a registration challenge and credential creation options from the server. Used as the first step of a two-step registration flow when the caller wants to handle `navigator.credentials.create()` themselves.

### Return Type

Promise<One of the following options>

---

## Verify passkey registration

`verifyRegistration(params)`

Verifies a passkey registration credential against a previously issued challenge. Used as the second step of a two-step registration flow.

### Parameters

-   params VerifyPasskeyRegistrationParams
    

### Return Type

Promise<One of the following options>

---

## Start passkey authentication

`startAuthentication(params?)`

Starts the passkey authentication ceremony. Fetches an authentication challenge and credential request options from the server. Used as the first step of a two-step sign-in flow when the caller wants to handle `navigator.credentials.get()` themselves.

### Parameters

-   params
    
    Optional
    
    StartPasskeyAuthenticationParams
    

### Return Type

Promise<One of the following options>

---

## Verify passkey authentication

`verifyAuthentication(params)`

Verifies a passkey authentication credential against a previously issued challenge. Used as the second step of a two-step sign-in flow.

### Parameters

-   params VerifyPasskeyAuthenticationParams
    

### Return Type

Promise<One of the following options>

---

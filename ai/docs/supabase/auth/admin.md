## Auth Admin

-   Any method under the `supabase.auth.admin` namespace requires a `secret` key.
-   These methods are considered admin methods and should be called on a trusted server. Never expose your `secret` key in the browser.

```
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabase_url, secret_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Access auth admin api
const adminAuthClient = supabase.auth.admin
```

---

## Retrieve a user

`getUserById(uid)`

Get user by id.

-   Fetches the user object from the database based on the user's id.
-   The `getUserById()` method requires the user's id which maps to the `auth.users.id` column.

### Parameters

-   uid string
    
    The user's unique identifier
    
    This function should only be called on a server. Never expose your `service_role` key in the browser.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.admin.getUserById(1)
```

---

## List all users

`listUsers(params?)`

Get a list of users.

This function should only be called on a server. Never expose your `service_role` key in the browser.

-   Defaults to return 50 users per page.

### Parameters

-   params
    
    Optional
    
    PageParams
    
    An object which supports `page` and `perPage` as numbers, to alter the paginated results.
    

### Return Type

Promise<One of the following options>

```
const { data: { users }, error } = await supabase.auth.admin.listUsers()
```

---

## Create a user

`createUser(attributes)`

Creates a new user. This function should only be called on a server. Never expose your `service_role` key in the browser.

-   To confirm the user's email address or phone number, set `email_confirm` or `phone_confirm` to true. Both arguments default to false.
-   `createUser()` will not send a confirmation email to the user. You can use [`inviteUserByEmail()`](/docs/reference/javascript/auth-admin-inviteuserbyemail) if you want to send them an email invite instead.
-   If you are sure that the created user's email or phone number is legitimate and verified, you can set the `email_confirm` or `phone_confirm` param to `true`.

### Parameters

-   attributes AdminUserAttributes
    

### Return Type

Promise<One of the following options>

---

## Delete a user

`deleteUser(id, shouldSoftDelete)`

Delete a user. Requires a `service_role` key.

-   The `deleteUser()` method requires the user's ID, which maps to the `auth.users.id` column.

### Parameters

-   id string
    
    The user id you want to remove.
    
-   shouldSoftDelete boolean
    
    If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible. Defaults to false for backward compatibility.
    
    This function should only be called on a server. Never expose your `service_role` key in the browser.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.admin.deleteUser(
  '715ed5db-f090-4b8c-a067-640ecee36aa0'
)
```

---

## Send an email invite link

`inviteUserByEmail(email, options)`

Sends an invite link to an email address.

-   Sends an invite link to the user's email address.
-   The `inviteUserByEmail()` method is typically used by administrators to invite users to join the application.
-   Note that PKCE is not supported when using `inviteUserByEmail`. This is because the browser initiating the invite is often different from the browser accepting the invite which makes it difficult to provide the security guarantees required of the PKCE flow.

### Parameters

-   email string
    
    The email address of the user.
    
-   options object
    
    Additional options to be included when inviting.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.admin.inviteUserByEmail('email@example.com')
```

---

## Generate an email link

`generateLink(params)`

Generates email links and OTPs to be sent via a custom email provider.

-   The following types can be passed into `generateLink()`: `signup`, `magiclink`, `invite`, `recovery`, `email_change_current`, `email_change_new`, `phone_change`.
-   `generateLink()` only generates the email link for `email_change_email` if the **Secure email change** is enabled in your project's [email auth provider settings](/dashboard/project/_/auth/providers).
-   `generateLink()` handles the creation of the user for `signup`, `invite` and `magiclink`.

### Return Type

Promise<One of the following options>

---

## Update a user

`updateUserById(uid, attributes)`

Updates the user data. Changes are applied directly without confirmation flows.

**Important:** This is a server-side operation and does **not** trigger client-side `onAuthStateChange` listeners. The admin API has no connection to client state.

To sync changes to the client after calling this method:

1.  On the client, call `supabase.auth.refreshSession()` to fetch the updated user data
2.  This will trigger the `TOKEN_REFRESHED` event and notify all listeners

### Parameters

-   uid string
    
    The user's unique identifier
    
-   attributes AdminUserAttributes
    
    The data you want to update.
    
    This function should only be called on a server. Never expose your `service_role` key in the browser.
    

### Return Type

Promise<One of the following options>

```
// Server-side (Edge Function)
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  { user_metadata: { preferences: { theme: 'dark' } } }
)

// Client-side (to sync the changes)
const { data, error } = await supabase.auth.refreshSession()
// onAuthStateChange listeners will now be notified with updated user
```

---

## Sign out a user (admin)

`signOut(jwt, scope)`

Removes a logged-in session.

### Parameters

-   jwt string
    
    A valid, logged-in JWT.
    
-   scope One of the following options
    
    The logout sope.
    

### Return Type

Promise<object>

---

## Delete a factor for a user

`deleteFactor(params)`

Deletes a factor on a user. This will log the user out of all active sessions if the deleted factor was verified.

### Parameters

-   params AuthMFAAdminDeleteFactorParams
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.admin.mfa.deleteFactor({
  id: '34e770dd-9ff9-416c-87fa-43b31d7ef225',
  userId: 'a89baba7-b1b7-440f-b4bb-91026967f66b',
})
```

---

## List all factors for a user (admin)

`listFactors(params)`

Lists all factors associated to a user.

### Parameters

-   params AuthMFAAdminListFactorsParams
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase.auth.admin.mfa.listFactors()
```

---

## Passkey Admin

Contains passkey administration methods. Requires a secret key.

---

## List passkeys for a user

`listPasskeys(params)`

### Parameters

-   params AuthPasskeyAdminListParams
    

### Return Type

Promise<One of the following options>

---

## Delete a passkey

`deletePasskey(params)`

Deletes a specific passkey for a specific user.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   params AuthPasskeyAdminDeleteParams
    

### Return Type

Promise<One of the following options>

---

## OAuth Admin

The OAuth Admin API allows you to manage OAuth clients programmatically. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth. These functions should only be called on a server. Never expose your `secret` key in the browser.

---

## List OAuth clients

`listClients(params?)`

Lists all OAuth clients with optional pagination. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   params
    
    Optional
    
    PageParams
    

### Return Type

Promise<One of the following options>

---

## Get OAuth client

`getClient(clientId)`

Gets details of a specific OAuth client. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   clientId string
    

### Return Type

Promise<One of the following options>

---

## Create OAuth client

`createClient(params)`

Creates a new OAuth client. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   params CreateOAuthClientParams
    

### Return Type

Promise<One of the following options>

---

## Update OAuth client

`updateClient(clientId, params)`

Updates an existing OAuth client. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   clientId string
    
-   params UpdateOAuthClientParams
    

### Return Type

Promise<One of the following options>

---

## Delete OAuth client

`deleteClient(clientId)`

Deletes an OAuth client. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   clientId string
    

### Return Type

Promise<object>

---

## Regenerate client secret

`regenerateClientSecret(clientId)`

Regenerates the secret for an OAuth client. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This function should only be called on a server. Never expose your `service_role` key in the browser.

### Parameters

-   clientId string
    

### Return Type

Promise<One of the following options>

---

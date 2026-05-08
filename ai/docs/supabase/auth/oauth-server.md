## OAuth Server

The OAuth Server API allows you to build custom OAuth consent screens for your application. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

---

## Get authorization details

`getAuthorizationDetails(authorizationId)`

Retrieves details about an OAuth authorization request. Used to display consent information to the user. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

This method returns one of two response types:

-   `OAuthAuthorizationDetails`: User needs to consent - show consent page with client info
-   `OAuthRedirect`: User already consented - redirect immediately to the OAuth client

Use type narrowing to distinguish between the responses:

```
if ('authorization_id' in data) {
  // Show consent page
} else {
  // Redirect to data.redirect_url
}
```

### Parameters

-   authorizationId string
    
    The authorization ID from the authorization request
    

### Return Type

Promise<One of the following options>

---

## Approve authorization

`approveAuthorization(authorizationId, options?)`

Approves an OAuth authorization request. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

After approval, the user's consent is stored and an authorization code is generated. The response contains a complete redirect URL with the authorization code and state.

### Parameters

-   authorizationId string
    
    The authorization ID to approve
    
-   options
    
    Optional
    
    object
    
    Optional parameters
    

### Return Type

Promise<One of the following options>

---

## Deny authorization

`denyAuthorization(authorizationId, options?)`

Denies an OAuth authorization request. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

After denial, the response contains a redirect URL with an OAuth error (access_denied) to inform the OAuth client that the user rejected the request.

### Parameters

-   authorizationId string
    
    The authorization ID to deny
    
-   options
    
    Optional
    
    object
    
    Optional parameters
    

### Return Type

Promise<One of the following options>

---

## List grants

`listGrants()`

Lists all OAuth grants that the authenticated user has authorized. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

### Return Type

Promise<One of the following options>

---

## Revoke grant

`revokeGrant(options)`

Revokes a user's OAuth grant for a specific client. Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.

Revocation marks consent as revoked, deletes active sessions for that OAuth client, and invalidates associated refresh tokens.

### Parameters

-   options object
    
    Revocation options
    

### Return Type

Promise<One of the following options>

---

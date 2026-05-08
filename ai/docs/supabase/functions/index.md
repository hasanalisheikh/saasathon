## Invokes a Supabase Edge Function.

`invoke(functionName, options)`

Invokes a function

-   Requires an Authorization header.
-   Invoke params generally match the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) spec.
-   When you pass in a body to your function, we automatically attach the Content-Type header for `Blob`, `ArrayBuffer`, `File`, `FormData` and `String`. If it doesn't match any of these types we assume the payload is `json`, serialize it and attach the `Content-Type` header as `application/json`. You can override this behavior by passing in a `Content-Type` header of your own.
-   Responses are automatically parsed as `json`, `blob` and `form-data` depending on the `Content-Type` header sent by your function. Responses are parsed as `text` by default.

### Parameters

-   functionName string
    
    The name of the Function to invoke.
    
-   options FunctionInvokeOptions
    
    Options for invoking the Function.
    

---

## CORS headers for Edge Functions

---

## Update authorization token

`setAuth(token)`

---

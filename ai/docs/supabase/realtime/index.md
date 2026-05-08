## Subscribe to channel

`on(type, filter, callback)`

Creates an event handler that listens to changes.

-   By default, Broadcast and Presence are enabled for all projects.
-   By default, listening to database changes is disabled for new projects due to database performance and security concerns. You can turn it on by managing Realtime's [replication](/docs/guides/api#realtime-api-overview).
-   You can receive the "previous" data for updates and deletes by setting the table's `REPLICA IDENTITY` to `FULL` (e.g., `ALTER TABLE your_table REPLICA IDENTITY FULL;`).
-   Row level security is not applied to delete statements. When RLS is enabled and replica identity is set to full, only the primary key is sent to clients.

### Parameters

-   type One of the following options
    
-   filter One of the following options
    
-   callback function
    

---

## Unsubscribe from a channel

`removeChannel(channel)`

Unsubscribes and removes Realtime channel from Realtime client.

-   Removing a channel is a great way to maintain the performance of your project's Realtime service as well as your database if you're listening to Postgres changes. Supabase will automatically handle cleanup 30 seconds after a client is disconnected, but unused channels may cause degradation as more clients are simultaneously subscribed.

### Parameters

-   channel RealtimeChannel
    
    The name of the Realtime channel.
    

### Return Type

Promise<One of the following options>

```
supabase.removeChannel(myChannel)
```

---

## Unsubscribe from all channels

`removeAllChannels()`

Unsubscribes and removes all Realtime channels from Realtime client.

-   Removing channels is a great way to maintain the performance of your project's Realtime service as well as your database if you're listening to Postgres changes. Supabase will automatically handle cleanup 30 seconds after a client is disconnected, but unused channels may cause degradation as more clients are simultaneously subscribed.

### Return Type

Promise<Array<One of the following options>>

```
supabase.removeAllChannels()
```

---

## Retrieve all channels

`getChannels()`

Returns all Realtime channels.

### Return Type

Array<RealtimeChannel>

```
const channels = supabase.getChannels()
```

---

## Broadcast a message

`send(args, opts)`

### Parameters

-   args object
    
    Arguments to send to channel
    
-   opts { [key: string]: any }
    
    Options to be used during the send process
    

### Return Type

Promise<One of the following options>

---

## Set authentication token

`setAuth(token)`

Sets the JWT access token used for channel subscription authorization and Realtime RLS.

If param is null it will use the `accessToken` callback function or the token set on the client.

On callback used, it will set the value of the token internal to the client.

When a token is explicitly provided, it will be preserved across channel operations (including removeChannel and resubscribe). The `accessToken` callback will not be invoked until `setAuth()` is called without arguments.

### Parameters

-   token One of the following options
    
    A JWT string to override the token set on the client.
    

### Return Type

Promise<void>

---

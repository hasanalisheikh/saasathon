## Fetch data

`select(columns?, options?)`

Perform a SELECT query on the table or view.

When using `count` with `.range()` or `.limit()`, the returned `count` is the total number of rows that match your filters, not the number of rows in the current page. Use this to build pagination UI.

-   By default, Supabase projects return a maximum of 1,000 rows. This setting can be changed in your project's [API settings](/dashboard/project/_/settings/api). It's recommended that you keep it low to limit the payload size of accidental or malicious requests. You can use `range()` queries to paginate through your data.
-   `select()` can be combined with [Filters](/docs/reference/javascript/using-filters)
-   `select()` can be combined with [Modifiers](/docs/reference/javascript/using-modifiers)
-   `apikey` is a reserved keyword if you're using the [Supabase Platform](/docs/guides/platform) and [should be avoided as a column name](https://github.com/supabase/supabase/issues/5465). \*

### Parameters

-   columns
    
    Optional
    
    Query
    
    The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
    
-   options
    
    Optional
    
    object
    
    Named parameters
    

```
const { data, error } = await supabase
  .from('characters')
  .select()
```

---

## Insert data

`insert(values, options)`

Perform an INSERT into the table or view.

By default, inserted rows are not returned. To return it, chain the call with `.select()`.

### Parameters

-   values One of the following options
    
    The values to insert. Pass an object to insert a single row or an array to insert multiple rows.
    
-   options object
    
    Named parameters
    

```
const { error } = await supabase
  .from('countries')
  .insert({ id: 1, name: 'Mordor' })
```

---

## Update data

`update(values, options)`

Perform an UPDATE on the table or view.

By default, updated rows are not returned. To return it, chain the call with `.select()` after filters.

-   `update()` should always be combined with [Filters](/docs/reference/javascript/using-filters) to target the item(s) you wish to update.

### Parameters

-   values RejectExcessProperties
    
    The values to update with
    
-   options object
    
    Named parameters
    

```
const { error } = await supabase
  .from('instruments')
  .update({ name: 'piano' })
  .eq('id', 1)
```

---

## Upsert data

`upsert(values, options)`

Perform an UPSERT on the table or view. Depending on the column(s) passed to `onConflict`, `.upsert()` allows you to perform the equivalent of `.insert()` if a row with the corresponding `onConflict` columns doesn't exist, or if it does exist, perform an alternative action depending on `ignoreDuplicates`.

By default, upserted rows are not returned. To return it, chain the call with `.select()`.

-   Primary keys must be included in `values` to use upsert.

### Parameters

-   values One of the following options
    
    The values to upsert with. Pass an object to upsert a single row or an array to upsert multiple rows.
    
-   options object
    
    Named parameters
    

```
// Upserting a single row, overwriting based on the 'username' unique column
const { data, error } = await supabase
  .from('users')
  .upsert({ username: 'supabot' }, { onConflict: 'username' })

// Example response:
// {
//   data: [
//     { id: 4, message: 'bar', username: 'supabot' }
//   ],
//   error: null
// }
```

---

## Delete data

`delete(options)`

Perform a DELETE on the table or view.

By default, deleted rows are not returned. To return it, chain the call with `.select()` after filters.

-   `delete()` should always be combined with [filters](/docs/reference/javascript/using-filters) to target the item(s) you wish to delete.
-   If you use `delete()` with filters and you have [RLS](/docs/learn/auth-deep-dive/auth-row-level-security) enabled, only rows visible through `SELECT` policies are deleted. Note that by default no rows are visible, so you need at least one `SELECT` / `ALL` policy that makes the rows visible.
-   When using `delete().in()`, specify an array of values to target multiple rows with a single query. This is particularly useful for batch deleting entries that share common criteria, such as deleting users by their IDs. Ensure that the array you provide accurately represents all records you intend to delete to avoid unintended data removal.

### Parameters

-   options object
    
    Named parameters
    

```
const response = await supabase
  .from('countries')
  .delete()
  .eq('id', 1)
```

---

## Call a Postgres function

`rpc(fn, args, options)`

Perform a function call.

### Parameters

-   fn FnName
    
    The function name to call
    
-   args Args
    
    The arguments to pass to the function call
    
-   options object
    
    Named parameters
    

```
// For cross-schema functions where type inference fails, use overrideTypes:
const { data } = await supabase
  .schema('schema_b')
  .rpc('function_a', {})
  .overrideTypes<{ id: string; user_id: string }[]>()
```

---

## Using modifiers

Filters work on the row level—they allow you to return rows that only match certain conditions without changing the shape of the rows. Modifiers are everything that don't fit that definition—allowing you to change the format of the response (e.g., returning a CSV string).

Modifiers must be specified after filters. Some modifiers only apply for queries that return rows (e.g., `select()` or `rpc()` on a function that returns a table response).

---

## Return data after inserting

`select(columns?)`

Perform a SELECT on the query result.

By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not return modified rows. By calling this method, modified rows are returned in `data`.

### Parameters

-   columns
    
    Optional
    
    Query
    
    The columns to retrieve, separated by commas

```
const { data, error } = await supabase
  .from('characters')
  .upsert({ id: 1, name: 'Han Solo' })
  .select()
```

---

## Order the results

`order(column, options?)`

Order the query result by `column`.

You can call this method multiple times to order by multiple columns.

You can order referenced tables, but it only affects the ordering of the parent table if you use `!inner` in the query.

### Parameters

-   column One of the following options
    
-   options
    
    Optional
    
    object
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select('id, name')
  .order('id', { ascending: false })
```

---

## Limit the number of rows returned

`limit(count, options)`

Limit the query result by `count`.

### Parameters

-   count number
    
    The maximum number of rows to return
    
-   options object
    
    Named parameters
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select('name')
  .limit(1)
```

---

## Limit the query to a range

`range(from, to, options)`

Limit the query result by starting at an offset `from` and ending at the offset `to`. Only records within this range are returned. This respects the query order and if there is no order clause the range could behave unexpectedly. The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third and fourth rows of the query.

### Parameters

-   from number
    
    The starting index from which to limit the result
    
-   to number
    
    The last index to which to limit the result
    
-   options object
    
    Named parameters
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select('name')
  .range(0, 1)
```

---

## Set an abort signal

`abortSignal(signal)`

Set the AbortSignal for the fetch request.

You can use this to set a timeout for the request.

### Parameters

-   signal AbortSignal
    
    The AbortSignal to use for the fetch request
    

### Return Type

this

```
const ac = new AbortController()

const { data, error } = await supabase
  .from('very_big_table')
  .select()
  .abortSignal(ac.signal)

// Abort the request after 100 ms
setTimeout(() => ac.abort(), 100)
```

---

## Retrieve one row of data

`single()`

Return `data` as a single object instead of an array of objects.

Query result must be one row (e.g. using `.limit(1)`), otherwise this returns an error.

```
const { data, error } = await supabase
  .from('characters')
  .select('name')
  .limit(1)
  .single()
```

---

## Retrieve zero or one row of data

`maybeSingle()`

Return `data` as a single object instead of an array of objects.

Query result must be zero or one row (e.g. using `.limit(1)`), otherwise this returns an error.

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .eq('name', 'Katniss')
  .maybeSingle()
```

---

## Retrieve as a CSV

`csv()`

Return `data` as a string in CSV format.

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .csv()
```

---

## Strip null values

`stripNulls()`

Strip null values from the response data. Properties with `null` values will be omitted from the returned JSON objects.

Requires PostgREST 11.2.0+.

[https://docs.postgrest.org/en/stable/references/api/resource\_representation.html#stripped-nulls](https://docs.postgrest.org/en/stable/references/api/resource\_representation.html#stripped-nulls)

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .stripNulls()
```

---

## Override type of successful response

`returns()`

Override the type of the returned `data`.

-   Deprecated: use overrideTypes method instead

```
const { data } = await supabase
  .from('countries')
  .select()
  .returns<Array<MyType>>()
```

---

## Partially override or replace type of successful response

`overrideTypes()`

Override the type of the returned `data` field in the response.

```
// Merge with existing types (default behavior)
const query = supabase
  .from('users')
  .select()
  .overrideTypes<{ custom_field: string }>()

// Replace existing types completely
const replaceQuery = supabase
  .from('users')
  .select()
  .overrideTypes<{ id: number; name: string }, { merge: false }>()
```

---

## Using explain

`explain(options)`

Return `data` as the EXPLAIN plan for the query.

You need to enable the [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain) setting before using this method.

### Parameters

-   options object
    
    Named parameters
    

### Return Type

One of the following options

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .explain()
```

---

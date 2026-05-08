## Using filters

Filters allow you to only return rows that match certain conditions.

Filters can be used on `select()`, `update()`, `upsert()`, and `delete()` queries.

If a Postgres function returns a table response, you can also apply filters.

```
const { data, error } = await supabase
  .from('instruments')
  .select('name, section_id')
  .eq('name', 'violin')    // Correct

const { data, error } = await supabase
  .from('instruments')
  .eq('name', 'violin')    // Incorrect
  .select('name, section_id')
```

---

## Column is equal to a value

`eq(column, value)`

Match only rows where `column` is equal to `value`.

To check if the value of `column` is NULL, you should use `.is()` instead.

### Parameters

-   column
    
    The column to filter on
    
-   value
    
    The value to filter with
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .eq('name', 'Leia')
```

---

## Column is not equal to a value

`neq(column, value)`

Match only rows where `column` is not equal to `value`.

### Parameters

-   column
    
    The column to filter on
    
-   value
    
    The value to filter with
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .neq('name', 'Leia')
```

---

## Column is greater than a value

`gt(column, value)`

Match only rows where `column` is greater than `value`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .gt('id', 2)
```

---

## Column is greater than or equal to a value

`gte(column, value)`

Match only rows where `column` is greater than or equal to `value`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .gte('id', 2)
```

---

## Column is less than a value

`lt(column, value)`

Match only rows where `column` is less than `value`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .lt('id', 2)
```

---

## Column is less than or equal to a value

`lte(column, value)`

Match only rows where `column` is less than or equal to `value`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .lte('id', 2)
```

---

## Column matches a pattern

`like(column, pattern)`

Match only rows where `column` matches `pattern` case-sensitively.

### Parameters

-   column One of the following options
    
-   pattern string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .like('name', '%Lu%')
```

---

## Column matches a case-insensitive pattern

`ilike(column, pattern)`

Match only rows where `column` matches `pattern` case-insensitively.

### Parameters

-   column One of the following options
    
-   pattern string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .ilike('name', '%lu%')
```

---

## Column is a value

`is(column, value)`

Match only rows where `column` IS `value`.

For non-boolean columns, this is only relevant for checking if the value of `column` is NULL by setting `value` to `null`.

For boolean columns, you can also set `value` to `true` or `false` and it will behave the same way as `.eq()`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('countries')
  .select()
  .is('name', null)
```

---

## Column is in an array

`in(column, values)`

Match only rows where `column` is included in the `values` array.

### Parameters

-   column ColumnName
    
    The column to filter on
    
-   values Array
    
    The values array to filter with
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .in('name', ['Leia', 'Han'])
```

---

## Column contains every element in a value

`contains(column, value)`

Only relevant for jsonb, array, and range columns. Match only rows where `column` contains every element appearing in `value`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('issues')
  .select()
  .contains('tags', ['is:open', 'priority:low'])
```

---

## Contained by value

`containedBy(column, value)`

Only relevant for jsonb, array, and range columns. Match only rows where every element appearing in `column` is contained by `value`.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('classes')
  .select('name')
  .containedBy('days', ['monday', 'tuesday', 'wednesday', 'friday'])
```

---

## Greater than a range

`rangeGt(column, range)`

Only relevant for range columns. Match only rows where every element in `column` is greater than any element in `range`.

### Parameters

-   column One of the following options
    
-   range string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeGt('during', '[2000-01-02 08:00, 2000-01-02 09:00)')
```

---

## Greater than or equal to a range

`rangeGte(column, range)`

Only relevant for range columns. Match only rows where every element in `column` is either contained in `range` or greater than any element in `range`.

### Parameters

-   column One of the following options
    
-   range string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeGte('during', '[2000-01-02 08:30, 2000-01-02 09:30)')
```

---

## Less than a range

`rangeLt(column, range)`

Only relevant for range columns. Match only rows where every element in `column` is less than any element in `range`.

### Parameters

-   column One of the following options
    
-   range string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeLt('during', '[2000-01-01 15:00, 2000-01-01 16:00)')
```

---

## Less than or equal to a range

`rangeLte(column, range)`

Only relevant for range columns. Match only rows where every element in `column` is either contained in `range` or less than any element in `range`.

### Parameters

-   column One of the following options
    
-   range string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeLte('during', '[2000-01-01 14:00, 2000-01-01 16:00)')
```

---

## Mutually exclusive to a range

`rangeAdjacent(column, range)`

Only relevant for range columns. Match only rows where `column` is mutually exclusive to `range` and there can be no element between the two ranges.

### Parameters

-   column One of the following options
    
-   range string
    

### Return Type

this

```
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeAdjacent('during', '[2000-01-01 12:00, 2000-01-01 13:00)')
```

---

## With a common element

`overlaps(column, value)`

Only relevant for array and range columns. Match only rows where `column` and `value` have an element in common.

### Parameters

-   column One of the following options
    
-   value One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('issues')
  .select('title')
  .overlaps('tags', ['is:closed', 'severity:high'])
```

---

## Match a string

`textSearch(column, query, options?)`

Only relevant for text and tsvector columns. Match only rows where `column` matches the query string in `query`.

-   For more information, see [Postgres full text search](/docs/guides/database/full-text-search).

### Parameters

-   column One of the following options
    
-   query string
    
-   options
    
    Optional
    
    object
    

### Return Type

this

---

## Match an associated value

`match(query)`

Match only rows where each column in `query` keys is equal to its associated value. Shorthand for multiple `.eq()` s.

### Parameters

-   query One of the following options
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select('name')
  .match({ id: 2, name: 'Leia' })
```

---

## Don't match the filter

`not(column, operator, value)`

Match only rows which doesn't satisfy the filter.

Unlike most filters, `opearator` and `value` are used as-is and need to follow [PostgREST syntax](https://postgrest.org/en/stable/api.html#operators). You also need to make sure they are properly sanitized.

not() expects you to use the raw PostgREST syntax for the filter values.

```
.not('id', 'in', '(5,6,7)')  // Use `()` for `in` filter
.not('arraycol', 'cs', '{"a","b"}')  // Use `cs` for `contains()`, `{}` for array values
```

### Parameters

-   column One of the following options
    
-   operator One of the following options
    
-   value One of the following options
    

```
const { data, error } = await supabase
  .from('countries')
  .select()
  .not('name', 'is', null)
```

---

## Match at least one filter

`or(filters, options)`

Match only rows which satisfy at least one of the filters.

Unlike most filters, `filters` is used as-is and needs to follow [PostgREST syntax](https://postgrest.org/en/stable/api.html#operators). You also need to make sure it's properly sanitized.

It's currently not possible to do an `.or()` filter across multiple tables.

or() expects you to use the raw PostgREST syntax for the filter names and values.

```
.or('id.in.(5,6,7), arraycol.cs.{"a","b"}')  // Use `()` for `in` filter, `{}` for array values and `cs` for `contains()`.
.or('id.in.(5,6,7), arraycol.cd.{"a","b"}')  // Use `cd` for `containedBy()`
```

### Parameters

-   filters string
    
    The filters to use, following PostgREST syntax
    
-   options object
    
    Named parameters
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select('name')
  .or('id.eq.2,name.eq.Han')
```

---

## Match the filter

`filter(column, operator, value)`

Match only rows which satisfy the filter. This is an escape hatch - you should use the specific filter methods wherever possible.

Unlike most filters, `opearator` and `value` are used as-is and need to follow [PostgREST syntax](https://postgrest.org/en/stable/api.html#operators). You also need to make sure they are properly sanitized.

filter() expects you to use the raw PostgREST syntax for the filter values.

```
.filter('id', 'in', '(5,6,7)')  // Use `()` for `in` filter
.filter('arraycol', 'cs', '{"a","b"}')  // Use `cs` for `contains()`, `{}` for array values
```

### Parameters

-   column One of the following options
    
-   operator One of the following options
    
-   value unknown
    

### Return Type

this

```
const { data, error } = await supabase
  .from('characters')
  .select()
  .filter('name', 'in', '("Han","Yoda")')
```

---

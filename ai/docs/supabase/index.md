---
title: "JavaScript API Reference"
url: "https://supabase.com/docs/reference/javascript/auth-admin-oauth-server"
author: "Get authorization details, Approve authorization, Deny authorization"
---

JavaScript Reference v2.0

## JavaScript Client Library

@supabase/supabase-js

This reference documents every object and method available in Supabase's isomorphic JavaScript library, `supabase-js`. You can use `supabase-js` to interact with your Postgres database, listen to database changes, invoke Deno Edge Functions, build login and user management functionality, and manage large files.

To convert SQL queries to `supabase-js` calls, use the [SQL to REST API translator](/docs/guides/api/sql-to-rest).

---

## Installing

### Install as package

You can install @supabase/supabase-js via the terminal.

```
npm install @supabase/supabase-js
```

### Install via CDN

You can install @supabase/supabase-js via CDN links.

```
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//or
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
```

### Use at runtime in Deno

You can use supabase-js in the Deno runtime via [JSR](https://jsr.io/@supabase/supabase-js):

```
import { createClient } from 'npm:@supabase/supabase-js@2'
```

### Enable Data API access

supabase-js uses the Data API to query and mutate your Postgres data. You first need to grant Data API roles permissions to access your tables and functions.

In [Data API integrations settings](/dashboard/project/_/integrations/data_api/settings), expose the specific tables and functions you want to access. To automatically grant access for new tables and functions in `public`, enable **Default privileges for new entities**.

Alternatively, use SQL to grant the required permissions:

```
-- Before granting access to client roles, make sure RLS is enabled
-- and create the policies required for each role's allowed operations.
alter table public.your_table enable row level security;
-- create policy ... on public.your_table ...;

-- Grant least-privilege access to tables after RLS and policies are in place
grant select on public.your_table to anon;
grant select, insert, update, delete on public.your_table to authenticated;
grant all on public.your_table to service_role;

-- Grant execute on functions after verifying any table access they rely on
grant execute on function public.your_function to authenticated, service_role;
```

---

## Initializing

Create a new client for use in the browser.

### Parameters

-   supabaseUrl string
    
    The unique Supabase URL which is supplied when you create a new project in your project dashboard.
    
-   supabaseKey string
    
    The unique Supabase Key which is supplied when you create a new project in your project dashboard.
    
-   options
    
    Optional
    
    SupabaseClientOptions
    

```
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://xyzcompany.supabase.co', 'your-publishable-key')
```

---

## TypeScript support

`supabase-js` has TypeScript support for type inference, autocompletion, type-safe queries, and more.

With TypeScript, `supabase-js` detects things like `not null` constraints and [generated columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html). Nullable columns are typed as `T | null` when you select the column. Generated columns will show a type error when you insert to it.

`supabase-js` also detects relationships between tables. A referenced table with one-to-many relationship is typed as `T[]`. Likewise, a referenced table with many-to-one relationship is typed as `T | null`.

## Generating TypeScript Types

You can use the Supabase CLI to [generate the types](/docs/reference/cli/supabase-gen-types). You can also generate the types [from the dashboard](https://supabase.com/dashboard/project/_/api?page=tables-intro).

```
supabase gen types typescript --project-id abcdefghijklmnopqrst > database.types.ts
```

These types are generated from your database schema. Given a table `public.movies`, the generated types will look like:

```
create table public.movies (
  id bigint generated always as identity primary key,
  name text not null,
  data jsonb null
);
```

```
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {               // the data expected from .select()
          id: number
          name: string
          data: Json | null
        }
        Insert: {            // the data to be passed to .insert()
          id?: never         // generated columns must not be supplied
          name: string       // `not null` columns with no default must be supplied
          data?: Json | null // nullable columns can be omitted
        }
        Update: {            // the data to be passed to .update()
          id?: never
          name?: string      // `not null` columns are optional on .update()
          data?: Json | null
        }
      }
    }
  }
}
```

## Using TypeScript type definitions

You can supply the type definitions to `supabase-js` like so:

```
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
)
```

## Helper types for Tables and Joins

You can use the following helper types to make the generated TypeScript types easier to use.

Sometimes the generated types are not what you expect. For example, a view's column may show up as nullable when you expect it to be `not null`. Using [type-fest](https://github.com/sindresorhus/type-fest), you can override the types like so:

```
export type Json = // ...

export interface Database {
  // ...
}
```

```
import { MergeDeep } from 'type-fest'
import { Database as DatabaseGenerated } from './database-generated.types'
export { Json } from './database-generated.types'

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        movies_view: {
          Row: {
            // id is a primary key in public.movies, so it must be `not null`
            id: number
          }
        }
      }
    }
  }
>
```

You can also override the type of an individual successful response if needed:

```
// Partial type override allows you to only override some of the properties in your results
const { data } = await supabase.from('countries').select().overrideTypes<Array<{ id: string }>>()
// For a full replacement of the original return type use the `{ merge: false }` property as second argument
const { data } = await supabase
  .from('countries')
  .select()
  .overrideTypes<Array<{ id: string }>, { merge: false }>()
// Use it with `maybeSingle` or `single`
const { data } = await supabase.from('countries').select().single().overrideTypes<{ id: string }>()
```

The generated types provide shorthands for accessing tables and enums.

```
import { Database, Tables, Enums } from "./database.types.ts";

// Before 😕
let movie: Database['public']['Tables']['movies']['Row'] = // ...

// After 😍
let movie: Tables<'movies'>
```

### Response types for complex queries

`supabase-js` always returns a `data` object (for success), and an `error` object (for unsuccessful requests).

These helper types provide the result types from any query, including nested types for database joins.

Given the following schema with a relation between cities and countries, we can get the nested `CountriesWithCities` type:

```
create table countries (
  "id" serial primary key,
  "name" text
);

create table cities (
  "id" serial primary key,
  "name" text,
  "country_id" int references "countries"
);
```

```
import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js'

const countriesWithCitiesQuery = supabase
  .from("countries")
  .select(`
    id,
    name,
    cities (
      id,
      name
    )
  `);
type CountriesWithCities = QueryData<typeof countriesWithCitiesQuery>;

const { data, error } = await countriesWithCitiesQuery;
if (error) throw error;
const countriesWithCities: CountriesWithCities = data;
```

---

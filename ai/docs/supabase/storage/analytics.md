## Analytics Buckets

This section contains methods for working with Analytics Buckets.

---

## Access an analytics bucket

Creates a new StorageAnalyticsClient instance

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

---

## Create a new analytics bucket

`createBucket(name)`

Creates a new analytics bucket using Iceberg tables Analytics buckets are optimized for analytical queries and data processing

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

-   Creates a new analytics bucket using Iceberg tables
-   Analytics buckets are optimized for analytical queries and data processing

### Parameters

-   name string
    
    A unique name for the bucket you are creating
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .analytics
  .createBucket('analytics-data')
```

---

## List analytics buckets

`listBuckets(options?)`

Retrieves the details of all Analytics Storage buckets within an existing project Only returns buckets of type 'ANALYTICS'

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

-   Retrieves the details of all Analytics Storage buckets within an existing project
-   Only returns buckets of type 'ANALYTICS'

### Parameters

-   options
    
    Optional
    
    object
    
    Query parameters for listing buckets
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .analytics
  .listBuckets({
    limit: 10,
    offset: 0,
    sortColumn: 'created_at',
    sortOrder: 'desc'
  })
```

---

## Delete an analytics bucket

`deleteBucket(bucketName)`

Deletes an existing analytics bucket A bucket can't be deleted with existing objects inside it You must first empty the bucket before deletion

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

-   Deletes an analytics bucket

### Parameters

-   bucketName string
    
    The unique identifier of the bucket you would like to delete
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .analytics
  .deleteBucket('analytics-data')
```

---

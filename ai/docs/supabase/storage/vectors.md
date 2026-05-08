## Vector Buckets

This section contains methods for working with Vector Buckets.

---

## Access a vector bucket

`from(vectorBucketName)`

Access operations for a specific vector bucket Returns a scoped client for index and vector operations within the bucket

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   vectorBucketName string
    
    Name of the vector bucket
    

```
const bucket = supabase.storage.vectors.from('embeddings-prod')
```

---

## Create a vector bucket

`createBucket(vectorBucketName)`

Creates a new vector bucket Vector buckets are containers for vector indexes and their data

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   vectorBucketName string
    
    Unique name for the vector bucket
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .vectors
  .createBucket('embeddings-prod')
```

---

## Delete a vector bucket

`deleteBucket(vectorBucketName)`

Deletes a vector bucket (bucket must be empty) All indexes must be deleted before deleting the bucket

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   vectorBucketName string
    
    Name of the vector bucket to delete
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .vectors
  .deleteBucket('embeddings-old')
```

---

## Retrieve a vector bucket

`getBucket(vectorBucketName)`

Retrieves metadata for a specific vector bucket

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   vectorBucketName string
    
    Name of the vector bucket
    

### Return Type

Promise<One of the following options>

---

## List all vector buckets

`listBuckets(options)`

Lists all vector buckets with optional filtering and pagination

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options ListVectorBucketsOptions
    
    Optional filters (prefix, maxResults, nextToken)
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .vectors
  .listBuckets({ prefix: 'embeddings-' })

data?.vectorBuckets.forEach(bucket => {
  console.log(bucket.vectorBucketName)
})
```

---

## Create a vector index

`createIndex(options)`

Creates a new vector index in this bucket Convenience method that automatically includes the bucket name

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Index configuration (vectorBucketName is automatically set)
    

### Return Type

Promise<One of the following options>

```
const bucket = supabase.storage.vectors.from('embeddings-prod')
await bucket.createIndex({
  indexName: 'documents-openai',
  dataType: 'float32',
  dimension: 1536,
  distanceMetric: 'cosine',
  metadataConfiguration: {
    nonFilterableMetadataKeys: ['raw_text']
  }
})
```

---

## Delete a vector index

`deleteIndex(indexName)`

Deletes an index from this bucket Convenience method that automatically includes the bucket name

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   indexName string
    
    Name of the index to delete
    

### Return Type

Promise<One of the following options>

```
const bucket = supabase.storage.vectors.from('embeddings-prod')
await bucket.deleteIndex('old-index')
```

---

## Retrieve a vector index

`getIndex(indexName)`

Retrieves metadata for a specific index in this bucket Convenience method that automatically includes the bucket name

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   indexName string
    
    Name of the index to retrieve
    

### Return Type

Promise<One of the following options>

---

## List all vector indexes

`listIndexes(options)`

Lists indexes in this bucket Convenience method that automatically includes the bucket name

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Listing options (vectorBucketName is automatically set)
    

### Return Type

Promise<One of the following options>

```
const bucket = supabase.storage.vectors.from('embeddings-prod')
const { data } = await bucket.listIndexes({ prefix: 'documents-' })
```

---

## Access a vector index

`VectorBucketScope(indexName)`

Access operations for a specific index within this bucket Returns a scoped client for vector data operations

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   indexName string
    
    Name of the index
    

```
const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')

// Insert vectors
await index.putVectors({
  vectors: [
    { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
  ]
})

// Query similar vectors
const { data } = await index.queryVectors({
  queryVector: { float32: [...] },
  topK: 5
})
```

---

## Delete vectors from index

`deleteVectors(options)`

Deletes vectors by keys from this index Convenience method that automatically includes bucket and index names

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Deletion options (bucket and index names automatically set)
    

### Return Type

Promise<One of the following options>

```
const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
await index.deleteVectors({
  keys: ['doc-1', 'doc-2', 'doc-3']
})
```

---

## Retrieve vectors from index

`getVectors(options)`

Retrieves vectors by keys from this index Convenience method that automatically includes bucket and index names

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Vector retrieval options (bucket and index names automatically set)
    

### Return Type

Promise<One of the following options>

```
const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
const { data } = await index.getVectors({
  keys: ['doc-1', 'doc-2'],
  returnMetadata: true
})
```

---

## List vectors in index

`listVectors(options)`

Lists vectors in this index with pagination Convenience method that automatically includes bucket and index names

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Listing options (bucket and index names automatically set)
    

### Return Type

Promise<One of the following options>

```
const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
const { data } = await index.listVectors({
  maxResults: 500,
  returnMetadata: true
})
```

---

## Add vectors to index

`putVectors(options)`

Inserts or updates vectors in this index Convenience method that automatically includes bucket and index names

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Vector insertion options (bucket and index names automatically set)
    

### Return Type

Promise<One of the following options>

```
const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
await index.putVectors({
  vectors: [
    {
      key: 'doc-1',
      data: { float32: [0.1, 0.2, ...] },
      metadata: { title: 'Introduction', page: 1 }
    }
  ]
})
```

---

## Search vectors in index

`queryVectors(options)`

Queries for similar vectors in this index Convenience method that automatically includes bucket and index names

**Public alpha:** This API is part of a public alpha release and may not be available to your account type.

### Parameters

-   options Omit
    
    Query options (bucket and index names automatically set)
    

### Return Type

Promise<One of the following options>

---

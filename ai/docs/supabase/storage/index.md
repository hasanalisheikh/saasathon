## File Buckets

This section contains methods for working with File Buckets.

---

## Access a storage bucket

`from(id)`

Perform file operation in a bucket.

### Parameters

-   id string
    
    The bucket id to operate on.
    

```
const avatars = supabase.storage.from('avatars')
```

---

## List all buckets

`listBuckets(options?)`

Retrieves the details of all Storage buckets within an existing project.

-   RLS policy permissions required:
    -   `buckets` table permissions: `select`
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   options
    
    Optional
    
    ListBucketOptions
    
    Query parameters for listing buckets
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .listBuckets()
```

---

## Retrieve a bucket

`getBucket(id)`

Retrieves the details of an existing Storage bucket.

-   RLS policy permissions required:
    -   `buckets` table permissions: `select`
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   id string
    
    The unique identifier of the bucket you would like to retrieve.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .getBucket('avatars')
```

---

## Create a bucket

`createBucket(id, options)`

Creates a new Storage bucket

-   RLS policy permissions required:
    -   `buckets` table permissions: `insert`
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   id string
    
    A unique identifier for the bucket you are creating.
    
-   options object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .createBucket('avatars', {
    public: false,
    allowedMimeTypes: ['image/png'],
    fileSizeLimit: 1024
  })
```

---

## Empty a bucket

`emptyBucket(id)`

Removes all objects inside a single bucket.

-   RLS policy permissions required:
    -   `buckets` table permissions: `select`
    -   `objects` table permissions: `select` and `delete`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   id string
    
    The unique identifier of the bucket you would like to empty.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .emptyBucket('avatars')
```

---

## Update a bucket

`updateBucket(id, options)`

Updates a Storage bucket

-   RLS policy permissions required:
    -   `buckets` table permissions: `select` and `update`
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   id string
    
    A unique identifier for the bucket you are updating.
    
-   options object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .updateBucket('avatars', {
    public: false,
    allowedMimeTypes: ['image/png'],
    fileSizeLimit: 1024
  })
```

---

## Delete a bucket

`deleteBucket(id)`

Deletes an existing bucket. A bucket can't be deleted with existing objects inside it. You must first `empty()` the bucket.

-   RLS policy permissions required:
    -   `buckets` table permissions: `select` and `delete`
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   id string
    
    The unique identifier of the bucket you would like to delete.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .deleteBucket('avatars')
```

---

## Upload a file

`upload(path, fileBody, fileOptions?)`

Uploads a file to an existing bucket.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: only `insert` when you are uploading new files and `select`, `insert` and `update` when you are upserting files
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works
-   For React Native, using either `Blob`, `File` or `FormData` does not work as intended. Upload file using `ArrayBuffer` from base64 file data instead, see example below.

### Parameters

-   path string
    
    The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
    
-   fileBody FileBody
    
    The body of the file to be stored in the bucket.
    
-   fileOptions
    
    Optional
    
    FileOptions
    
    Optional file upload options including cacheControl, contentType, upsert, and metadata.
    

### Return Type

Promise<One of the following options>

```
const avatarFile = event.target.files[0]
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('public/avatar1.png', avatarFile, {
    cacheControl: '3600',
    upsert: false
  })
```

---

## Replace an existing file

`update(path, fileBody, fileOptions?)`

Replaces an existing file at the specified path with a new one.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `update` and `select`
-   `update()` always replaces the file at the given path regardless of the `upsert` option.
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works
-   For React Native, using either `Blob`, `File` or `FormData` does not work as intended. Update file using `ArrayBuffer` from base64 file data instead, see example below.

### Parameters

-   path string
    
    The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
    
-   fileBody One of the following options
    
    The body of the file to be stored in the bucket.
    
-   fileOptions
    
    Optional
    
    FileOptions
    
    Optional file upload options including cacheControl, contentType, and metadata. **Note:** The `upsert` option has no effect here. `update()` always replaces the file at the given path, so the `x-upsert` header is not sent. To control upsert behavior, use `upload()` instead.
    

### Return Type

Promise<One of the following options>

```
const avatarFile = event.target.files[0]
const { data, error } = await supabase
  .storage
  .from('avatars')
  .update('public/avatar1.png', avatarFile, {
    cacheControl: '3600'
  })
```

---

## Move an existing file

`move(fromPath, toPath, options?)`

Moves an existing file to a new path in the same bucket.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `update` and `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   fromPath string
    
    The original file path, including the current file name. For example `folder/image.png`.
    
-   toPath string
    
    The new file path, including the new file name. For example `folder/image-new.png`.
    
-   options
    
    Optional
    
    DestinationOptions
    
    The destination options.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .move('public/avatar1.png', 'private/avatar2.png')
```

---

## Copy an existing file

`copy(fromPath, toPath, options?)`

Copies an existing file to a new path in the same bucket.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `insert` and `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   fromPath string
    
    The original file path, including the current file name. For example `folder/image.png`.
    
-   toPath string
    
    The new file path, including the new file name. For example `folder/image-copy.png`.
    
-   options
    
    Optional
    
    DestinationOptions
    
    The destination options.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .copy('public/avatar1.png', 'private/avatar2.png')
```

---

## Create a signed URL

`createSignedUrl(path, expiresIn, options?)`

Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   path string
    
    The file path, including the current file name. For example `folder/image.png`.
    
-   expiresIn number
    
    The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
    
-   options
    
    Optional
    
    object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUrl('folder/avatar1.png', 60)
```

---

## Create signed URLs

`createSignedUrls(paths, expiresIn, options?)`

Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   paths Array<string>
    
    The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
    
-   expiresIn number
    
    The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
    
-   options
    
    Optional
    
    object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
```

---

## Create signed upload URL

`createSignedUploadUrl(path, options?)`

Creates a signed upload URL. Signed upload URLs can be used to upload files to the bucket without further authentication. They are valid for 2 hours.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `insert`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   path string
    
    The file path, including the current file name. For example `folder/image.png`.
    
-   options
    
    Optional
    
    object
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUploadUrl('folder/cat.jpg')
```

---

## Upload to a signed URL

`uploadToSignedUrl(path, token, fileBody, fileOptions?)`

Upload a file with a token generated from `createSignedUploadUrl`.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   path string
    
    The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
    
-   token string
    
    The token generated from `createSignedUploadUrl`
    
-   fileBody FileBody
    
    The body of the file to be stored in the bucket.
    
-   fileOptions
    
    Optional
    
    FileOptions
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
```

---

## Retrieve public URL

`getPublicUrl(path, options?)`

A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset. This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.

-   The bucket needs to be set to public, either via [updateBucket()](/docs/reference/javascript/storage-updatebucket) or by going to Storage on [supabase.com/dashboard](https://supabase.com/dashboard), clicking the overflow menu on a bucket and choosing "Make public"
-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: none
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   path string
    
    The path and name of the file to generate the public URL for. For example `folder/image.png`.
    
-   options
    
    Optional
    
    object
    

### Return Type

object

```
const { data } = supabase
  .storage
  .from('public-bucket')
  .getPublicUrl('folder/avatar1.png')
```

---

## Download a file

`download(path, options?, parameters?)`

Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   path string
    
    The full path and file name of the file to be downloaded. For example `folder/image.png`.
    
-   options
    
    Optional
    
    Options
    
-   parameters
    
    Optional
    
    FetchParameters
    
    Additional fetch parameters like signal for cancellation. Supports standard fetch options including cache control.
    

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .download('folder/avatar1.png')
```

---

## Delete files in a bucket

`remove(paths)`

Deletes files within the same bucket

Returns an array of FileObject entries for the deleted files. Note that deprecated fields like `bucket_id` may or may not be present in the response - do not rely on them.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `delete` and `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   paths Array<string>
    
    An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .remove(['folder/avatar1.png'])
```

---

## List all files in a bucket

`list(path?, options?, parameters?)`

Lists all the files and folders within a path of the bucket.

**Important:** For folder entries, fields like `id`, `updated_at`, `created_at`, `last_accessed_at`, and `metadata` will be `null`. Only files have these fields populated. Additionally, deprecated fields like `bucket_id`, `owner`, and `buckets` are NOT returned by this method.

-   RLS policy permissions required:
    -   `buckets` table permissions: none
    -   `objects` table permissions: `select`
-   Refer to the [Storage guide](/docs/guides/storage/security/access-control) on how access control works

### Parameters

-   path
    
    Optional
    
    string
    
    The folder path.
    
-   options
    
    Optional
    
    SearchOptions
    
    Search options including limit (defaults to 100), offset, sortBy, and search
    
-   parameters
    
    Optional
    
    FetchParameters
    
    Optional fetch parameters including signal for cancellation
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })

// Handle files vs folders
data?.forEach(item => {
  if (item.id !== null) {
    // It's a file
    console.log('File:', item.name, 'Size:', item.metadata?.size)
  } else {
    // It's a folder
    console.log('Folder:', item.name)
  }
})
```

---

## Check if file exists

`exists(path)`

Checks the existence of a file.

### Parameters

-   path string
    
    The file path, including the file name. For example `folder/image.png`.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .exists('folder/avatar1.png')
```

---

## Get file metadata

`info(path)`

Retrieves the details of an existing file.

Returns detailed file metadata including size, content type, and timestamps. Note: The API returns `last_modified` field, not `updated_at`.

### Parameters

-   path string
    
    The file path, including the file name. For example `folder/image.png`.
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .info('folder/avatar1.png')

if (data) {
  console.log('Last modified:', data.lastModified)
  console.log('Size:', data.size)
}
```

---

## List files (v2)

`listV2(options?, parameters?)`

Lists all the files and folders within a bucket using the V2 API with pagination support.

**Important:** Folder entries in the `folders` array only contain `name` and optionally `key` — they have no `id`, timestamps, or `metadata` fields. Full file metadata is only available on entries in the `objects` array.

this method signature might change in the future

### Parameters

-   options
    
    Optional
    
    SearchV2Options
    
    Search options including prefix, cursor for pagination, limit, with_delimiter
    
-   parameters
    
    Optional
    
    FetchParameters
    
    Optional fetch parameters including signal for cancellation
    

### Return Type

Promise<One of the following options>

```
const { data, error } = await supabase
  .storage
  .from('avatars')
  .listV2({
    prefix: 'folder/',
    limit: 100,
  })

// Handle pagination
if (data?.hasNext) {
  const nextPage = await supabase
    .storage
    .from('avatars')
    .listV2({
      prefix: 'folder/',
      cursor: data.nextCursor,
    })
}

// Handle files vs folders
data?.objects.forEach(file => {
  if (file.id !== null) {
    console.log('File:', file.name, 'Size:', file.metadata?.size)
  }
})
data?.folders.forEach(folder => {
  console.log('Folder:', folder.name)
})
```

---

## Convert file to base64

`toBase64(data)`

### Parameters

-   data string
    

### Return Type

string

---

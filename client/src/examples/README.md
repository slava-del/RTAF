# API Client Usage Guide

This document provides information on how to use the enhanced API client for making HTTP requests in the RTA (Report Transfer Application).

## Quick Reference

```typescript
import { apiClient, api } from "@/lib/queryClient";

// Simple GET request
const users = await apiClient.get('/api/users');

// POST with data
const newUser = await apiClient.post('/api/users', {
  username: 'newuser',
  email: 'user@example.com'
});

// PATCH request to update
const updatedUser = await apiClient.patch('/api/users/123', {
  email: 'newemail@example.com'
});

// DELETE request
await apiClient.delete('/api/users/123');
```

## API Client Methods

The `apiClient` object provides convenient methods for all common HTTP operations:

### GET Requests

```typescript
// Simple GET
const user = await apiClient.get('/api/users/123');

// GET with query parameters
const filteredUsers = await apiClient.get('/api/users', {
  role: 'admin',
  active: true,
  limit: 10
});
```

### POST Requests

```typescript
// Create a new resource
const newResource = await apiClient.post('/api/resources', {
  name: 'New Resource',
  description: 'This is a new resource'
});
```

### PATCH Requests

```typescript
// Update part of a resource
const patchedResource = await apiClient.patch('/api/resources/123', {
  description: 'Updated description'
});
```

### PUT Requests

```typescript
// Replace a resource entirely
const replacedResource = await apiClient.put('/api/resources/123', {
  name: 'Completely New Name',
  description: 'Completely new description',
  active: true
});
```

### DELETE Requests

```typescript
// Delete a resource
await apiClient.delete('/api/resources/123');

// Delete with body data (if needed)
await apiClient.delete('/api/resources/batch', {
  ids: [1, 2, 3, 4]
});
```

## Error Handling

The API client automatically throws errors for non-successful HTTP responses, so you can use try/catch to handle errors:

```typescript
try {
  const resource = await apiClient.get('/api/non-existent-resource');
} catch (error) {
  console.error('API request failed:', error);
  // Handle the error appropriately
}
```

## Advanced Usage

For more complex scenarios, you can use the lower-level `api` function:

```typescript
import { api } from "@/lib/queryClient";

// GET with custom headers
const response = await api('/api/resources', {
  method: 'GET',
  headers: {
    'Cache-Control': 'no-cache',
    'Authorization': 'Bearer custom-token'
  }
});

// Get the raw Response object
const rawResponse = await api('/api/files/download', {
  method: 'GET',
  returnRaw: true
});

// Work with binary data
if (rawResponse instanceof Response) {
  const blob = await rawResponse.blob();
  // Process the blob...
}
```

## Using with React Query

When using with React Query, you can use the API client in your query and mutation functions:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@/lib/queryClient';

// Query example
function useUsers() {
  return useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiClient.get('/api/users')
  });
}

// Mutation example
function useCreateUser() {
  return useMutation({
    mutationFn: (userData) => apiClient.post('/api/users', userData),
    onSuccess: () => {
      // Invalidate the users query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });
}
```

## Type Safety

The API client supports TypeScript generics for better type safety:

```typescript
interface User {
  id: number;
  username: string;
  email: string;
}

// Specify the return type
const user = await apiClient.get<User>('/api/users/123');
console.log(user.username); // TypeScript knows this is a string
```
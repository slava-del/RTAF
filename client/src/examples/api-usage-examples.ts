// This file contains examples of how to use our API client
// It's not meant to be imported or used directly in the application

import { apiClient, api } from "@/lib/queryClient";
import { User, Order, Document } from "@shared/schema";

/**
 * Examples using the apiClient object (recommended approach)
 */
async function apiClientExamples() {
  // GET request examples
  
  // Simple GET
  const currentUser: User = await apiClient.get('/api/user');
  
  // GET with query parameters
  const filteredOrders: Order[] = await apiClient.get('/api/orders', {
    status: 'completed',
    limit: 10
  });
  
  // POST request examples
  
  // Creating a new user
  const newUser: User = await apiClient.post('/api/register', {
    username: 'new_user',
    password: 'secure_password',
    fullName: 'New User',
    company: 'Example Corp'
  });
  
  // Login
  const loggedInUser: User = await apiClient.post('/api/login', {
    username: 'existing_user',
    password: 'user_password'
  });
  
  // PATCH request example
  
  // Update order status
  const updatedOrder: Order = await apiClient.patch(`/api/orders/5/status`, {
    status: 'completed'
  });
  
  // PUT request example
  
  // Update document
  const updatedDocument: Document = await apiClient.put(`/api/documents/10`, {
    name: 'Updated Document Name',
    description: 'New description for this document'
  });
  
  // DELETE request example
  
  // Delete a document
  await apiClient.delete(`/api/documents/3`);
  
  // Error handling
  try {
    const nonExistentResource = await apiClient.get('/api/non-existent');
  } catch (error) {
    console.error('API request failed:', error);
  }
}

/**
 * Examples using the lower-level api function
 */
async function apiLowLevelExamples() {
  // GET request with custom headers
  const orders = await api<Order[]>('/api/orders', {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  
  // POST with custom options
  const result = await api('/api/documents/process', {
    method: 'POST',
    data: { documentId: 123 },
    credentials: 'same-origin', // Override the default 'include'
  });
  
  // Get raw response
  const response = await api<Response>('/api/download/document/5', {
    method: 'GET',
    returnRaw: true
  });
  
  // Work with the blob data
  if (response instanceof Response) {
    const blob = await response.blob();
    // ... process blob data
  }
}

// Note: This file only contains examples and is not meant to be executed
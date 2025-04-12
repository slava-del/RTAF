// This file contains examples of how to use the API client with React Query
// It's not meant to be imported or used directly in the application

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, queryClient } from '@/lib/queryClient';
import { User, Order, Document, InsertUser } from '@shared/schema';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example 1: Basic data fetching with useQuery
function UsersList() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/users'],
    // Using the apiClient directly in the queryFn
    queryFn: () => apiClient.get('/api/users')
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {(error as Error).message}</div>;

  return (
    <div>
      <h2>Users List</h2>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 2: Advanced data fetching with parameters
function FilterableOrdersList() {
  const [status, setStatus] = useState<string>('all');
  
  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/orders', { status: status !== 'all' ? status : undefined }],
    queryFn: ({ queryKey }) => {
      // Access the filter parameters from the queryKey
      const [url, params] = queryKey;
      return apiClient.get(url as string, params as Record<string, any>);
    }
  });

  return (
    <div>
      <div>
        <Button onClick={() => setStatus('all')}>All</Button>
        <Button onClick={() => setStatus('pending')}>Pending</Button>
        <Button onClick={() => setStatus('completed')}>Completed</Button>
      </div>
      <ul>
        {orders?.map(order => (
          <li key={order.id}>
            Order {order.orderId} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example 3: Creating data with useMutation
function CreateUserForm() {
  const [formData, setFormData] = useState<Partial<InsertUser>>({
    username: '',
    password: '',
    fullName: '',
    company: ''
  });

  const createUser = useMutation({
    mutationFn: (userData: Partial<InsertUser>) => 
      apiClient.post<User>('/api/register', userData),
    onSuccess: () => {
      // Invalidate the users query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      // Reset form
      setFormData({
        username: '',
        password: '',
        fullName: '',
        company: ''
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Form fields would go here */}
          <Button 
            type="submit" 
            disabled={createUser.isPending}
          >
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
          
          {createUser.isError && (
            <div className="text-red-500 mt-2">
              Error: {(createUser.error as Error).message}
            </div>
          )}
          
          {createUser.isSuccess && (
            <div className="text-green-500 mt-2">
              User created successfully!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// Example 4: Updating data with useMutation
function UpdateOrderStatus({ orderId }: { orderId: number }) {
  const updateStatus = useMutation({
    mutationFn: (status: string) => 
      apiClient.patch<Order>(`/api/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      // Also invalidate specific order query
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
    }
  });

  return (
    <div>
      <Button 
        onClick={() => updateStatus.mutate('processing')}
        disabled={updateStatus.isPending}
      >
        Mark as Processing
      </Button>
      <Button 
        onClick={() => updateStatus.mutate('completed')}
        disabled={updateStatus.isPending}
      >
        Mark as Completed
      </Button>
      
      {updateStatus.isSuccess && <div>Status updated!</div>}
    </div>
  );
}

// Example 5: Optimistic Updates
function DocumentList() {
  const { data: documents } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    queryFn: () => apiClient.get('/api/documents')
  });

  const deleteDocument = useMutation({
    mutationFn: (documentId: number) => 
      apiClient.delete(`/api/documents/${documentId}`),
    
    // Optimistically update the UI before the server responds
    onMutate: async (documentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/documents'] });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData<Document[]>(['/api/documents']);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Document[]>(['/api/documents'], old => 
        old ? old.filter(doc => doc.id !== documentId) : []
      );
      
      // Return a context object with the snapshot
      return { previousDocuments };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['/api/documents'], 
        context?.previousDocuments
      );
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });

  return (
    <div>
      <h2>Documents</h2>
      <ul>
        {documents?.map(doc => (
          <li key={doc.id}>
            {doc.name}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteDocument.mutate(doc.id)}
              disabled={deleteDocument.isPending}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Note: This file only contains examples and is not meant to be imported or used directly
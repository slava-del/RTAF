import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Checks if a response is OK and throws an error if not
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Legacy apiRequest function for compatibility with existing code
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * HTTP methods supported by our API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Options for the API client
 */
export type ApiOptions = {
  method?: HttpMethod;
  data?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  returnRaw?: boolean;
};

/**
 * A general method for making API calls with JSON data
 * @param url - The URL to send the request to
 * @param options - Request options including method, data, headers, etc.
 * @returns Promise with the response data
 */
export async function api<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    data,
    headers = {},
    credentials = 'include',
    returnRaw = false
  } = options;

  // Set default headers for JSON requests
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(data && method !== 'GET' ? { 'Content-Type': 'application/json' } : {})
  };

  const requestHeaders = { ...defaultHeaders, ...headers };
  
  // Handle GET requests with query parameters
  let requestUrl = url;
  if (method === 'GET' && data) {
    const queryParams = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      requestUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    credentials,
    body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
  };

  const res = await fetch(requestUrl, requestInit);
  
  // Handle errors
  await throwIfResNotOk(res);
  
  // Return raw response if requested
  if (returnRaw) {
    return res as unknown as T;
  }
  
  // Check content type to determine how to parse
  const contentType = res.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return await res.json();
  } else if (contentType?.includes('text/')) {
    return await res.text() as unknown as T;
  } else {
    // For other content types, return the response object
    return res as unknown as T;
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const apiClient = {
  get: <T = any>(url: string, data?: any, options: Omit<ApiOptions, 'method' | 'data'> = {}) => 
    api<T>(url, { ...options, method: 'GET', data }),
    
  post: <T = any>(url: string, data?: any, options: Omit<ApiOptions, 'method' | 'data'> = {}) => 
    api<T>(url, { ...options, method: 'POST', data }),
    
  put: <T = any>(url: string, data?: any, options: Omit<ApiOptions, 'method' | 'data'> = {}) => 
    api<T>(url, { ...options, method: 'PUT', data }),
    
  patch: <T = any>(url: string, data?: any, options: Omit<ApiOptions, 'method' | 'data'> = {}) => 
    api<T>(url, { ...options, method: 'PATCH', data }),
    
  delete: <T = any>(url: string, data?: any, options: Omit<ApiOptions, 'method' | 'data'> = {}) => 
    api<T>(url, { ...options, method: 'DELETE', data })
};

/**
 * Type for handling 401 Unauthorized responses
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function with specific behavior for 401 errors
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * QueryClient instance for React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
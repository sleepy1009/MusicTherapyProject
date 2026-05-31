import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      window.dispatchEvent(new CustomEvent('globalApiError', { detail: error }));
    }
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      window.dispatchEvent(new CustomEvent('globalApiError', { detail: error }));
    }
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
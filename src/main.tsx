import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MantineProvider, createTheme } from '@mantine/core';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  components: {
    Modal: {
      defaultProps: {
        zIndex: 9999, // Ensures modal is always on top
        centered: false, // Centers the modal        
        blur: 3,
      },
      styles: (theme: any) => ({
        modal: {
          backgroundColor: theme.colors.dark[7], // Custom modal background
          borderRadius: "10px", // Rounded corners
          padding: "20px",
        },
      }),
    },
    TextInput: {
      styles: {
        input: {
          fontSize: 'small',
        },
      },
    },
    Select: {
      styles: {
        input: {
          fontSize: 'small',
        },
      },
    },
    Checkbox: {
      styles: {
        input: {
          fontSize: 'small',
        },
      },
    },
  },
});

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Notifications position="top-right" />
            <App />          
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>    
  </StrictMode>,
)

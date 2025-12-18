import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
// import './index.css';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load Toaster since it's not needed for initial render (improves FCP)
const LazyToaster = lazy(() => import('sonner').then((module) => ({ default: module.Toaster })));

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary fallbackRender={({ error }: { error: Error }) => <p>Error: {error.message}</p>}>
      <Suspense fallback={null}>
        <LazyToaster position="top-right" richColors />
      </Suspense>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

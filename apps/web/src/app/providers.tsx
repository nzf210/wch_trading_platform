import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';

import { useAuthStore } from '../store/authStore';

export function Providers({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

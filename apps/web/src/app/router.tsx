import { AppLayout } from './layout';
import { Dashboard } from '../pages/Dashboard';

export function AppRouter() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LabList from '../organisms/LabList';

const queryClient = new QueryClient();

test('renders loading state', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <LabList />
    </QueryClientProvider>
  );
  expect(screen.getByText(/loading labs/i)).toBeInTheDocument();
});

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BoxList from './pages/BoxList'
import BoxDetail from './pages/BoxDetail'
import ItemDetail from './pages/ItemDetail'
import Search from './pages/Search'
import Checkouts from './pages/Checkouts'
import Settings from './pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/boxes" replace />} />
          <Route path="/boxes" element={<BoxList />} />
          <Route path="/boxes/:id" element={<BoxDetail />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/checkouts" element={<Checkouts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from '@/components/app-layout'
import { ApiProvider, AuthProvider, useAuth } from '@/context/api'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Home from '@/pages/Home'

function RequireGuest({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (token) {
    return <Navigate to="/" replace />
  }
  return children
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/auth/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <AuthProvider>
          <Routes>
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="/auth/login" element={<RequireGuest><Login /></RequireGuest>} />
            <Route path="/auth/register" element={<RequireGuest><Register /></RequireGuest>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ApiProvider>
    </BrowserRouter>
  )
}

export default App
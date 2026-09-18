import { useContext } from 'react'

import { ApiContext, AuthContext } from '../contexts'
import type { ApiContextValue, AuthContextValue } from '../contexts'

export function useApi(): ApiContextValue {
  const ctx = useContext(ApiContext)
  if (!ctx) {
    throw new Error('useApi deve ser usado dentro de <ApiProvider>.')
  }
  return ctx
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  }
  return ctx
}
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ApiContext, AuthContext } from '../contexts'
import type {
  ApiContextValue,
  AuthContextValue,
  LoginInput,
  LoginResult,
  PublicUser,
  RegisterInput,
} from '../contexts'
import { ApiError } from './errors'
import { useApi } from './hooks'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
const TOKEN_STORAGE_KEY = 'vel_token'
const USER_STORAGE_KEY = 'vel_user'

export function ApiProvider({ children }: { children: ReactNode }) {
  const [baseUrl] = useState(API_BASE_URL)
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  )

  const setToken = useCallback((next: string | null) => {
    setTokenState(next)
    if (next) {
      localStorage.setItem(TOKEN_STORAGE_KEY, next)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [])

  const request = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const headers = new Headers(init.headers)
      if (!headers.has('Content-Type') && init.body) {
        headers.set('Content-Type', 'application/json')
      }
      const t = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (t) {
        headers.set('Authorization', `Bearer ${t}`)
      }

      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
      })

      const body = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null

      if (!response.ok) {
        const message = Array.isArray(body?.message)
          ? body!.message.join('\n')
          : body?.message
        throw new ApiError(response.status, message ?? 'Erro inesperado.')
      }

      return body as T
    },
    [baseUrl],
  )

  const value = useMemo(
    () => ({ baseUrl, token, setToken, request } satisfies ApiContextValue),
    [baseUrl, token, setToken, request],
  )

  return <ApiContext value={value}>{children}</ApiContext>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { request, setToken, token } = useApi()
  const [user, setUser] = useState<PublicUser | null>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as PublicUser
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(
    async (input: LoginInput): Promise<LoginResult> => {
      setLoading(true)
      try {
        const result = await request<LoginResult>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        setToken(result.token)
        setUser(result.user)
        return result
      } finally {
        setLoading(false)
      }
    },
    [request, setToken],
  )

  const register = useCallback(
    async (input: RegisterInput): Promise<PublicUser> => {
      setLoading(true)
      try {
        return await request<PublicUser>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        })
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [setToken])

  const value = useMemo(
    () =>
      ({ user, token, loading, login, register, logout }) satisfies AuthContextValue,
    [user, token, loading, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
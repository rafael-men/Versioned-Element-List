import { createContext } from 'react'

export interface PublicUser {
  id: number
  email: string
  createdAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  user: PublicUser
}

export interface ApiContextValue {
  baseUrl: string
  token: string | null
  setToken: (token: string | null) => void
  request: <T>(path: string, init?: RequestInit) => Promise<T>
}

export const ApiContext = createContext<ApiContextValue | null>(null)

export interface AuthContextValue {
  user: PublicUser | null
  token: string | null
  loading: boolean
  login: (input: LoginInput) => Promise<LoginResult>
  register: (input: RegisterInput) => Promise<PublicUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
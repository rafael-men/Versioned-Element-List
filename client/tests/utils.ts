export function randomEmail(): string {
  return `cypress-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@teste.com`
}

export function randomPassword(): string {
  return `Senha${Date.now()}${Math.random().toString(36).slice(2, 8)}`
}
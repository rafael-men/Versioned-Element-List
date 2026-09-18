import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/api'

function Register() {
   const navigate = useNavigate()
   const { register, loading } = useAuth()

   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')
   const [error, setError] = useState<string | null>(null)

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)

      if (password !== confirmPassword) {
         setError('As senhas não coincidem.')
         return
      }

      try {
         await register({ email, password })
         navigate('/auth/login', { state: { registered: true } })
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
      }
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-black to-gray-500 px-4 py-8">
         <Card className="w-full max-w-sm bg-white text-black">
            <CardHeader>
               <CardTitle className="text-xl">Criar conta</CardTitle>
               <CardDescription>
                  Cadastre-se para começar a usar listas versionadas.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="email">E-mail</Label>
                     <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="voce@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="password">Senha</Label>
                     <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Mínimo 6 caracteres, com número e maiúscula"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                     />
                     <p className="text-xs text-muted-foreground">
                        A senha deve ter ao menos 6 caracteres, um número e uma letra maiúscula.
                     </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="confirm-password">Confirmar senha</Label>
                     <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                     />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" size="lg" disabled={loading}>
                     {loading && <Loader2 className="animate-spin" />}
                     {loading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
               </form>

               <p className="mt-4 text-center text-sm text-muted-foreground">
                  Já tem conta?{' '}
                  <Link to="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                     Entrar
                  </Link>
               </p>
            </CardContent>
         </Card>
      </div>
   )
}

export default Register
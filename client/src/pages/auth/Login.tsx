import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/api'

function Login() {
   const navigate = useNavigate()
   const { login, loading } = useAuth()

   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [showPassword, setShowPassword] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)

      try {
         await login({ email, password })
         navigate('/')
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      }
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-black to-gray-500 px-4 py-8">
         <Card className="w-full max-w-sm bg-white text-black">
            <CardHeader>
               <CardTitle className="text-xl">Entrar</CardTitle>
               <CardDescription>
                  Acesse sua conta para gerenciar suas listas versionadas.
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
                     <div className="relative">
                        <Input
                           id="password"
                           type={showPassword ? 'text' : 'password'}
                           autoComplete="current-password"
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                        />
                        <button
                           type="button"
                           aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                           onClick={() => setShowPassword((v) => !v)}
                           className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                           {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                     </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" size="lg" disabled={loading}>
                     {loading && <Loader2 className="animate-spin" />}
                     {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
               </form>

               <p className="mt-4 text-center text-sm text-muted-foreground">
                  Ainda não tem conta?{' '}
                  <Link to="/auth/register" className="font-medium text-primary underline-offset-4 hover:underline">
                     Cadastre-se
                  </Link>
               </p>
            </CardContent>
         </Card>
      </div>
   )
}

export default Login
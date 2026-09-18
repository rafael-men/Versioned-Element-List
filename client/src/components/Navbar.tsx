import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/api'

function Navbar() {
   const { logout } = useAuth()

   return (
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
         <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3">
            <Link
               to="/"
               className="flex min-w-0 items-center gap-2 text-white"
               aria-label="Listas Versionadas"
            >
               <span className="truncate text-sm font-semibold sm:text-base">
                  Listas Versionadas
               </span>
            </Link>


            <Button
               variant="ghost"
               size="sm"
               onClick={logout}
               className="text-white hover:bg-white/10 hover:text-white"
            >
               <LogOut />
               Sair
            </Button>

         </div>
      </header>
   )
}

export default Navbar
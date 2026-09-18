import { ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#000_0%,#050607_28%,#1f2329_48%,#59616e_100%)] text-white">
      <header className="h-12 border-b border-zinc-800 bg-black">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold">
            Listas Versionadas
          </h1>

          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-white transition-opacity hover:opacity-70"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-48px)] items-center justify-center px-4 pb-28">
        <div className="w-full max-w-xl text-center">
          <span className="block text-[110px] font-bold leading-none tracking-[-6px] text-white max-sm:text-7xl">
            404
          </span>

          <h2 className="mt-5 text-3xl font-semibold max-sm:text-2xl">
            Página não encontrada
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
            A página que você está procurando não existe, foi removida ou teve
            seu endereço alterado.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200"
          >
            <ArrowLeft size={18} />
            Voltar para minhas listas
          </Link>
        </div>
      </main>
    </div>
  );
}
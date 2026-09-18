import { Outlet } from 'react-router-dom'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-black to-gray-500">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
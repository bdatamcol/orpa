"use client"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Perfil() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nombre, setNombre] = useState("Usuario") // Valor por defecto
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        router.push("/") // Si no hay usuario, redirigir
        return
      }

      setUser(data.user)
      console.log("Usuario autenticado:", data.user)

      // Obtener la cédula desde la sesión de Supabase
      const cedula = data.user.user_metadata?.cedula
      console.log("Buscando usuario con cédula:", cedula)

      if (cedula) {
        fetchUserName(cedula)
      } else {
        console.warn("⚠ No se encontró cédula en la sesión del usuario")
      }
    }

    const fetchUserName = async (cedula: string) => {
      console.log("Buscando usuario con cédula en la base de datos:", cedula)

      const { data, error } = await supabase
        .from("usuarios")
        .select("nombre1")
        .eq("cedula", cedula)
        .single()

      if (error || !data) {
        console.warn("⚠ No se encontró nombre para la cédula:", cedula)
        return
      }

      console.log("Nombre obtenido:", data.nombre1)
      setNombre(capitalizeFirstLetter(data.nombre1)) // Aplicamos formato
    }

    fetchUser()
  }, [router])

  // ✅ **Función para convertir solo la primera letra en mayúscula**
  const capitalizeFirstLetter = (text: string) => {
    if (!text) return "Usuario"
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center px-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="ml-4 text-xl font-semibold">Perfil de Usuario</h1>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center lg:justify-start">
            <h2 className="text-xl font-bold">Menú</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-700 rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a href="#" className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">Inicio</a>
              <a href="#" className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors">Configuración</a>
            </div>
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={`pt-16 lg:pt-0 lg:ml-64`}>
        <div className="p-4">
          <div className="max-w-[95%] mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 hidden lg:block">Perfil de Usuario</h1>
            {user ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-xl text-gray-700">
                  Hola, <span className="font-semibold">{nombre}</span>
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-pulse text-gray-600">Cargando...</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

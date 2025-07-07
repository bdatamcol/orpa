"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function Perfil() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState({
    nombre1: "",
    nombre2: "",
    apellido1: "",
    apellido2: "",
    cedula: "",
    correo: "",
    telefono: "",
    imagen_perfil: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
          router.push("/")
          return
        }

        setUser(data.user)
        const cedula = data.user.user_metadata?.cedula

        if (cedula) {
          await fetchUserDetails(cedula)
        } else {
          setError("No se encontró cédula en la sesión del usuario")
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchUserDetails = async (cedula: string) => {
      const { data, error } = await supabase.from("usuarios").select("*").eq("cedula", cedula).single()

      if (error || !data) {
        setError("No se encontraron detalles para la cédula proporcionada")
        return
      }

      setUserDetails(data)
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("usuarios").update(userDetails).eq("cedula", userDetails.cedula)

      if (error) {
        throw new Error(error.message)
      } else {
        setIsEditing(false)
        // Mostrar notificación de éxito
        alert("Datos actualizados correctamente.")
      }
    } catch (err: any) {
      alert("Error al actualizar los datos. Por favor, intente de nuevo.")
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#f8c327] border-r-[#f8c327] border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f6]">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-[#f8c327] text-black font-medium rounded-full hover:bg-[#fad64f]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Header para móviles */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center px-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#000000] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center lg:justify-start">
            <h2 className="text-xl font-bold">Menú</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-700 rounded-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a
                href="/perfil"
                className="flex items-center font-semibold px-4 py-2 rounded-2xl bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Perfil
              </a>
              <a
                href="/creditos"
                className="flex items-center font-semibold px-4 py-2 rounded-2xl hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Mis créditos
              </a>
              <a
                href="/reportes"
                className="flex items-center font-semibold px-4 py-2 rounded-2xl hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Reportar Falla
              </a>
            </div>
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-[#f8c327] text-black font-bold py-2 px-4 hover:bg-[#fad64f] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <main className="pt-16 lg:pt-0 lg:ml-64">
        <div className="p-4 md:p-6">
          <div className="max-w-[90%] mx-auto">
            <div className="mb-6 flex items-center text-sm text-gray-500">
              <a href="/" className="hover:text-gray-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </a>
              <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <a href="/perfil" className="hover:text-gray-700">
                Perfil
              </a>
            </div>

            {/* Tarjeta de perfil */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Cabecera del perfil */}
              <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-6 text-white">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  <div className="relative mb-4 md:mb-0 md:mr-6">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white overflow-hidden">
                      <Image
                        src={userDetails.imagen_perfil || "/img/Avatar-perfil.webp"}
                        alt="Foto de perfil"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    </div>

                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">
                      {userDetails.nombre1} {userDetails.apellido1}
                    </h2>
                    <p className="text-gray-300 mt-1">{userDetails.correo}</p>
                    <p className="text-gray-300 mt-1">Cédula: {userDetails.cedula}</p>
                  </div>
                </div>
              </div>

              {/* Contenido del perfil */}
              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-[#f8c327]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nombre1" className="block text-sm font-medium text-gray-700 mb-1">
                            Primer Nombre
                          </label>
                          <input
                            id="nombre1"
                            name="nombre1"
                            value={userDetails.nombre1}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327]"
                          />
                        </div>
                        <div>
                          <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700 mb-1">
                            Primer Apellido
                          </label>
                          <input
                            id="apellido1"
                            name="apellido1"
                            value={userDetails.apellido1}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-[#f8c327]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Información de Contacto
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Cédula
                          </label>
                          <input
                            id="cedula"
                            name="cedula"
                            value={userDetails.cedula}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            disabled
                          />
                        </div>
                        <div>
                          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico
                          </label>
                          <input
                            id="correo"
                            name="correo"
                            type="email"
                            value={userDetails.correo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327]"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Teléfono
                          </label>
                          <input
                            id="telefono"
                            name="telefono"
                            value={userDetails.telefono}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#f8c327] text-black rounded-2xl hover:bg-[#fad64f] font-medium"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-[#f8c327]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Primer Nombre</p>
                          <p className="font-medium">{userDetails.nombre1 || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Primer Apellido</p>
                          <p className="font-medium">{userDetails.apellido1 || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-[#f8c327]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Información de Contacto
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Número de Cédula</p>
                          <p className="font-medium">{userDetails.cedula || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Correo Electrónico</p>
                          <p className="font-medium">{userDetails.correo || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Número de Teléfono</p>
                          <p className="font-medium">{userDetails.telefono || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-[#f8c327] text-black rounded-2xl hover:bg-[#fad64f] font-medium flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Editar Perfil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


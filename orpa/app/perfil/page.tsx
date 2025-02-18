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
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        router.push("/")
        return
      }

      setUser(data.user)
      const cedula = data.user.user_metadata?.cedula

      if (cedula) {
        fetchUserDetails(cedula)
      } else {
        console.warn("⚠ No se encontró cédula en la sesión del usuario")
      }
    }

    const fetchUserDetails = async (cedula: string) => {
      const { data, error } = await supabase.from("usuarios").select("*").eq("cedula", cedula).single()

      if (error || !data) {
        console.warn("⚠ No se encontraron detalles para la cédula:", cedula)
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
    const { error } = await supabase.from("usuarios").update(userDetails).eq("cedula", userDetails.cedula)

    if (error) {
      console.error("Error updating user details:", error)
      alert("Error al actualizar los datos. Por favor, intente de nuevo.")
    } else {
      setIsEditing(false)
      alert("Datos actualizados correctamente.")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${userDetails.cedula}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("profile-images").upload(filePath, file)

    if (uploadError) {
      alert("Error uploading image")
    } else {
      const { data } = supabase.storage.from("profile-images").getPublicUrl(filePath)
      setUserDetails({ ...userDetails, imagen_perfil: data.publicUrl })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-indigo-800 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center lg:justify-start">
            <h2 className="text-xl font-bold">Menú</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-indigo-700 rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a href="/perfil" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
                Inicio
              </a>
              <a href="/creditos" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
                Mis créditos
              </a>
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
          <div className="max-w-4xl mx-auto">
            {/* Remove this line */}
            {/* <h1 className="text-3xl font-bold text-indigo-800 mb-6 hidden lg:block">Perfil de Usuario</h1> */}
            <div className="mb-6 flex items-center text-sm text-gray-500">
              <a href="/" className="hover:text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </a>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <a href="/perfil" className="hover:text-gray-700">
                Perfil
              </a>
            </div>
            {user ? (
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 md:h-48"></div>
                <div className="relative px-4 py-6 sm:px-6 lg:px-8">
                  <div className="absolute -mt-24 sm:-mt-32 flex justify-center w-full left-0">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                      <Image
                        src={userDetails.imagen_perfil || "/avatar.svg"}
                        alt="Foto de perfil"
                        width={160}
                        height={160}
                        className="rounded-full border-4 border-white shadow-lg object-cover"
                      />
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="mt-16 sm:mt-24 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {userDetails.nombre1} {userDetails.apellido1}
                    </h2>
                    <p className="text-indigo-600 mt-1">{userDetails.correo}</p>
                  </div>
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="nombre1" className="block text-sm font-medium text-gray-700">
                              Primer Nombre
                            </label>
                            <input
                              id="nombre1"
                              name="nombre1"
                              value={userDetails.nombre1}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="nombre2" className="block text-sm font-medium text-gray-700">
                              Segundo Nombre
                            </label>
                            <input
                              id="nombre2"
                              name="nombre2"
                              value={userDetails.nombre2}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700">
                              Primer Apellido
                            </label>
                            <input
                              id="apellido1"
                              name="apellido1"
                              value={userDetails.apellido1}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="apellido2" className="block text-sm font-medium text-gray-700">
                              Segundo Apellido
                            </label>
                            <input
                              id="apellido2"
                              name="apellido2"
                              value={userDetails.apellido2}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                              Número de Cédula
                            </label>
                            <input
                              id="cedula"
                              name="cedula"
                              value={userDetails.cedula}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
                              disabled
                            />
                          </div>
                          <div>
                            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                              Correo Electrónico
                            </label>
                            <input
                              id="correo"
                              name="correo"
                              type="email"
                              value={userDetails.correo}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                              Número de Teléfono
                            </label>
                            <input
                              id="telefono"
                              name="telefono"
                              value={userDetails.telefono}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={handleEditToggle}
                            className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Primer Nombre</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.nombre1}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Segundo Nombre</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.nombre2 || "N/A"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Primer Apellido</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.apellido1}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Segundo Apellido</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.apellido2 || "N/A"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Número de Cédula</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.cedula}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.correo}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Número de Teléfono</dt>
                            <dd className="mt-1 text-sm text-gray-900">{userDetails.telefono || "N/A"}</dd>
                          </div>
                        </dl>
                        <div className="mt-6">
                          <button
                            onClick={handleEditToggle}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Editar Datos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="rounded-full bg-gray-300 h-32 w-32"></div>
                  <div className="mt-4 bg-gray-300 h-4 w-48 rounded"></div>
                  <div className="mt-2 bg-gray-300 h-4 w-64 rounded"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


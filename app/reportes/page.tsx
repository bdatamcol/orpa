"use client"
import { useEffect, useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabaseClient"

export default function Reportes() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [reporteData, setReporteData] = useState({
    tipo_falla: "",
    descripcion: "",
    informacion_contacto: "",
  })
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    resueltos: 0,
    pendientes: 0,
    porcentajeResueltos: 0
  })


  const fetchEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .from("reporte_fallas")
        .select("estado")

      if (error) {
        console.error("Error al obtener estadísticas:", error)
        return
      }

      const total = data?.length || 0
      const resueltos = data?.filter(reporte => reporte.estado === "resuelto").length || 0
      const pendientes = data?.filter(reporte => reporte.estado === "pendiente").length || 0
      const porcentajeResueltos = total > 0 ? Math.round((resueltos / total) * 100) : 0

      setEstadisticas({
        total,
        resueltos,
        pendientes,
        porcentajeResueltos
      })
    } catch (err) {
      console.error("Error al cargar estadísticas:", err)
    }
  }



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
          router.push("/")
          return
        }

        setUser(data.user)
        // Pre-llenar información de contacto con el email del usuario
        setReporteData(prev => ({
          ...prev,
          informacion_contacto: data.user.email || ""
        }))
        
        // Cargar estadísticas
        await fetchEstadisticas()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setReporteData({ ...reporteData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("reporte_fallas")
        .insert({
          tipo_falla: reporteData.tipo_falla,
          descripcion: reporteData.descripcion,
          informacion_contacto: reporteData.informacion_contacto,
          estado: "pendiente", // Estado por defecto
          fecha_creacion: new Date().toISOString()
        })

      if (error) {
        throw new Error(error.message)
      }

      setShowSuccessModal(true)
      setReporteData({
        tipo_falla: "",
        descripcion: "",
        informacion_contacto: user?.email || "",
      })
      
      // Actualizar estadísticas después de enviar el reporte
      await fetchEstadisticas()
    } catch (err: any) {
      setError("Error al enviar el reporte. Por favor, intente de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#f8c327] border-r-[#f8c327] border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#000000] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center lg:justify-start">
            <h2 className="text-xl font-bold">Menú</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-700 rounded-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <a
                href="/perfil"
                className="flex items-center font-semibold px-4 py-2 rounded-2xl hover:bg-slate-700 transition-colors"
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
                className="flex items-center font-semibold px-4 py-2 rounded-2xl bg-slate-700 transition-colors"
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
            {/* Breadcrumb */}
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
              <span className="text-gray-700 font-medium">Reportar Falla</span>
            </div>

            {/* Título */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportar Falla</h1>
              <p className="text-gray-600">Ayúdanos a mejorar reportando cualquier problema que encuentres en la plataforma.</p>
            </div>



            {/* Layout de 2 columnas */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Columna izquierda - Formulario */}
              <div className="flex-1 lg:max-w-2xl">
                {/* Mensajes de estado */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Formulario de reporte */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Tipo de falla */}
                      <div>
                        <label htmlFor="tipo_falla" className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Falla *
                        </label>
                        <select
                          id="tipo_falla"
                          name="tipo_falla"
                          value={reporteData.tipo_falla}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-transparent"
                        >
                          <option value="">Selecciona el tipo de falla</option>
                          <option value="error_sistema">Error del Sistema</option>
                          <option value="problema_acceso">Problema de Acceso</option>
                          <option value="error_datos">Error en Datos</option>
                          <option value="problema_interfaz">Problema de Interfaz</option>
                          <option value="lentitud">Lentitud del Sistema</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>

                      {/* Descripción */}
                      <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción del Problema *
                        </label>
                        <textarea
                          id="descripcion"
                          name="descripcion"
                          value={reporteData.descripcion}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          placeholder="Describe detalladamente el problema que experimentaste. Incluye los pasos que seguiste y cualquier mensaje de error que hayas visto."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-transparent resize-vertical"
                        />
                      </div>

                      {/* Información de contacto */}
                      <div>
                        <label htmlFor="informacion_contacto" className="block text-sm font-medium text-gray-700 mb-2">
                          Información de Contacto *
                        </label>
                        <input
                          id="informacion_contacto"
                          name="informacion_contacto"
                          type="email"
                          value={reporteData.informacion_contacto}
                          onChange={handleInputChange}
                          required
                          placeholder="tu@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Usaremos esta información para contactarte sobre el estado de tu reporte.
                        </p>
                      </div>

                      {/* Botón de envío */}
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-3 bg-[#f8c327] text-black font-medium rounded-2xl hover:bg-[#fad64f] focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-2xl animate-spin mr-2"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              Enviar Reporte
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Estadísticas e Información */}
              <div className="flex-1 space-y-6">
                {/* Estadísticas de Reportes */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Estadísticas del Sistema</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Total de Reportes */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-blue-100">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total de Reportes</p>
                            <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                          </div>
                        </div>
                      </div>

                      {/* Reportes Resueltos */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-green-100">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Reportes Resueltos</p>
                            <p className="text-2xl font-bold text-gray-900">{estadisticas.resueltos}</p>
                            <p className="text-sm text-green-600 font-medium">{estadisticas.porcentajeResueltos}% de efectividad</p>
                          </div>
                        </div>
                      </div>

                      {/* Reportes Pendientes */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-yellow-100">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">En Proceso</p>
                            <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
                            <p className="text-sm text-yellow-600 font-medium">Trabajando en ello</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Información adicional */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-100 mr-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Cómo funciona?</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Tu reporte será revisado por nuestro equipo técnico</li>
                          <li>• Te contactaremos por email para informarte sobre el progreso</li>
                          <li>• Los reportes se procesan en orden de prioridad</li>
                          <li>• Tiempo estimado de respuesta: 24-48 horas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Reporte Enviado!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tu reporte de falla ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push('/perfil')
                }}
                className="w-full bg-[#f8c327] text-black font-medium py-2 px-4 rounded-lg hover:bg-[#fad64f] focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:ring-offset-2"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
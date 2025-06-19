"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "./lib/supabaseClient"

export default function Home() {
  const [showReportModal, setShowReportModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [reporteData, setReporteData] = useState({
    tipo_falla: "",
    descripcion: "",
    informacion_contacto: "",
  })

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
          estado: "pendiente",
          fecha_creacion: new Date().toISOString()
        })

      if (error) {
        throw new Error(error.message)
      }

      setShowReportModal(false)
      setShowSuccessModal(true)
      setReporteData({
        tipo_falla: "",
        descripcion: "",
        informacion_contacto: "",
      })
    } catch (err: any) {
      setError("Error al enviar el reporte. Por favor, intente de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fondo con overlay */}
      <div className="absolute inset-0 z-0">
        <Image src="/img/fondo-inicio-negro.webp" alt="Fondo" fill className="object-cover hidden md:block" priority />
        <Image
          src="/img/fondo-movil-inicio-negro.webp"
          alt="Fondo móvil"
          fill
          className="object-cover md:hidden"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Contenido principal */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md px-4 py-8">
        {/* Logo o título */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ORPA</h1>
          <p className="text-gray-300 text-lg">Gestión de créditos simplificada</p>
        </div>

        {/* Tarjeta de acceso */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera de la tarjeta */}
          <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-5 text-white">
            <h2 className="text-xl font-bold text-center">Acceso a tu cuenta</h2>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <Link href="/auth/login" className="block w-full">
                <button className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Iniciar Sesión
                </button>
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              <Link href="/auth/register" className="block w-full">
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Crear una cuenta
                </button>
              </Link>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#f8c327]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ¿Por qué elegir ORPA?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-[#f8c327] mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Gestión sencilla de tus créditos
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-[#f8c327] mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Información actualizada en tiempo real
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-4 h-4 text-[#f8c327] mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Acceso seguro a tus datos
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de reporte de fallas */}
        <div className="mt-6 w-full">
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Reportar Falla
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} ORPA. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Modal de reporte de fallas */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Reportar Falla</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tipo_falla" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Falla *
                  </label>
                  <select
                    id="tipo_falla"
                    name="tipo_falla"
                    value={reporteData.tipo_falla}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-transparent text-sm"
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

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del Problema *
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={reporteData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Describe detalladamente el problema que experimentaste..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-transparent resize-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="informacion_contacto" className="block text-sm font-medium text-gray-700 mb-1">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    id="informacion_contacto"
                    name="informacion_contacto"
                    value={reporteData.informacion_contacto}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#f8c327] text-black py-2 px-4 rounded-lg hover:bg-[#fad64f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {submitting ? "Enviando..." : "Enviar Reporte"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => setShowSuccessModal(false)}
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


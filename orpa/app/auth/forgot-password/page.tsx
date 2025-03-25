"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabaseClient"

export default function ForgotPassword() {
  const router = useRouter()
  const [cedula, setCedula] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("") 
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      // Llamar a la función Edge de Supabase para enviar el correo de recuperación
      const response = await fetch(`${window.location.origin}/api/send-password-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cedula }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Error al enviar el correo de recuperación. Inténtalo más tarde.")
      } else {
        setMessage(
          "Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada."
        )
      }
    } catch (err: any) {
      setError("Error en el proceso de recuperación. Inténtalo más tarde.")
      console.error(err)
    } finally {
      setLoading(false)
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
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">ORPA</h1>
          </Link>
          <p className="text-gray-300 text-lg">Recupera tu contraseña</p>
        </div>

        {/* Tarjeta de recuperación */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera de la tarjeta */}
          <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-5 text-white">
            <h2 className="text-xl font-bold text-center">Recuperar Contraseña</h2>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                    <p className="text-sm text-green-700 mt-1">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Ingresa tu número de cédula y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                  </div>
                  <input
                    id="cedula"
                    name="cedula"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-[#f8c327]"
                    placeholder="Ingresa tu número de cédula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Recuperar Contraseña
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/auth/login" className="font-medium text-[#b2570b] hover:text-[#f8c327]">
                  Volver al inicio de sesión
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} ORPA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
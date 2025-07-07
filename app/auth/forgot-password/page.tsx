"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPassword() {
  const router = useRouter()
  const [cedula, setCedula] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cedula.trim()) {
      setError("Por favor ingresa tu cédula")
      return
    }

    // Validar formato de cédula
    const cedulaRegex = /^[0-9]{8,10}$/
    if (!cedulaRegex.test(cedula.trim())) {
      setError("La cédula debe contener entre 8 y 10 dígitos")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula: cedula.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setMessage(data.message)
      } else {
        setError(data.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
            <p className="text-gray-300 text-lg">Restablecimiento exitoso</p>
          </div>

          {/* Tarjeta de éxito */}
          <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Cabecera de la tarjeta */}
            <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-5 text-white">
              <h2 className="text-xl font-bold text-center">Correo Enviado</h2>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              <Link
                href="/auth/login"
                className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Volver al inicio de sesión
              </Link>
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
          <p className="text-gray-300 text-lg">Accede a tu cuenta</p>
        </div>

        {/* Tarjeta de restablecimiento */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera de la tarjeta */}
          <div className="bg-gradient-to-r from-[#000000] to-[#333333] p-5 text-white">
            <h2 className="text-xl font-bold text-center">¿Olvidaste tu contraseña?</h2>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6">
            <p className="text-gray-600 text-center mb-6">
              Ingresa tu cédula y te enviaremos un enlace para restablecer tu contraseña
            </p>

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
                    value={cedula}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Solo números
                      if (value.length <= 10) {
                        setCedula(value)
                        setError("")
                      }
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8c327] focus:border-[#f8c327]"
                    placeholder="Ingresa tu número de cédula"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f8c327] text-black py-3 px-4 rounded-lg hover:bg-[#fad64f] transition-colors font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de restablecimiento'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="font-medium text-[#b2570b] hover:text-[#f8c327] transition-colors duration-200"
              >
                ← Volver al inicio de sesión
              </Link>
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
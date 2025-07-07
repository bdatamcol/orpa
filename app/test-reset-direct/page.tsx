"use client"

import { useState } from 'react'

export default function TestResetDirectPage() {
  const [step, setStep] = useState(1)
  const [cedula, setCedula] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const requestReset = async () => {
    if (!cedula.trim()) {
      setError('Por favor ingresa una cédula')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cedula: cedula.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Correo de restablecimiento enviado exitosamente')
        setStep(2)
      } else {
        setError(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setError('❌ Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!token.trim() || !newPassword.trim()) {
      setError('Por favor ingresa token y nueva contraseña')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token: token.trim(), 
          newPassword: newPassword.trim() 
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Contraseña actualizada exitosamente')
        setStep(3)
      } else {
        setError(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setError('❌ Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Aquí podrías probar el login con la nueva contraseña
      setMessage('✅ Ahora puedes probar el login con la nueva contraseña')
    } catch (error) {
      setError('❌ Error en el login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Prueba Directa - Reset de Contraseña
          </h1>

          {/* Paso 1: Solicitar Reset */}
          {step >= 1 && (
            <div className="mb-8 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Paso 1: Solicitar Reset</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula:
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa la cédula"
                    disabled={step > 1}
                  />
                </div>
                <button
                  onClick={requestReset}
                  disabled={loading || step > 1}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Solicitar Reset'}
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Reset con Token */}
          {step >= 2 && (
            <div className="mb-8 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Paso 2: Restablecer Contraseña</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token (del email):
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pega el token del email"
                    disabled={step > 2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    disabled={step > 2}
                  />
                </div>
                <button
                  onClick={resetPassword}
                  disabled={loading || step > 2}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {step >= 3 && (
            <div className="mb-8 p-6 border rounded-lg bg-green-50">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Paso 3: ¡Completado!</h2>
              <p className="text-green-700 mb-4">
                La contraseña se ha actualizado exitosamente. Ahora puedes usar la nueva contraseña para iniciar sesión.
              </p>
              <a
                href="/auth/login"
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Ir al Login
              </a>
            </div>
          )}

          {/* Mensajes */}
          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Instrucciones */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Ingresa una cédula válida y solicita el reset</li>
              <li>Revisa tu email y copia el token del enlace</li>
              <li>Pega el token aquí junto con tu nueva contraseña</li>
              <li>Prueba el login con la nueva contraseña</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
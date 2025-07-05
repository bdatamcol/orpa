"use client"

import { useState } from 'react'
import Link from 'next/link'

interface TestResult {
  success: boolean
  message: string
  error?: string
}

export default function TestResetPasswordPage() {
  const [cedula, setCedula] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [requestResult, setRequestResult] = useState<TestResult | null>(null)
  const [validateResult, setValidateResult] = useState<TestResult | null>(null)
  const [resetResult, setResetResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState({ request: false, validate: false, reset: false })

  const testRequestReset = async () => {
    if (!cedula.trim()) {
      alert('Por favor ingresa una cédula')
      return
    }

    setLoading(prev => ({ ...prev, request: true }))
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cedula: cedula.trim() })
      })

      const result = await response.json()
      setRequestResult(result)
    } catch (error) {
      setRequestResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(prev => ({ ...prev, request: false }))
    }
  }

  const testValidateToken = async () => {
    if (!token.trim()) {
      alert('Por favor ingresa un token')
      return
    }

    setLoading(prev => ({ ...prev, validate: true }))
    try {
      const response = await fetch(`/api/reset-password?token=${token.trim()}`)
      const result = await response.json()
      setValidateResult(result)
    } catch (error) {
      setValidateResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(prev => ({ ...prev, validate: false }))
    }
  }

  const testResetPassword = async () => {
    if (!token.trim() || !newPassword.trim()) {
      alert('Por favor ingresa token y nueva contraseña')
      return
    }

    setLoading(prev => ({ ...prev, reset: true }))
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

      const result = await response.json()
      setResetResult(result)
    } catch (error) {
      setResetResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(prev => ({ ...prev, reset: false }))
    }
  }

  const ResultCard = ({ title, result, loading }: { title: string, result: TestResult | null, loading: boolean }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Procesando...</span>
        </div>
      ) : result ? (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Éxito' : '❌ Error'}
          </div>
          <div className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </div>
          {result.error && (
            <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 italic">No se ha ejecutado la prueba</div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Test Reset Password API</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Configuración requerida:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Asegúrate de que <code className="bg-yellow-100 px-1 rounded">RESEND_API_KEY</code> esté configurado en el archivo .env</li>
              <li>• Verifica que <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SITE_URL</code> esté configurado correctamente</li>
              <li>• La cédula debe existir en la base de datos con un email válido</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formularios de prueba */}
          <div className="space-y-6">
            {/* Test 1: Solicitar reset */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">1. Solicitar Reset de Contraseña</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 12345678"
                    maxLength={10}
                  />
                </div>
                <button
                  onClick={testRequestReset}
                  disabled={loading.request}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading.request ? 'Enviando...' : 'Solicitar Reset'}
                </button>
              </div>
            </div>

            {/* Test 2: Validar token */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">2. Validar Token</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Reset
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Token del email"
                  />
                </div>
                <button
                  onClick={testValidateToken}
                  disabled={loading.validate}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading.validate ? 'Validando...' : 'Validar Token'}
                </button>
              </div>
            </div>

            {/* Test 3: Reset password */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">3. Actualizar Contraseña</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
                <button
                  onClick={testResetPassword}
                  disabled={loading.reset}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading.reset ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            <ResultCard 
              title="Resultado: Solicitar Reset" 
              result={requestResult} 
              loading={loading.request} 
            />
            <ResultCard 
              title="Resultado: Validar Token" 
              result={validateResult} 
              loading={loading.validate} 
            />
            <ResultCard 
              title="Resultado: Actualizar Contraseña" 
              result={resetResult} 
              loading={loading.reset} 
            />
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Instrucciones de Prueba</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>Ingresa una cédula que exista en la base de datos y haz clic en "Solicitar Reset"</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-green-600">2.</span>
              <span>Revisa tu email para obtener el token de reset (o revisa los logs del servidor)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-purple-600">3.</span>
              <span>Copia el token del email y pégalo en el campo "Token de Reset", luego valídalo</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-orange-600">4.</span>
              <span>Ingresa una nueva contraseña y completa el proceso de reset</span>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Enlaces Útiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/auth/forgot-password"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-800">Página de Solicitud</div>
              <div className="text-sm text-blue-600">Probar interfaz de usuario</div>
            </Link>
            <Link
              href="/auth/login"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-800">Página de Login</div>
              <div className="text-sm text-green-600">Ver enlace integrado</div>
            </Link>
            <Link
              href="/test-supabase"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-800">Test Supabase</div>
              <div className="text-sm text-purple-600">Verificar conexión DB</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
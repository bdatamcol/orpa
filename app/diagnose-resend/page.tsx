"use client"

import { useState } from 'react'
import Link from 'next/link'

interface DiagnosticResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export default function DiagnoseResendPage() {
  const [testEmail, setTestEmail] = useState('')
  const [configResult, setConfigResult] = useState<DiagnosticResult | null>(null)
  const [testResult, setTestResult] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState({ config: false, test: false })

  const checkConfiguration = async () => {
    setLoading(prev => ({ ...prev, config: true }))
    try {
      const response = await fetch('/api/diagnose-resend')
      const result = await response.json()
      setConfigResult(result)
    } catch (error) {
      setConfigResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(prev => ({ ...prev, config: false }))
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert('Por favor ingresa un email de prueba')
      return
    }

    setLoading(prev => ({ ...prev, test: true }))
    try {
      const response = await fetch('/api/diagnose-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail: testEmail.trim() })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(prev => ({ ...prev, test: false }))
    }
  }

  const ResultCard = ({ title, result, loading }: { title: string, result: DiagnosticResult | null, loading: boolean }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Verificando...</span>
        </div>
      ) : result ? (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Configuración correcta' : '❌ Problema detectado'}
          </div>
          <div className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </div>
          {result.details && (
            <div className="mt-3 text-xs bg-gray-100 p-3 rounded border">
              <strong>Detalles:</strong>
              <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
            </div>
          )}
          {result.error && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 italic">No se ha ejecutado la verificación</div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Diagnóstico de Resend</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">🔍 Diagnóstico de problemas de entrega</h3>
            <p className="text-sm text-blue-700">
              Esta herramienta te ayudará a identificar por qué los correos no llegan a los destinatarios.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verificaciones */}
          <div className="space-y-6">
            {/* Verificar configuración */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">1. Verificar Configuración</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Verifica que las variables de entorno estén configuradas correctamente.
              </p>
              <button
                onClick={checkConfiguration}
                disabled={loading.config}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading.config ? 'Verificando...' : 'Verificar Configuración'}
              </button>
            </div>

            {/* Enviar email de prueba */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">2. Enviar Email de Prueba</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Envía un email de prueba para verificar que Resend funciona correctamente.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de prueba
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tu-email@ejemplo.com"
                  />
                </div>
                <button
                  onClick={sendTestEmail}
                  disabled={loading.test}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading.test ? 'Enviando...' : 'Enviar Email de Prueba'}
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            <ResultCard 
              title="Resultado: Configuración" 
              result={configResult} 
              loading={loading.config} 
            />
            <ResultCard 
              title="Resultado: Email de Prueba" 
              result={testResult} 
              loading={loading.test} 
            />
          </div>
        </div>

        {/* Guía de solución de problemas */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ Guía de Solución de Problemas</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-semibold text-yellow-800">Problema: API Key inválida</h4>
              <p>Verifica que <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code> esté configurado correctamente en tu archivo .env.local</p>
            </div>
            
            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-semibold text-blue-800">Problema: Dominio no verificado</h4>
              <p>En Resend, verifica tu dominio o usa el dominio sandbox para pruebas</p>
            </div>
            
            <div className="border-l-4 border-purple-400 pl-4">
              <h4 className="font-semibold text-purple-800">Problema: Emails van a spam</h4>
              <p>Configura SPF, DKIM y DMARC records en tu dominio</p>
            </div>
            
            <div className="border-l-4 border-red-400 pl-4">
              <h4 className="font-semibold text-red-800">Problema: Rate limiting</h4>
              <p>Verifica los límites de tu plan de Resend</p>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Enlaces Útiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://resend.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-800">Dashboard Resend</div>
              <div className="text-sm text-blue-600">Ver logs y configuración</div>
            </a>
            <Link
              href="/test-reset-password"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-800">Test Reset Password</div>
              <div className="text-sm text-green-600">Probar funcionalidad completa</div>
            </Link>
            <a
              href="https://resend.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-800">Documentación</div>
              <div className="text-sm text-purple-600">Guías de Resend</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
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
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [isTestLoading, setIsTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<DiagnosticResult | null>(null)
  const [testEmail, setTestEmail] = useState('')

  const runDiagnostics = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/diagnose-resend')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Error al conectar con el servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) return
    
    setIsTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/diagnose-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail })
      })
      
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al enviar email de prueba',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTestLoading(false)
    }
  }

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

          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Verificando...
              </>
            ) : (
              'Verificar Configuración de Resend'
            )}
          </button>
        </div>

        {/* Resultado de la verificación */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Resultado de la Verificación</h2>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-600">
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

        {/* Sección de envío de email de prueba */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📧 Enviar Email de Prueba</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email de destino:
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="ejemplo@dominio.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={sendTestEmail}
              disabled={isTestLoading || !testEmail}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isTestLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Email de Prueba'
              )}
            </button>
          </div>
          
          {/* Resultado del test de email */}
          {isTestLoading ? (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Enviando email...</span>
            </div>
          ) : testResult ? (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ Email enviado exitosamente' : '❌ Error al enviar email'}
              </div>
              <div className={`mt-2 text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </div>
              {testResult.details && (
                <div className="mt-3 text-xs bg-gray-100 p-3 rounded border">
                  <strong>Detalles:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(testResult.details, null, 2)}</pre>
                </div>
              )}
              {testResult.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <strong>Error:</strong> {testResult.error}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Consejos de Troubleshooting</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">🔑 Problemas comunes:</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>API Key incorrecta o expirada</li>
                <li>Dominio no verificado en Resend</li>
                <li>Límites de envío alcanzados</li>
                <li>Emails llegando a carpeta de spam</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔗 Enlaces útiles:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li><a href="https://resend.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Dashboard de Resend</a></li>
                <li><a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Gestión de Dominios</a></li>
                <li><a href="https://resend.com/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Documentación</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
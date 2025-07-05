"use client"

import { useState } from 'react'

interface SupabaseTestResult {
  success: boolean
  message: string
  userCount?: number
  config?: any
  error?: string
}

interface UserSearchResult {
  success: boolean
  found: boolean
  hasEmail: boolean
  error?: string
  user?: {
    cedula: string
    email: string | null
  }
}

export default function TestSupabasePage() {
  const [connectionResult, setConnectionResult] = useState<SupabaseTestResult | null>(null)
  const [userSearchResult, setUserSearchResult] = useState<UserSearchResult | null>(null)
  const [cedula, setCedula] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-supabase')
      const result = await response.json()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Error connecting to test endpoint',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const searchUser = async () => {
    if (!cedula.trim()) {
      alert('Por favor ingresa una cédula')
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch('/api/test-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cedula: cedula.trim() })
      })
      const result = await response.json()
      setUserSearchResult(result)
    } catch (error) {
      setUserSearchResult({
        success: false,
        found: false,
        hasEmail: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Diagnóstico de Supabase
          </h1>
          
          {/* Test de Conexión */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              1. Test de Conexión
            </h2>
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
            
            {connectionResult && (
              <div className={`mt-4 p-4 rounded-md ${
                connectionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold ${
                  connectionResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {connectionResult.success ? '✅ Conexión Exitosa' : '❌ Error de Conexión'}
                </h3>
                <p className="text-gray-700 mt-2">{connectionResult.message}</p>
                
                {connectionResult.userCount !== undefined && (
                  <p className="text-gray-600 mt-1">
                    Usuarios encontrados: {connectionResult.userCount}
                  </p>
                )}
                
                {connectionResult.config && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700">Configuración:</h4>
                    <ul className="text-sm text-gray-600 mt-1">
                      <li>URL configurada: {connectionResult.config.hasUrl ? '✅' : '❌'}</li>
                      <li>Service Key configurada: {connectionResult.config.hasServiceKey ? '✅' : '❌'}</li>
                      <li>URL válida: {connectionResult.config.urlValid ? '✅' : '❌'}</li>
                      <li>Service Key válida: {connectionResult.config.serviceKeyValid ? '✅' : '❌'}</li>
                    </ul>
                  </div>
                )}
                
                {connectionResult.error && (
                  <p className="text-red-600 mt-2 text-sm">
                    Error: {connectionResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Test de Búsqueda de Usuario */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              2. Test de Búsqueda de Usuario
            </h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula
                </label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ingresa una cédula para buscar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={searchUser}
                disabled={searchLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md transition-colors"
              >
                {searchLoading ? 'Buscando...' : 'Buscar Usuario'}
              </button>
            </div>
            
            {userSearchResult && (
              <div className={`mt-4 p-4 rounded-md ${
                userSearchResult.success ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold ${
                  userSearchResult.success ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {userSearchResult.success ? '📋 Resultado de Búsqueda' : '❌ Error en Búsqueda'}
                </h3>
                
                {userSearchResult.success && (
                  <div className="mt-2">
                    <p className="text-gray-700">
                      Usuario encontrado: {userSearchResult.found ? '✅ Sí' : '❌ No'}
                    </p>
                    {userSearchResult.found && (
                      <>
                        <p className="text-gray-700">
                          Tiene email: {userSearchResult.hasEmail ? '✅ Sí' : '❌ No'}
                        </p>
                        {userSearchResult.user && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Cédula: {userSearchResult.user.cedula}</p>
                            <p>Email: {userSearchResult.user.email || 'No disponible'}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {userSearchResult.error && (
                  <p className="text-red-600 mt-2 text-sm">
                    Error: {userSearchResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Información */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Este diagnóstico verifica la conectividad con Supabase</li>
              <li>• Si la conexión falla, verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY</li>
              <li>• La búsqueda de usuario prueba la consulta a la tabla 'usuarios'</li>
              <li>• Si no encuentras usuarios, verifica que existan en la tabla 'usuarios' de Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
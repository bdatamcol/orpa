'use client';

import { useState } from 'react';

export default function TestEmailDeliveryPage() {
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('1090178379');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testType, setTestType] = useState('reset-password');

  const testEmailDelivery = async () => {
    setLoading(true);
    setResult(null);

    try {
      let response;
      
      if (testType === 'reset-password') {
        // Probar el endpoint de recuperación de contraseña
        response = await fetch('/api/send-password-email-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cedula }),
        });
      } else {
        // Probar envío directo de correo
        response = await fetch('/api/test-smtp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, testType: 'send' }),
        });
      }

      const data = await response.json();
      setResult({
        status: response.status,
        success: response.ok,
        data
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Diagnóstico de Entrega de Correos
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Prueba
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reset-password">Recuperación de Contraseña (Usuario Existente)</option>
                <option value="send">Envío Directo de Correo</option>
              </select>
            </div>

            {testType === 'reset-password' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula del Usuario
                </label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="1090178379"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usuario actual: usuario@orpainversiones.com
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo de Destino
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-correo@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              onClick={testEmailDelivery}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Probar Envío'}
            </button>

            {testType === 'reset-password' && (
              <div className="border-t pt-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 text-sm">
                    <strong>ℹ️ Información:</strong> El sistema ahora busca usuarios ÚNICAMENTE en Supabase. 
                    Para actualizar el correo de un usuario, hazlo directamente en la base de datos de Supabase.
                  </p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Resultado:</h3>
              <div className={`p-4 rounded-md ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`text-sm ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  <p><strong>Estado:</strong> {result.status || 'N/A'}</p>
                  <p><strong>Éxito:</strong> {result.success ? 'Sí' : 'No'}</p>
                  {result.message && <p><strong>Mensaje:</strong> {result.message}</p>}
                  {result.data && (
                    <div className="mt-2">
                      <p><strong>Respuesta:</strong></p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.error && (
                    <p className="mt-2"><strong>Error:</strong> {result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <h4 className="font-medium mb-2">Información del Sistema:</h4>
            <ul className="space-y-1">
              <li>• <strong>Fuente de datos:</strong> ÚNICAMENTE Supabase (tabla 'usuarios')</li>
              <li>• <strong>Búsqueda:</strong> Por campo 'cedula' en Supabase</li>
              <li>• <strong>Correo destino:</strong> Campo 'correo' del usuario encontrado</li>
              <li>• <strong>Servidor SMTP:</strong> mail.orpainversiones.com:587</li>
              <li>• <strong>Nota:</strong> El correo puede tardar unos minutos en llegar</li>
              <li>• <strong>Importante:</strong> Revisa la carpeta de spam/correo no deseado</li>
            </ul>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-xs">
                <strong>⚠️ Configuración requerida:</strong> Asegúrate de que SUPABASE_SERVICE_ROLE_KEY esté configurado correctamente en el archivo .env
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
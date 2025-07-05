'use client';

import { useState } from 'react';

export default function TestSMTPPage() {
  const [email, setEmail] = useState('');
  const [testType, setTestType] = useState('connection');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/test-smtp');
      const data = await response.json();
      setConfig(data.config);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const runTest = async () => {
    if (!email && testType === 'send') {
      alert('Por favor ingresa un email para la prueba de envío');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, testType }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Diagnóstico SMTP
        </h1>

        {/* Configuración actual */}
        <div className="mb-6">
          <button
            onClick={loadConfig}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mb-4"
          >
            Cargar Configuración Actual
          </button>
          
          {config && (
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <h3 className="font-semibold mb-2">Configuración SMTP:</h3>
              <p><strong>Host:</strong> {config.host}</p>
              <p><strong>Puerto:</strong> {config.port}</p>
              <p><strong>Usuario:</strong> {config.user}</p>
              <p><strong>From:</strong> {config.from}</p>
              <p><strong>Password:</strong> {config.hasPassword ? '✓ Configurado' : '✗ No configurado'}</p>
            </div>
          )}
        </div>

        {/* Tipo de prueba */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Prueba:
          </label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="connection">Prueba de Conexión</option>
            <option value="send">Envío de Email de Prueba</option>
          </select>
        </div>

        {/* Email (solo para prueba de envío) */}
        {testType === 'send' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Destino:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@ejemplo.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Botón de prueba */}
        <button
          onClick={runTest}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors mb-4"
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Prueba'}
        </button>

        {/* Resultados */}
        {result && (
          <div className={`p-4 rounded-md ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✓ Éxito' : '✗ Error'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>
            {result.details && (
              <p className="text-sm mt-2 text-gray-600">
                <strong>Detalles:</strong> {result.details}
              </p>
            )}
            {result.config && (
              <div className="mt-3 text-xs text-gray-500">
                <p><strong>Configuración usada:</strong></p>
                <p>Host: {result.config.host}:{result.config.port}</p>
                <p>Usuario: {result.config.user}</p>
              </div>
            )}
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-6 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Instrucciones:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Prueba de Conexión:</strong> Verifica si el servidor puede conectarse al SMTP</li>
            <li><strong>Envío de Prueba:</strong> Envía un email real para verificar la entrega</li>
          </ul>
        </div>


      </div>
    </div>
  );
}
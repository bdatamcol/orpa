"use client";
import { useState } from "react";

export default function TestAPI() {
  const [cedula, setCedula] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const response = await fetch(`/api/verificarCedula?cedula=${cedula}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error en la verificación");
      } else {
        setResultado(data);
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test API de Validación</h1>
      <input
        type="text"
        placeholder="Ingrese la cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        className="w-full border p-2 mb-4"
      />
      <button onClick={handleCheck} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Verificando..." : "Validar Cédula"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {resultado && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">HTTP Code: 200</h3>
          <h3 className="font-bold mt-2">Respuesta de la API:</h3>
          <pre className="text-sm">{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

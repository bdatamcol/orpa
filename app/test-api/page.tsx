'use client';

import { useEffect, useState } from 'react';

export default function TestApiPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const cedula = "1090178379"; // Puedes cambiar esto o pasarlo dinámicamente
      try {
        const response = await fetch(`/api/verificarCedula?cedula=${cedula}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error desconocido");
        }

        setData(result.data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Datos obtenidos correctamente:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ **Verificar usuario en la base de datos**
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 **Verificar si la cédula existe en la tabla de usuarios**
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("correo")
        .eq("cedula", cedula)
        .single();

      if (userError || !userData) {
        setError("Cédula no encontrada.");
        setLoading(false);
        return;
      }

      // ✅ **Si existe, iniciar sesión con el correo asociado**
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.correo.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError("Error en la autenticación. Verifica tus credenciales.");
        setLoading(false);
        return;
      }

      // 🚀 **Redirigir al usuario después del inicio de sesión**
      router.push("/perfil");
    } catch (error: any) {
      setError("Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Número de Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ **Bloquear acceso si hay sesión activa**
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/perfil"); // Redirige al perfil si ya está autenticado
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  // ✅ **Manejar el inicio de sesión con cédula y clave**
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      // 🔹 **Buscar el correo asociado a la cédula en Supabase**
      const { data: user, error: userError } = await supabase
        .from("usuarios")
        .select("correo")
        .eq("cedula", cedula)
        .single();

      if (userError || !user) {
        setError("Cédula no encontrada.");
        return;
      }

      const correo = user.correo;

      // 🔹 **Iniciar sesión en Supabase Authentication**
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: correo,
        password,
      });

      if (authError) {
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
        return;
      }

      router.push("/perfil");
    } catch (err: any) {
      setError("Error en el inicio de sesión. Inténtalo más tarde.");
    }
  };

  // **Esperar validación de sesión antes de mostrar el formulario**
  if (loading) {
    return <p className="text-center">Cargando...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Cédula"
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Ingresar
        </button>
      </form>
    </div>
  );
}

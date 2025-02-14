"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ cedula: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Buscar usuario por cédula
    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("correo")
      .eq("cedula", form.cedula)
      .single();

    if (userError || !user) {
      setError("Cédula no encontrada.");
      setLoading(false);
      return;
    }

    // Autenticar en Supabase Auth con el correo y contraseña
    const { error } = await supabase.auth.signInWithPassword({
      email: user.correo,
      password: form.password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/perfil");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="cedula" placeholder="Número de Cédula" onChange={handleChange} className="input" required />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="input" required />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre1: "",
    nombre2: "",
    apellido1: "",
    apellido2: "",
    tipo_documento: "Cédula de Ciudadanía",
    cedula: "",
    correo: "",
    password: "",
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.push("/perfil");
      }
    };
    checkSession();
  }, [router]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          nombre1: form.nombre1,
          nombre2: form.nombre2,
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          tipo_documento: form.tipo_documento,
          cedula: form.cedula,
          correo: form.correo,
        },
      ]);

      if (dbError) {
        setError(dbError.message);
      } else {
        router.push("/perfil");
      }
    } else {
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

      const { error } = await supabase.auth.signInWithPassword({
        email: user.correo,
        password: form.password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/perfil");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a ORPA</h1>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isRegister ? "Registro" : "Iniciar Sesión"}
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input name="nombre1" placeholder="Primer Nombre" onChange={handleChange} className="input" required />
              <input name="nombre2" placeholder="Segundo Nombre" onChange={handleChange} className="input" />
              <input name="apellido1" placeholder="Primer Apellido" onChange={handleChange} className="input" required />
              <input name="apellido2" placeholder="Segundo Apellido" onChange={handleChange} className="input" />
              <select name="tipo_documento" onChange={handleChange} className="input">
                <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                <option value="Cédula de Extranjería">Cédula de Extranjería</option>
              </select>
              <input name="cedula" placeholder="Número de Cédula" onChange={handleChange} className="input" required />
              <input name="correo" type="email" placeholder="Correo" onChange={handleChange} className="input" required />
            </>
          )}

          {!isRegister && (
            <input name="cedula" placeholder="Número de Cédula" onChange={handleChange} className="input" required />
          )}

          <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="input" required />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg" disabled={loading}>
            {loading ? (isRegister ? "Registrando..." : "Iniciando...") : isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <p className="text-center mt-4">
          {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-500 underline">
            {isRegister ? "Iniciar sesión" : "Registrarse"}
          </button>
        </p>
      </div>
    </div>
  );
}

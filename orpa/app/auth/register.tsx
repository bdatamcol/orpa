"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: form.correo,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Guardar datos en la tabla usuarios
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
      router.push("/auth/login"); // Redirigir al login
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="input" required />

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}

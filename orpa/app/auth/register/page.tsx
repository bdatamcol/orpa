"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verificarCedula } from "../../lib/apiUsuarios";
import { supabase } from "../../lib/supabaseClient";

export default function Register() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [loadingCedula, setLoadingCedula] = useState(false);
  const [datosCargados, setDatosCargados] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre1: "",
    nombre2: "",
    apellido1: "",
    apellido2: "",
    correo: "",
    telefono: "",
    tipo_documento: "Cédula de Ciudadanía",
    password: "",
    confirmPassword: "",
  });

  // ✅ **Bloquear acceso si hay sesión activa**
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/perfil");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  // ✅ **Verificar cédula en la API externa**
  const handleCedulaCheck = async () => {
    setLoadingCedula(true);
    setShowModal(false);

    try {
      const res = await verificarCedula(cedula);
      setLoadingCedula(false);

      if (!res.success || !res.data) {
        setShowModal(true); // Ahora el modal se activa correctamente
        return;
      }

      const userData = res.data;

      if (!userData.e_mail || userData.e_mail.trim() === "") {
        setShowModal(true); // Mostrar modal en vez de mensaje rojo
        return;
      }

      setDatosCargados(true);
      setUsuarioEncontrado(true);

      // ✅ **Mapear los datos obtenidos de la API**
      setForm({
        nombre1: userData.nom1_cli || "",
        nombre2: userData.nom2_cli || "",
        apellido1: userData.ap1_cli || "",
        apellido2: userData.ap2_cli || "",
        correo: userData.e_mail.trim(),
        telefono: userData.te1_cli || userData.te2_cli || "",
        tipo_documento: userData.tip_ide === "01" ? "Cédula de Ciudadanía" : "Cédula de Extranjería",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setLoadingCedula(false);
      setShowModal(true); // Mostrar modal si hay error en la API
    }
  };

  // ✅ **Manejar cambios en los inputs**
  const handleInputChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ **Manejar el registro del usuario en Supabase**
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!form.correo) {
      alert("Error: No se obtuvo un correo válido de la API externa.");
      return;
    }

    try {
      // 🔹 **Registrar usuario en Authentication**
      const { error } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
        options: {
          data: {
            nombre1: form.nombre1,
            nombre2: form.nombre2,
            apellido1: form.apellido1,
            apellido2: form.apellido2,
            telefono: form.telefono,
            tipo_documento: form.tipo_documento,
            cedula: cedula,
          },
        },
      });

      if (error) throw error;

      // 🔹 **Guardar datos en Supabase**
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          cedula: cedula,
          nombre1: form.nombre1,
          nombre2: form.nombre2,
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          tipo_documento: form.tipo_documento,
          correo: form.correo,
          telefono: form.telefono,
        },
      ]);

      if (dbError) throw dbError;

      alert("Registro exitoso. Verifica tu correo para completar el proceso.");
      router.push("/auth/login");
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return <p className="text-center">Cargando...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>

      {/* ✅ **Validar cédula en API Pruebas antes de mostrar el formulario** */}
      {!datosCargados && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Número de Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <button
            onClick={handleCedulaCheck}
            className="w-full bg-blue-600 text-white p-2 mt-2 rounded"
            disabled={loadingCedula}
          >
            {loadingCedula ? "Verificando..." : "Validar Cédula"}
          </button>
        </div>
      )}

      {/* ✅ **Formulario solo si la cédula ya fue validada y existe en la API** */}
      {datosCargados && usuarioEncontrado && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="nombre1" value={form.nombre1} className="w-full border p-2 rounded bg-gray-100" disabled />
          <input name="nombre2" value={form.nombre2} className="w-full border p-2 rounded bg-gray-100" disabled />
          <input name="apellido1" value={form.apellido1} className="w-full border p-2 rounded bg-gray-100" disabled />
          <input name="apellido2" value={form.apellido2} className="w-full border p-2 rounded bg-gray-100" disabled />
          <input name="correo" type="email" value={form.correo} className="w-full border p-2 rounded bg-gray-100" disabled />
          <input name="telefono" value={form.telefono} className="w-full border p-2 rounded bg-gray-100" disabled />
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleInputChange} className="w-full border p-2 rounded" required />
          <input name="confirmPassword" type="password" placeholder="Confirmar Contraseña" value={form.confirmPassword} onChange={handleInputChange} className="w-full border p-2 rounded" required />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
            Registrarse
          </button>
        </form>
      )}

      {/* ✅ **Modal cuando la cédula no tiene historial de crédito** */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">No hay historial de créditos</h3>
            <p>Te invitamos a que adquieras tu primer crédito con ORPA</p>
            <button
              onClick={() => (window.location.href = "https://orpainversiones.com/")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

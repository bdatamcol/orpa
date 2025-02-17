import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a ORPA</h1>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>
        <Link href="/auth/login">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">Iniciar Sesión</button>
        </Link>
        <p className="text-center mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-blue-500 underline">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}

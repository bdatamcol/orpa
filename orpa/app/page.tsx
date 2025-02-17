import Link from "next/link"

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://img.freepik.com/vector-gratis/lineas-negras-abstractas-fondo-geometrico_677411-2748.jpg?t=st=1739832855~exp=1739836455~hmac=fa916690c1fc4574d785dffcf63aa5455b9bcfa4488147cc5b51e7a2d7414775&w=1380')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-4xl font-bold mb-6 text-white">Bienvenido a ORPA</h1>

        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Acceso a tu cuenta</h2>
          <Link href="/auth/login" className="block w-full">
            <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
              Iniciar Sesión
            </button>
          </Link>
          <p className="text-center mt-6 text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


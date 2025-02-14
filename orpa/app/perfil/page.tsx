"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/");
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold">Menú</h2>
        <ul className="mt-4">
          <li>
            <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-red-500 rounded">
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </aside>
      
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        {user ? <p>Bienvenido, {user.email}</p> : <p>Cargando...</p>}
      </main>
    </div>
  );
}
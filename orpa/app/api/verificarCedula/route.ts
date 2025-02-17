import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cedula = searchParams.get("cedula");

  if (!cedula) {
    return NextResponse.json({ error: "Cédula es requerida" }, { status: 400 });
  }

  try {
    // 1️⃣ Autenticación para obtener el token
    const loginUrl = "https://api.pruebas.hph.com.co/api/Authenticate/login";
    const credentials = {
      username: "dev",
      password: "kynvyw-myQwi1-jajdud.@",
    };

    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!loginResponse.ok) {
      return NextResponse.json({ error: "Error en la autenticación" }, { status: loginResponse.status });
    }

    const loginData = await loginResponse.json();
    if (!loginData.token) {
      return NextResponse.json({ error: "No se obtuvo token de autenticación" }, { status: 500 });
    }

    const token = loginData.token;

    // 2️⃣ Consultar la cédula en la API
    const apiUrl = `https://api.pruebas.hph.com.co/api/Crm/GetCustomersById?Id=${cedula}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      return NextResponse.json({ error: "Cédula no encontrada en la base de datos externa" }, { status: 404 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: "Error al consultar la API externa" }, { status: response.status });
    }

    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Datos vacíos recibidos de la API externa" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error("Error en la solicitud:", error);
    return NextResponse.json({ error: "Error en la solicitud del servidor" }, { status: 500 });
  }
}

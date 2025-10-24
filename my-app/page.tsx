import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">LF App</h1>
      <p className="text-gray-700 mb-6">
        Bienvenido a la aplicación de gestión.  
        Haz clic abajo para probar la conexión con Supabase.
      </p>
      <Link
        href="/test"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition"
      >
        Ir a Test
      </Link>
    </main>
  );
}
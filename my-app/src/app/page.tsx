'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [nuevo, setNuevo] = useState({ telefono: '', nombre: '', direccion: '' })
  const [busqueda, setBusqueda] = useState('')

  // === Cargar clientes desde Supabase ===
  useEffect(() => {
    fetchClientes()
  }, [])

  async function fetchClientes() {
    const { data, error } = await supabase.from('clientes').select('*').order('telefono', { ascending: true })
    if (!error && data) setClientes(data)
  }

  // === Guardar nuevo cliente ===
  async function guardarCliente() {
    if (!nuevo.telefono || !nuevo.nombre) return alert('Falta teléfono o nombre')
    const { error } = await supabase.from('clientes').insert([nuevo])
    if (!error) {
      setNuevo({ telefono: '', nombre: '', direccion: '' })
      fetchClientes()
    }
  }

  // === Eliminar cliente ===
  async function eliminarCliente(telefono: string) {
    if (!confirm('¿Eliminar cliente?')) return
    await supabase.from('clientes').delete().eq('telefono', telefono)
    fetchClientes()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          📋 Lista de Clientes
        </h1>

        {/* Formulario */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Teléfono"
            value={nuevo.telefono}
            onChange={e => setNuevo({ ...nuevo, telefono: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Dirección"
            value={nuevo.direccion}
            onChange={e => setNuevo({ ...nuevo, direccion: e.target.value })}
          />
          <button
            onClick={guardarCliente}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>

        {/* Buscador */}
        <input
          className="border rounded-lg w-full mb-4 px-3 py-2"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-3 py-2 text-left">Teléfono</th>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Dirección</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.telefono} className="border-b hover:bg-indigo-50">
                  <td className="px-3 py-2">{c.telefono}</td>
                  <td className="px-3 py-2 font-medium">{c.nombre}</td>
                  <td className="px-3 py-2">{c.direccion}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => eliminarCliente(c.telefono)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


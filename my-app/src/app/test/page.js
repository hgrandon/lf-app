'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestConn() {
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [])

  async function fetchClientes() {
    const { data, error } = await supabase.from('clientes').select('*').order('id', { ascending: false })
    if (!error) setClientes(data || [])
  }

  async function guardarOModificar() {
    if (!telefono.trim()) {
      alert('El teléfono es obligatorio.')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('clientes')
      .upsert([{ telefono, nombre, direccion }], { onConflict: 'telefono' })
    setLoading(false)
    if (error) {
      alert('❌ Error: ' + error.message)
    } else {
      alert(editing ? '✅ Cliente modificado.' : '✅ Cliente guardado.')
      limpiarForm()
      fetchClientes()
    }
  }

  function limpiarForm() {
    setTelefono('')
    setNombre('')
    setDireccion('')
    setEditing(false)
  }

  function empezarEdicion(cli) {
    setTelefono(cli.telefono)
    setNombre(cli.nombre || '')
    setDireccion(cli.direccion || '')
    setEditing(true)
  }

  async function eliminarCliente(tel) {
    if (!confirm(`¿Eliminar cliente con teléfono ${tel}?`)) return
    const { error } = await supabase.from('clientes').delete().eq('telefono', tel)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
    } else {
      alert('🗑️ Cliente eliminado.')
      if (editing && tel === telefono) limpiarForm()
      fetchClientes()
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    [c.telefono || '', c.nombre || '', c.direccion || '']
      .join(' ')
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8 border border-purple-200">
        <h1 className="text-3xl font-extrabold text-purple-700 flex items-center gap-2 mb-4">
          📱 Prueba de conexión con Supabase
        </h1>
        <p className="text-gray-600 mb-6">
          El dato clave es el <b>Teléfono</b> (único). Usa el formulario para crear o editar.
        </p>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            placeholder="Ej: 912345678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            disabled={editing}
          />
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Ej: Av. Principal 123"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={guardarOModificar}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            {loading ? 'Guardando...' : editing ? 'Modificar' : 'Guardar'}
          </button>
          {editing && (
            <button
              onClick={limpiarForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Lista de clientes */}
        <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
          📋 Lista de Clientes
          <span className="text-sm text-gray-500 font-normal">
            {clientesFiltrados.length} registro(s)
          </span>
        </h2>

        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o dirección"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border rounded-md p-2 mt-3 w-full mb-4 focus:ring-2 focus:ring-purple-400 focus:outline-none"
        />

        {clientesFiltrados.length === 0 ? (
          <p className="text-gray-500 mt-6 text-center">Sin resultados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-sm">
              <thead>
                <tr className="bg-purple-100 text-purple-700 text-left">
                  <th className="border p-2">Teléfono</th>
                  <th className="border p-2">Nombre</th>
                  <th className="border p-2">Dirección</th>
                  <th className="border p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cli) => (
                  <tr key={cli.telefono} className="hover:bg-purple-50 transition">
                    <td className="border p-2">{cli.telefono}</td>
                    <td className="border p-2">{cli.nombre}</td>
                    <td className="border p-2">{cli.direccion}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => empezarEdicion(cli)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs mr-2 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarCliente(cli.telefono)}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-xs transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}







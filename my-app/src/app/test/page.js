'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestConn() {
  // estado formulario
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')

  // estado lista y ui
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false) // modo edición (bloquea teléfono)

  // cargar clientes al montar
  useEffect(() => {
    fetchClientes()
  }, [])

  async function fetchClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false })
    if (!error) setClientes(data || [])
  }

  function limpiarForm() {
    setTelefono('')
    setNombre('')
    setDireccion('')
    setEditing(false)
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
      alert('Error: ' + error.message)
    } else {
      alert(editing ? '✅ Cliente modificado.' : '✅ Cliente guardado.')
      limpiarForm()
      fetchClientes()
    }
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Formulario */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          📱 Prueba de conexión con Supabase
        </h2>
        <p className="text-gray-600 mb-4">
          El dato clave es el <b>Teléfono</b>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Ej: 912345678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border rounded-md p-2"
            disabled={editing} // bloquear teléfono al editar
          />
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Ej: Av. Principal 123"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="border rounded-md p-2"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={guardarOModificar}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-60"
          >
            {loading ? 'Guardando...' : editing ? 'Modificar' : 'Guardar'}
          </button>

          {editing && (
            <button
              onClick={limpiarForm}
              className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          📋 Lista de Clientes
        </h3>
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o dirección"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border rounded-md p-2 mt-3 w-full"
        />

        {clientesFiltrados.length === 0 ? (
          <p className="text-gray-500 mt-6 text-center">Sin resultados</p>
        ) : (
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Teléfono</th>
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Dirección</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cli) => (
                <tr key={cli.id ?? cli.telefono}>
                  <td className="border p-2">{cli.telefono}</td>
                  <td className="border p-2">{cli.nombre}</td>
                  <td className="border p-2">{cli.direccion}</td>
                  <td className="border p-2">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => empezarEdicion(cli)}
                        className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarCliente(cli.telefono)}
                        className="px-3 py-1 rounded-md bg-rose-500 text-white hover:bg-rose-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}


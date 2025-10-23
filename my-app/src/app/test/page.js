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

    // 🟢 Escucha en tiempo real los cambios en la tabla
    const channel = supabase
      .channel('realtime:clientes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => fetchClientes()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchClientes() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('telefono, nombre, direccion')
        .order('telefono', { ascending: true })
      if (error) throw error
      console.log('CLIENTES:', data)
      setClientes(data || [])
    } catch (e) {
      console.error('Error al cargar clientes:', e)
    }
  }

  async function guardarOModificar() {
    if (!telefono.trim()) {
      alert('El teléfono es obligatorio.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('clientes')
        .upsert([{ telefono, nombre, direccion }], { onConflict: 'telefono' })
      if (error) throw error

      alert(editing ? '✅ Cliente modificado.' : '✅ Cliente guardado.')
      setTelefono('')
      setNombre('')
      setDireccion('')
      setEditing(false)
      await fetchClientes()
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function empezarEdicion(cli) {
    setTelefono(cli.telefono)
    setNombre(cli.nombre)
    setDireccion(cli.direccion)
    setEditing(true)
  }

  async function eliminarCliente(tel) {
    if (!confirm(`¿Eliminar cliente con teléfono ${tel}?`)) return
    const { error } = await supabase.from('clientes').delete().eq('telefono', tel)
    if (error) {
      alert('No se pudo eliminar: ' + error.message)
    } else {
      alert('🗑️ Cliente eliminado.')
      fetchClientes()
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    [c.telefono, c.nombre, c.direccion].join(' ').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">📱 Prueba de conexión con Supabase</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            disabled={editing}
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="border p-2 rounded-md"
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
              onClick={() => {
                setEditing(false)
                setTelefono('')
                setNombre('')
                setDireccion('')
              }}
              className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-3">📋 Lista de Clientes</h3>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-2 w-full rounded-md"
        />
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Teléfono</th>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Dirección</th>
              <th className="border p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">
                  Sin resultados
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cli) => (
                <tr key={cli.telefono}>
                  <td className="border p-2">{cli.telefono}</td>
                  <td className="border p-2">{cli.nombre}</td>
                  <td className="border p-2">{cli.direccion}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => empezarEdicion(cli)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCliente(cli.telefono)}
                      className="px-3 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



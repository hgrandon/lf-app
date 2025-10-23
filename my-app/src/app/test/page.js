'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Iconitos simples (emoji) para mantenerlo sin dependencias
const IconPhone = () => <span className="mr-2">📱</span>
const IconList  = () => <span className="mr-2">📋</span>

export default function TestConn() {
  // formulario
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')

  // ui/estado
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  // carga + realtime
  useEffect(() => {
    fetchClientes()

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
      setClientes(data ?? [])
    } catch (e) {
      console.error('SELECT error ->', e)
      alert('No se pudo cargar la lista: ' + (e?.message || 'Error desconocido'))
    }
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
    try {
      const { error } = await supabase
        .from('clientes')
        .upsert([{ telefono, nombre, direccion }], { onConflict: 'telefono' })

      if (error) throw error
      alert(editing ? '✅ Cliente modificado.' : '✅ Cliente guardado.')
      limpiarForm()
      await fetchClientes()
    } catch (e) {
      console.error('UPSERT error ->', e)
      alert('No se pudo guardar: ' + (e?.message || 'Error desconocido'))
    } finally {
      setLoading(false)
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
    try {
      const { error } = await supabase.from('clientes').delete().eq('telefono', tel)
      if (error) throw error
      alert('🗑️ Cliente eliminado.')
      if (editing && tel === telefono) limpiarForm()
      await fetchClientes()
    } catch (e) {
      console.error('DELETE error ->', e)
      alert('No se pudo eliminar: ' + (e?.message || 'Error desconocido'))
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    `${c.telefono ?? ''} ${c.nombre ?? ''} ${c.direccion ?? ''}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
            <IconPhone />
            Prueba de conexión con Supabase
          </h1>
          <p className="text-slate-500 mt-1">
            El dato clave es el <b>Teléfono</b> (único). Usa el formulario para crear o editar.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        {/* Card Formulario */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="text-sm text-slate-600 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: 997759812"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={editing}
                  className="rounded-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500 disabled:opacity-60"
                />
                {editing && (
                  <span className="mt-1 text-xs text-purple-600">
                    Modo edición: el teléfono está bloqueado
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="rounded-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-slate-600 mb-1">Dirección</label>
                <input
                  type="text"
                  placeholder="Ej: Av. Principal 123"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="rounded-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={guardarOModificar}
                disabled={loading}
                className="inline-flex items-center rounded-lg bg-purple-600 px-5 py-2.5 text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
              >
                {loading ? 'Guardando…' : editing ? 'Modificar' : 'Guardar'}
              </button>

              {editing && (
                <button
                  onClick={limpiarForm}
                  className="inline-flex items-center rounded-lg border px-5 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card Lista */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
                <IconList />
                Lista de Clientes
                <span className="ml-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {clientesFiltrados.length} registro(s)
                </span>
              </h2>

              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o dirección…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full md:w-80 rounded-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Tabla */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-sm">
                    <th className="border-b p-3">Teléfono</th>
                    <th className="border-b p-3">Nombre</th>
                    <th className="border-b p-3">Dirección</th>
                    <th className="border-b p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {clientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.map((cli, idx) => (
                      <tr
                        key={cli.telefono}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                      >
                        <td className="p-3 border-b">{cli.telefono}</td>
                        <td className="p-3 border-b">{cli.nombre}</td>
                        <td className="p-3 border-b">{cli.direccion}</td>
                        <td className="p-3 border-b">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => empezarEdicion(cli)}
                              className="rounded-md bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarCliente(cli.telefono)}
                              className="rounded-md bg-rose-500 px-3 py-1.5 text-white hover:bg-rose-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}




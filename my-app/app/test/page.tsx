'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Cliente {
  telefono: string
  nombre: string
  direccion: string
}

export default function TestConn() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    cargarClientes()
  }, [])

  async function cargarClientes() {
    const { data, error } = await supabase.from('clientes').select('*')
    if (!error && data) setClientes(data)
  }

  async function guardarCliente() {
    if (!telefono) return alert('El teléfono es obligatorio')
    const nuevo = { telefono, nombre, direccion }
    if (editando) {
      await supabase.from('clientes').update(nuevo).eq('telefono', telefono)
    } else {
      await supabase.from('clientes').upsert(nuevo)
    }
    limpiarFormulario()
    cargarClientes()
  }

  function editarCliente(c: Cliente) {
    setTelefono(c.telefono)
    setNombre(c.nombre)
    setDireccion(c.direccion)
    setEditando(true)
  }

  async function eliminarCliente(tel: string) {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clientes').delete().eq('telefono', tel)
    cargarClientes()
  }

  function limpiarFormulario() {
    setTelefono('')
    setNombre('')
    setDireccion('')
    setEditando(false)
  }

  const clientesFiltrados = clientes.filter(
    c =>
      c.telefono.includes(busqueda) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="section">
      <h1>📱 Prueba de conexión con Supabase</h1>
      <p className="text-center text-gray-600 mb-6">
        El dato clave es el <b>Teléfono</b>. Usa el formulario para crear o editar.
      </p>

      <div className="form-card">
        <label>Teléfono</label>
        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} />
        <label>Nombre</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
        <label>Dirección</label>
        <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} />

        <div className="flex gap-2 justify-center mt-2">
          <button onClick={guardarCliente}>
            {editando ? 'Actualizar' : 'Guardar'}
          </button>
          {editando && (
            <button
              className="bg-gray-400 hover:bg-gray-500"
              onClick={limpiarFormulario}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <h2>📋 Lista de Clientes ({clientes.length})</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o teléfono"
        className="search"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Teléfono</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((c, i) => (
            <tr key={i}>
              <td>{c.telefono}</td>
              <td>{c.nombre}</td>
              <td>{c.direccion}</td>
              <td className="flex gap-2">
                <button onClick={() => editarCliente(c)}>Editar</button>
                <button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => eliminarCliente(c.telefono)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
